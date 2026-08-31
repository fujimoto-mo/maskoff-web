/**
 * Worker エントリポイント。
 *
 * wrangler.toml の run_worker_first = ["/api/*"] により、
 * このコードが呼ばれるのは /api/* へのリクエストだけ。
 * それ以外（HTML / CSS / JS / 画像）は Cloudflare が静的アセットとして
 * 直接配信するため、Worker のリクエスト数を消費しない。
 *
 * 結果として月間の Worker 消費はフォーム送信と再ビルド通知のみになり、
 * 無料枠（10万リクエスト/日）で十分に収まる。
 */

import { handleContact } from "./contact";
import { handleRebuild } from "./rebuild";

export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;

  // vars（wrangler.toml）
  SITE_URL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
  GITHUB_REPO: string;

  // secrets（wrangler secret put で登録）
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  GITHUB_DISPATCH_TOKEN: string;
  SLACK_WEBHOOK_URL?: string;
}

function methodNotAllowed(allow: string): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: allow },
  });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url);

    switch (pathname) {
      case "/api/contact":
        if (request.method !== "POST") return methodNotAllowed("POST");
        return handleContact(request, env, ctx);

      case "/api/rebuild":
        if (request.method !== "POST") return methodNotAllowed("POST");
        return handleRebuild(request, env);

      case "/api/health":
        return new Response("ok", { status: 200 });
    }

    // run_worker_first の設定上、ここに来るのは /api/ 配下の未定義パスのみ。
    // 念のため静的アセット側へフォールバックする。
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
