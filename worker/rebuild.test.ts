import { test } from "node:test";
import assert from "node:assert/strict";
import { handleRebuild, verifySignature } from "./rebuild.ts";
import type { Env } from "./index.ts";

const SECRET = "s3cret-for-test";
const enc = new TextEncoder();

/** microCMS と同じ署名: HMAC-SHA256(body, secret) の hex */
async function sign(body: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function makeEnv(kv: Map<string, string>, overrides: Record<string, unknown> = {}): Env {
  return {
    ASSETS: { fetch: async () => new Response("") },
    RATE_LIMIT: {
      get: async (k: string) => kv.get(k) ?? null,
      put: async (k: string, v: string) => {
        kv.set(k, v);
      },
    },
    SITE_URL: "https://maskoff.co.jp",
    CONTACT_FROM_EMAIL: "MasKOFF <noreply@maskoff.co.jp>",
    CONTACT_TO_EMAIL: "info@maskoff.co.jp",
    GITHUB_REPO: "owner/repo",
    RESEND_API_KEY: "re_test",
    TURNSTILE_SECRET_KEY: "t",
    MICROCMS_WEBHOOK_SECRET: SECRET,
    GITHUB_DISPATCH_TOKEN: "ghp_test",
    ...overrides,
  } as unknown as Env;
}

function fakeFetch(status = 204) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(null, { status });
  }) as typeof fetch;
  return { calls, fetchFn };
}

const BODY = JSON.stringify({ service: "maskoff", api: "news", type: "edit" });

function req(body: string, sig?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (sig !== undefined) headers["x-microcms-signature"] = sig;
  return new Request("https://maskoff.co.jp/api/rebuild", { method: "POST", headers, body });
}

test("正しい署名なら GitHub の workflow_dispatch を 1 回呼んで 200、ロックを置く", async () => {
  const kv = new Map<string, string>();
  const f = fakeFetch();
  const res = await handleRebuild(req(BODY, await sign(BODY, SECRET)), makeEnv(kv), f.fetchFn);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, "https://api.github.com/repos/owner/repo/actions/workflows/deploy.yml/dispatches");
  assert.equal(new Headers(f.calls[0].init?.headers).get("authorization"), "Bearer ghp_test");
  assert.equal(kv.get("rebuild:lock"), "1");
});

test("署名ヘッダーが無ければ 401 で GitHub は呼ばない", async () => {
  const f = fakeFetch();
  const res = await handleRebuild(req(BODY), makeEnv(new Map()), f.fetchFn);
  assert.equal(res.status, 401);
  assert.equal(f.calls.length, 0);
});

test("別のシークレットで作った署名は 401", async () => {
  const f = fakeFetch();
  const res = await handleRebuild(req(BODY, await sign(BODY, "wrong")), makeEnv(new Map()), f.fetchFn);
  assert.equal(res.status, 401);
  assert.equal(f.calls.length, 0);
});

test("本文を改ざんすると 401", async () => {
  const f = fakeFetch();
  const res = await handleRebuild(req(BODY + " ", await sign(BODY, SECRET)), makeEnv(new Map()), f.fetchFn);
  assert.equal(res.status, 401);
});

test("hex でない・長さの違う署名は 401（例外にならない）", async () => {
  const f = fakeFetch();
  for (const sig of ["", "zz", "deadbeef", "g".repeat(64)]) {
    const res = await handleRebuild(req(BODY, sig), makeEnv(new Map()), f.fetchFn);
    assert.equal(res.status, 401, sig);
  }
  assert.equal(f.calls.length, 0);
});

test("シークレット未設定ならフェイルクローズ（\"undefined\" や空文字を鍵にした署名も 401）", async () => {
  const f = fakeFetch();
  // 未設定時に旧実装が鍵にしていた文字列 "undefined" で署名（空文字は WebCrypto で鍵にできないので同じ署名で代用）
  const forged = await sign(BODY, "undefined");
  for (const secret of [undefined, ""]) {
    const res = await handleRebuild(req(BODY, forged), makeEnv(new Map(), { MICROCMS_WEBHOOK_SECRET: secret }), f.fetchFn);
    assert.equal(res.status, 401, String(secret));
  }
  assert.equal(f.calls.length, 0);
});

test("60 秒ロック中は署名が正しくても GitHub を呼ばず skipped", async () => {
  const f = fakeFetch();
  const kv = new Map([["rebuild:lock", "1"]]);
  const res = await handleRebuild(req(BODY, await sign(BODY, SECRET)), makeEnv(kv), f.fetchFn);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, skipped: true });
  assert.equal(f.calls.length, 0);
});

test("GitHub が 204 以外を返したら 502", async () => {
  const f = fakeFetch(401);
  const res = await handleRebuild(req(BODY, await sign(BODY, SECRET)), makeEnv(new Map()), f.fetchFn);
  assert.equal(res.status, 502);
});

test("verifySignature: 正しい署名は true、シークレット無しは常に false", async () => {
  assert.equal(await verifySignature(BODY, await sign(BODY, SECRET), SECRET), true);
  assert.equal(await verifySignature(BODY, await sign(BODY, "undefined"), undefined), false);
  assert.equal(await verifySignature(BODY, null, SECRET), false);
});
