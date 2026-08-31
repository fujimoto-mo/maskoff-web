import type { Env } from "./index";
import { json } from "./index";

/**
 * microCMS Webhook → GitHub Actions workflow_dispatch
 * microCMS 側: 「カスタム通知」URL = https://<domain>/api/rebuild、シークレット = MICROCMS_WEBHOOK_SECRET
 * 署名は X-MICROCMS-Signature (HMAC-SHA256, hex) で検証。
 */
async function verifySignature(body: string, sig: string | null, secret: string) {
  if (!sig) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === sig;
}

export async function handleRebuild(req: Request, env: Env): Promise<Response> {
  const body = await req.text();
  if (!(await verifySignature(body, req.headers.get("x-microcms-signature"), env.MICROCMS_WEBHOOK_SECRET))) {
    return json({ ok: false, error: "invalid signature" }, 401);
  }
  // 連打対策: 60秒に1回まで
  const lock = await env.RATE_LIMIT.get("rebuild:lock");
  if (lock) return json({ ok: true, skipped: true });
  await env.RATE_LIMIT.put("rebuild:lock", "1", { expirationTtl: 60 });

  const r = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/deploy.yml/dispatches`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": "maskoff-site-worker",
      "content-type": "application/json",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  if (r.status !== 204) return json({ ok: false, error: `GitHub ${r.status}` }, 502);
  return json({ ok: true });
}
