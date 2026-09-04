import { handleContact } from "./contact.ts";
import { json } from "./lib/json.ts";
import { maintenanceResponse } from "./maintenance.ts";
import { handleRebuild } from "./rebuild.ts";
import { canonicalRedirect, isStaticAsset } from "./routes.ts";

/**
 * Cloudflare Pages（Advanced mode）の _worker.js エントリ。scripts/build-worker.mjs が out/_worker.js に 1 枚へバンドルする。
 * 全リクエストがここを通る（_routes.json で除外した静的アセット・旧 URL は Pages が直接配信し、ここには来ない）。
 * 名前は CLAUDE.md §13 に一致させる（wrangler.toml [vars] / Pages の暗号化変数 / .dev.vars）
 */
export interface Env {
  /** Pages が自動提供する静的アセット配信 */
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;
  /** 正規 URL。canonical / OGP / sitemap と同じ値。フォームの Origin 検証と www → apex の 301 に使う */
  NEXT_PUBLIC_SITE_URL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
  /** "1" でメンテナンス（/api/rebuild と静的アセット以外は 503）。wrangler.toml [vars] で切替 */
  MAINTENANCE?: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  /** Pages の Deploy Hook URL（暗号化変数）。microCMS 更新時の再ビルドに使う */
  CF_DEPLOY_HOOK_URL: string;
  SLACK_WEBHOOK_URL?: string;
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    // www → apex（_redirects は Function 経由のリクエストには効かないため Worker で行う）
    const canonical = canonicalRedirect(url, env.NEXT_PUBLIC_SITE_URL);
    if (canonical) return Response.redirect(canonical, 301);

    const maintenance = env.MAINTENANCE === "1";
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
    // 静的アセットは _routes.json で除外済みだが、除外漏れがあってもメンテ画面の画像・フォントが 503 にならないよう二重に守る
    if (maintenance && !isStaticAsset(url.pathname)) return maintenanceResponse(env.CONTACT_TO_EMAIL);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
