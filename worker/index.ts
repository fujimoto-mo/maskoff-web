import { handleContact } from "./contact";
import { handleRebuild } from "./rebuild";

export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;
  SITE_URL: string;
  MAIL_FROM: string;
  MAIL_TO: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  GITHUB_TOKEN: string;
}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);

    // run_worker_first = ["/api/*"] のため、ここに来るのは /api/* のみ（他は静的配信）
    if (url.pathname === "/api/contact") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      const origin = req.headers.get("origin") ?? "";
      if (!origin.startsWith(env.SITE_URL) && !origin.startsWith("http://localhost")) return json({ ok: false, error: "Forbidden" }, 403);
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

export { json };
