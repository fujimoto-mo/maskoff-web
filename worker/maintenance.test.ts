import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "./index.ts";
import type { Env } from "./index.ts";
import { maintenanceResponse } from "./maintenance.ts";

function makeEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    ASSETS: {
      fetch: async (r: Request) =>
        new Response(`asset:${new URL(r.url).pathname}`, { status: 200 }),
    },
    RATE_LIMIT: { get: async () => null, put: async () => undefined },
    NEXT_PUBLIC_SITE_URL: "https://maskoff.co.jp",
    CONTACT_FROM_EMAIL: "MasKOFF <noreply@maskoff.co.jp>",
    CONTACT_TO_EMAIL: "info@maskoff.co.jp",
    RESEND_API_KEY: "re_test",
    TURNSTILE_SECRET_KEY: "test-secret",
    MICROCMS_WEBHOOK_SECRET: "s",
    CF_DEPLOY_HOOK_URL: "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/test",
    MAINTENANCE: "0",
    ...overrides,
  } as unknown as Env;
}
const ctx = {
  waitUntil: (p: Promise<unknown>) => void p,
  passThroughOnException: () => undefined,
} as unknown as ExecutionContext;
const get = (path: string) => new Request(`https://maskoff.co.jp${path}`);

test("maintenanceResponse: 503 / Retry-After / no-store / HTML に文言と連絡先", async () => {
  const res = maintenanceResponse("info@maskoff.co.jp");
  assert.equal(res.status, 503);
  assert.equal(res.headers.get("retry-after"), "3600");
  assert.match(res.headers.get("content-type") ?? "", /text\/html/);
  assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  const html = await res.text();
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /MAINTENANCE/);
  assert.match(html, /ただいまメンテナンス中です/);
  assert.match(html, /mailto:info@maskoff\.co\.jp/);
  assert.match(html, /name="robots" content="noindex"/);
});

test("MAINTENANCE=1: ページは 503 のメンテ画面", async () => {
  const res = await worker.fetch(
    get("/company/"),
    makeEnv({ MAINTENANCE: "1" }),
    ctx,
  );
  assert.equal(res.status, 503);
  assert.match(await res.text(), /ただいまメンテナンス中です/);
});

test("MAINTENANCE=1: /api/contact は 503 JSON（送信を受け付けない）", async () => {
  const req = new Request("https://maskoff.co.jp/api/contact", {
    method: "POST",
    body: "{}",
  });
  const res = await worker.fetch(req, makeEnv({ MAINTENANCE: "1" }), ctx);
  assert.equal(res.status, 503);
  assert.match(res.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await res.json(), {
    ok: false,
    error: "Service Unavailable",
  });
});

test("MAINTENANCE=1: /api/rebuild はメンテ中も通常処理（署名なしなら 401）", async () => {
  const req = new Request("https://maskoff.co.jp/api/rebuild", {
    method: "POST",
    body: "{}",
  });
  const res = await worker.fetch(req, makeEnv({ MAINTENANCE: "1" }), ctx);
  assert.equal(res.status, 401);
});

test("MAINTENANCE=0: 静的配信へそのまま渡す", async () => {
  const res = await worker.fetch(
    get("/company/"),
    makeEnv({ MAINTENANCE: "0" }),
    ctx,
  );
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "asset:/company/");
});

test("MAINTENANCE 未設定: 静的配信へそのまま渡す（安全側）", async () => {
  const res = await worker.fetch(
    get("/"),
    makeEnv({ MAINTENANCE: undefined }),
    ctx,
  );
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "asset:/");
});

test("未知の /api/* は 404 のまま", async () => {
  const res = await worker.fetch(get("/api/nope"), makeEnv(), ctx);
  assert.equal(res.status, 404);
});
