import type { Env } from "./index.ts";
import { json } from "./lib/json.ts";

/**
 * microCMS Webhook → Cloudflare Pages の Deploy Hook
 * microCMS 側: 「カスタム通知」URL = https://<domain>/api/rebuild、シークレット = MICROCMS_WEBHOOK_SECRET
 * 署名は X-MICROCMS-Signature (HMAC-SHA256, hex) で検証。
 * - シークレット未設定なら必ず拒否（フェイルクローズ。未設定のまま公開しても穴にならない）
 * - 比較は crypto.subtle.verify（定数時間）。hex の手組み比較はしない
 * - 署名が正しくても 60 秒に 1 回しか Deploy Hook を叩かない（連打・リプレイでビルド枠を消費されない）
 * Deploy Hook の URL は知っていれば誰でもビルドを起動できるため、Pages の暗号化変数 CF_DEPLOY_HOOK_URL に置く。
 */
const enc = new TextEncoder();

/** hex 文字列 → bytes。hex でない・奇数長なら null */
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function verifySignature(body: string, sig: string | null, secret: string | undefined): Promise<boolean> {
  if (!secret || !sig) return false;
  const bytes = hexToBytes(sig);
  if (!bytes || bytes.length !== 32) return false; // SHA-256 は 32 バイト
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, bytes, enc.encode(body));
}

export async function handleRebuild(req: Request, env: Env, fetchFn: typeof fetch = fetch): Promise<Response> {
  const body = await req.text();
  if (!(await verifySignature(body, req.headers.get("x-microcms-signature"), env.MICROCMS_WEBHOOK_SECRET))) {
    return json({ ok: false, error: "invalid signature" }, 401);
  }
  if (!env.CF_DEPLOY_HOOK_URL) {
    console.error("CF_DEPLOY_HOOK_URL が未設定です");
    return json({ ok: false, error: "deploy hook not configured" }, 500);
  }
  // 連打対策: 60秒に1回まで
  const lock = await env.RATE_LIMIT.get("rebuild:lock");
  if (lock) return json({ ok: true, skipped: true });
  await env.RATE_LIMIT.put("rebuild:lock", "1", { expirationTtl: 60 });

  const r = await fetchFn(env.CF_DEPLOY_HOOK_URL, { method: "POST" });
  if (!r.ok) return json({ ok: false, error: `Deploy Hook ${r.status}` }, 502);
  return json({ ok: true });
}
