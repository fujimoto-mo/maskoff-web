import { handleContact } from "./contact.ts";
import { json } from "./lib/json.ts";
import { maintenanceResponse } from "./maintenance.ts";
import { handleRebuild } from "./rebuild.ts";

// 名前は CLAUDE.md §13 に一致させる（wrangler.toml [vars] / wrangler secret put / .dev.vars）
export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;
  SITE_URL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
  GITHUB_REPO: string;
  /** "1" でメンテナンス（/api/rebuild 以外は 503）。wrangler.toml [vars] で切替 */
  MAINTENANCE?: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  GITHUB_DISPATCH_TOKEN: string;
  SLACK_WEBHOOK_URL?: string;
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    const maintenance = env.MAINTENANCE === "1";
    // run_worker_first: /api/* と HTML ページがここに来る。_next / images / fonts / videos 等は Worker を通らず静的配信
    if (url.pathname === "/api/contact") {
      if (maintenance) return json({ ok: false, error: "Service Unavailable" }, 503, { "retry-after": "3600" });
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleContact(req, env, ctx);
    }
    // microCMS 更新 → 再ビルドはメンテ中も通す（復帰時に最新コンテンツで戻れるように）
    if (url.pathname === "/api/rebuild") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleRebuild(req, env);
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Not Found" }, 404);
    if (maintenance) return maintenanceResponse(env.CONTACT_TO_EMAIL);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
