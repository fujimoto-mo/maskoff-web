import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "./index.ts";
import type { Env } from "./index.ts";

const env = (contentType: string): Env =>
  ({
    ASSETS: { fetch: async () => new Response("<html></html>", { status: 200, headers: { "content-type": contentType } }) },
    RATE_LIMIT: {},
    NEXT_PUBLIC_SITE_URL: "https://staging.maskoff-web-pages.pages.dev",
    CONTACT_FROM_EMAIL: "",
    CONTACT_TO_EMAIL: "",
    RESEND_API_KEY: "",
    TURNSTILE_SECRET_KEY: "",
    MICROCMS_WEBHOOK_SECRET: "",
    CF_DEPLOY_HOOK_URL: "",
  }) as unknown as Env;
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;

test("プレビュー（*.pages.dev）の HTML には X-Robots-Tag: noindex が付き、本番ドメインには付かない", async () => {
  const preview = await worker.fetch(new Request("https://staging.maskoff-web-pages.pages.dev/company/"), env("text/html; charset=utf-8"), ctx);
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(await preview.text(), "<html></html>");
  const prod = await worker.fetch(new Request("https://www.maskoff.co.jp/company/"), env("text/html; charset=utf-8"), ctx);
  assert.equal(prod.headers.get("x-robots-tag"), null);
});

test("プレビューでも HTML 以外（JSON など）にはヘッダーを付けない", async () => {
  const res = await worker.fetch(new Request("https://staging.maskoff-web-pages.pages.dev/data.json"), env("application/json"), ctx);
  assert.equal(res.headers.get("x-robots-tag"), null);
});
