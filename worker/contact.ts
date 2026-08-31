/**
 * お問い合わせフォームの受信処理。
 *
 * worker/index.ts から POST /api/contact のときだけ呼ばれる。
 *
 * 注意: Workers 無料枠は CPU 10ms/リクエスト。
 * 外部API（Turnstile / Resend）の待ち時間は CPU 時間に含まれないため
 * 問題ないが、重い同期処理をここに足さないこと。
 */

import type { Env } from "./index";

const CATEGORY_LABELS: Record<string, string> = {
  web: "ホームページ制作・デザイン",
  apparel: "アパレル・OEM",
  artist: "アーティスト活動支援",
  recruit: "採用について",
  other: "その他",
};

type Payload = {
  company?: string;
  name?: string;
  email?: string;
  tel?: string;
  category?: string;
  message?: string;
  consent?: boolean;
  website?: string; // ハニーポット
  turnstileToken?: string;
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * サーバー側バリデーション。
 * クライアント側の zod スキーマ（src/lib/schema/contact.ts）と同じ条件を保つこと。
 * 片方だけ直すと、開発者ツールから制限を回避できてしまう。
 */
function validate(p: Payload): string[] {
  const errors: string[] = [];
  const name = (p.name ?? "").trim();
  const email = (p.email ?? "").trim();
  const message = (p.message ?? "").trim();

  if (!name || name.length > 50) errors.push("お名前を50文字以内で入力してください");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    errors.push("メールアドレスの形式が正しくありません");
  if ((p.company ?? "").length > 100) errors.push("会社名が長すぎます");
  if ((p.tel ?? "") && !/^[0-9+\-() ]{0,20}$/.test(p.tel!))
    errors.push("電話番号の形式が正しくありません");
  if (!p.category || !(p.category in CATEGORY_LABELS))
    errors.push("お問い合わせ種別を選択してください");
  if (message.length < 10 || message.length > 2000)
    errors.push("お問い合わせ内容は10〜2000文字で入力してください");
  if (p.consent !== true) errors.push("プライバシーポリシーへの同意が必要です");
  if (!p.turnstileToken) errors.push("認証が完了していません");

  return errors;
}

/** KV による簡易レート制限。10分あたり3回まで。 */
async function isRateLimited(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `contact:${ip}`;
  const current = Number((await kv.get(key)) ?? "0");
  if (current >= 3) return true;
  await kv.put(key, String(current + 1), { expirationTtl: 600 });
  return false;
}

async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string,
): Promise<boolean> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    },
  );
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

async function sendMail(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

export async function handleContact(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  // 1. レート制限
  if (await isRateLimited(env.RATE_LIMIT, ip)) {
    return json(
      { error: "送信回数の上限に達しました。しばらく時間をおいてお試しください。" },
      429,
    );
  }

  // 2. パース
  let p: Payload;
  try {
    p = (await request.json()) as Payload;
  } catch {
    return json({ error: "リクエストが不正です。" }, 400);
  }

  // 3. ハニーポット。値が入っていれば Bot。
  //    エラーを返すと検知の仕組みを教えることになるので、成功を装って破棄する。
  if (p.website) return json({ ok: true }, 200);

  // 4. バリデーション
  const errors = validate(p);
  if (errors.length > 0) {
    return json({ error: "入力内容をご確認ください。", issues: errors }, 400);
  }

  // 5. Turnstile
  if (!(await verifyTurnstile(p.turnstileToken!, ip, env.TURNSTILE_SECRET_KEY))) {
    return json(
      { error: "認証に失敗しました。ページを再読み込みしてお試しください。" },
      400,
    );
  }

  const categoryLabel = CATEGORY_LABELS[p.category!];
  const receivedAt = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  try {
    // 6. 管理者へ通知
    await sendMail(env.RESEND_API_KEY, {
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      reply_to: p.email,
      subject: `【お問い合わせ】${categoryLabel} / ${p.name} 様`,
      html: `
        <h2>お問い合わせを受信しました</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><th align="left">受信日時</th><td>${esc(receivedAt)}</td></tr>
          <tr><th align="left">種別</th><td>${esc(categoryLabel)}</td></tr>
          <tr><th align="left">会社名</th><td>${esc(p.company || "-")}</td></tr>
          <tr><th align="left">お名前</th><td>${esc(p.name!)}</td></tr>
          <tr><th align="left">メール</th><td>${esc(p.email!)}</td></tr>
          <tr><th align="left">電話</th><td>${esc(p.tel || "-")}</td></tr>
        </table>
        <h3>お問い合わせ内容</h3>
        <p style="white-space:pre-wrap">${esc(p.message!)}</p>
      `,
    });

    // 7. 送信者へ自動返信
    await sendMail(env.RESEND_API_KEY, {
      from: env.CONTACT_FROM_EMAIL,
      to: p.email,
      subject: "【株式会社MasKOFF】お問い合わせありがとうございます",
      text: [
        `${p.name} 様`,
        "",
        "この度は株式会社MasKOFFへお問い合わせいただき、ありがとうございます。",
        "以下の内容で承りました。担当者より2営業日以内にご返信いたします。",
        "",
        "──────────────────",
        `種別　　： ${categoryLabel}`,
        `会社名　： ${p.company || "-"}`,
        `お名前　： ${p.name}`,
        `メール　： ${p.email}`,
        `電話　　： ${p.tel || "-"}`,
        "",
        "お問い合わせ内容：",
        p.message,
        "──────────────────",
        "",
        "※本メールは自動送信です。ご返信いただいても対応できません。",
        "",
        "株式会社MasKOFF",
        env.SITE_URL,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[contact] mail send failed", err);
    if (env.SLACK_WEBHOOK_URL) {
      ctx.waitUntil(
        fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `:warning: お問い合わせメール送信に失敗\n${p.name} / ${p.email}`,
          }),
        }),
      );
    }
    return json(
      {
        error:
          "送信に失敗しました。お手数ですが時間をおいて再度お試しいただくか、お電話にてご連絡ください。",
      },
      500,
    );
  }

  // 8. 送信ログを Slack へ。レスポンスは待たせない。
  if (env.SLACK_WEBHOOK_URL) {
    ctx.waitUntil(
      fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `:inbox_tray: お問い合わせ受信\n種別: ${categoryLabel}\n名前: ${p.name}\nメール: ${p.email}`,
        }),
      }),
    );
  }

  return json({ ok: true }, 200);
}
