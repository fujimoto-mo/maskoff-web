import { handleContact } from "./contact.ts";
import { json } from "./lib/json.ts";
import { handleRebuild } from "./rebuild.ts";

// 名前は CLAUDE.md §13 に一致させる（wrangler.toml [vars] / wrangler secret put / .dev.vars）
export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;
  SITE_URL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  GITHUB_DISPATCH_TOKEN: string;
  SLACK_WEBHOOK_URL?: string;
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    // run_worker_first = ["/api/*"] のため、ここに来るのは /api/* のみ（他は静的配信）
    if (url.pathname === "/api/contact") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleContact(req, env, ctx);
    }
    if (url.pathname === "/api/rebuild") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleRebuild(req, env);
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Not Found" }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
