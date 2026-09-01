import { z } from "zod";
import { CATEGORY_LABELS, contactSchema, type ContactInput } from "../src/lib/schema/contact.ts";
import type { Env } from "./index.ts";
import { json } from "./lib/json.ts";

export const RATE_LIMIT_MAX = 5;
export type Deps = { fetchFn: typeof fetch };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function verifyTurnstile(token: string, secret: string, ip: string | null, fetchFn: typeof fetch) {
  if (!secret) return true; // ローカル開発（.dev.vars 未設定）では検証をスキップ
  const r = await fetchFn("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
  });
  const j = (await r.json()) as { success: boolean };
  return j.success;
}

async function sendMail(env: Env, fetchFn: typeof fetch, payload: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const r = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, reply_to: payload.replyTo, ...payload }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

async function notifySlack(env: Env, fetchFn: typeof fetch, text: string) {
  if (!env.SLACK_WEBHOOK_URL) return;
  await fetchFn(env.SLACK_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }).catch(() => undefined);
}

function rowsOf(d: ContactInput) {
  return [
    ["会社名", d.company ?? ""],
    ["お名前", d.name],
    ["メール", d.email],
    ["電話", d.tel ?? ""],
    ["種別", CATEGORY_LABELS[d.category]],
    ["内容", d.message],
  ] as const;
}

/**
 * POST /api/contact。順序: Origin → レート制限 → ハニーポット → zod → Turnstile → Resend → Slack。
 * 検証ルールは src/lib/schema/contact.ts のみ。ここに手書きの検証を足さない（CLAUDE.md §2-7）。
 */
export async function handleContact(req: Request, env: Env, ctx: ExecutionContext, deps: Deps = { fetchFn: fetch }): Promise<Response> {
  const origin = req.headers.get("origin") ?? "";
  if (!origin.startsWith(env.SITE_URL) && !origin.startsWith("http://localhost")) return json({ ok: false, error: "Forbidden" }, 403);

  const ip = req.headers.get("cf-connecting-ip");
  if (ip) {
    const key = `contact:${ip}`;
    const n = Number((await env.RATE_LIMIT.get(key)) ?? 0);
    if (n >= RATE_LIMIT_MAX) return json({ ok: false, error: "送信回数の上限に達しました。しばらくしてからお試しください。" }, 429);
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(n + 1), { expirationTtl: 3600 }));
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "リクエストの形式が正しくありません。" }, 400);
  }

  // ハニーポット: 成功に見せて捨てる
  if (typeof body === "object" && body !== null && String((body as { website?: unknown }).website ?? "") !== "") return json({ ok: true });

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const f = z.flattenError(parsed.error).fieldErrors;
    const errors = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0] ?? "入力内容を確認してください"]));
    return json({ ok: false, error: "入力内容を確認してください。", errors }, 400);
  }
  const data = parsed.data;

  if (!(await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip, deps.fetchFn))) {
    return json({ ok: false, error: "スパム対策の確認に失敗しました。ページを再読み込みしてお試しください。" }, 400);
  }

  const rows = rowsOf(data);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table>${rows.map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${k}</th><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;

  try {
    await Promise.all([
      sendMail(env, deps.fetchFn, { to: env.CONTACT_TO_EMAIL, subject: `【お問い合わせ】${data.name} 様${data.company ? `（${data.company}）` : ""}`, html, text, replyTo: data.email }),
      sendMail(env, deps.fetchFn, {
        to: data.email,
        subject: "【株式会社MasKOFF】お問い合わせを受け付けました",
        text: `${data.name} 様\n\nお問い合わせありがとうございます。以下の内容で受け付けました。担当より 2 営業日以内にご連絡いたします。\n\n${text}\n\n株式会社MasKOFF`,
        html: `<p>${esc(data.name)} 様</p><p>お問い合わせありがとうございます。以下の内容で受け付けました。担当より 2 営業日以内にご連絡いたします。</p>${html}<p>株式会社MasKOFF</p>`,
      }),
    ]);
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "メール送信に失敗しました。時間をおいて再度お試しください。" }, 502);
  }

  ctx.waitUntil(notifySlack(env, deps.fetchFn, `お問い合わせ: ${data.name}（${CATEGORY_LABELS[data.category]}）`));
  return json({ ok: true });
}
