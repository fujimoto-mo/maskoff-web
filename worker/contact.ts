import type { Env } from "./index";
import { json } from "./index";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const str = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  if (!secret) return true; // ローカル開発（.dev.vars 未設定）では検証をスキップ
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
  });
  const j = (await r.json()) as { success: boolean };
  return j.success;
}

async function sendMail(env: Env, payload: { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, reply_to: payload.replyTo, ...payload }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

export async function handleContact(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = req.headers.get("cf-connecting-ip");

  // レート制限: 同一IP 5件/時（KV）
  if (ip) {
    const key = `contact:${ip}`;
    const n = Number((await env.RATE_LIMIT.get(key)) ?? 0);
    if (n >= 5) return json({ ok: false, error: "送信回数の上限に達しました。しばらくしてからお試しください。" }, 429);
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(n + 1), { expirationTtl: 3600 }));
  }

  const fd = await req.formData();
  if (str(fd, "website", 10)) return json({ ok: true }); // honeypot: 成功に見せて捨てる

  const data = {
    company: str(fd, "company", 100),
    name: str(fd, "name", 60),
    email: str(fd, "email", 120),
    tel: str(fd, "tel", 20),
    service: str(fd, "service", 60),
    message: str(fd, "message", 800),
  };
  if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json({ ok: false, error: "必須項目を確認してください。" }, 400);
  }
  if (!(await verifyTurnstile(str(fd, "turnstile", 2048), env.TURNSTILE_SECRET_KEY, ip))) {
    return json({ ok: false, error: "スパム対策の確認に失敗しました。ページを再読み込みしてお試しください。" }, 400);
  }

  const rows = [["会社名", data.company], ["お名前", data.name], ["メール", data.email], ["電話", data.tel], ["事業", data.service], ["内容", data.message]];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table>${rows.map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${k}</th><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;

  try {
    await Promise.all([
      sendMail(env, { to: env.MAIL_TO, subject: `【お問い合わせ】${data.name} 様${data.company ? `（${data.company}）` : ""}`, html, text, replyTo: data.email }),
      sendMail(env, {
        to: data.email,
        subject: "【株式会社MasKOFF】お問い合わせを受け付けました",
        text: `${data.name} 様\n\nお問い合わせありがとうございます。以下の内容で受け付けました。担当より2営業日以内にご連絡いたします。\n\n${text}\n\n株式会社MasKOFF`,
        html: `<p>${esc(data.name)} 様</p><p>お問い合わせありがとうございます。以下の内容で受け付けました。担当より2営業日以内にご連絡いたします。</p>${html}<p>株式会社MasKOFF</p>`,
      }),
    ]);
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "メール送信に失敗しました。時間をおいて再度お試しください。" }, 502);
  }
  return json({ ok: true });
}
