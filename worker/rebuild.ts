/**
 * microCMS の Webhook を受けて再ビルドを起動する。
 *
 *   microCMS でコンテンツを更新
 *     → POST /api/rebuild（このハンドラ）
 *     → GitHub API の repository_dispatch
 *     → GitHub Actions が npm run build && wrangler deploy
 *     → 1〜2分で公開
 *
 * Cloudflare Pages の Deploy Hook に相当する仕組みを、
 * Workers 構成では自前で用意する必要がある。ここがその実装。
 *
 * microCMS 側の設定:
 *   API設定 > Webhook > カスタム通知
 *   URL     : https://maskoff.co.jp/api/rebuild
 *   シークレット: MICROCMS_WEBHOOK_SECRET と同じ値
 */

import type { Env } from "./index";

/**
 * microCMS の署名検証。
 * X-MICROCMS-Signature に HMAC-SHA256(secret, body) の hex が入る。
 */
async function verifySignature(
  body: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // タイミング攻撃対策の定数時間比較
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function handleRebuild(
  request: Request,
  env: Env,
): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("X-MICROCMS-Signature");

  if (!(await verifySignature(body, signature, env.MICROCMS_WEBHOOK_SECRET))) {
    return new Response("Forbidden", { status: 403 });
  }

  // どの API が更新されたかをログに残す（デバッグ用）
  let apiId = "unknown";
  try {
    apiId = (JSON.parse(body) as { api?: string }).api ?? "unknown";
  } catch {
    // 本文が読めなくても再ビルドは実行する
  }

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "maskoff-web-worker",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "microcms-update",
        client_payload: { api: apiId },
      }),
    },
  );

  if (!res.ok) {
    console.error("[rebuild] dispatch failed", res.status, await res.text());
    return new Response("Dispatch failed", { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true, api: apiId }), {
    status: 202,
    headers: { "Content-Type": "application/json" },
  });
}
