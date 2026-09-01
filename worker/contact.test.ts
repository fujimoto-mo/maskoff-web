import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "./contact.ts";
import type { Env } from "./index.ts";

function makeEnv(kv: Map<string, string>): Env {
  const RATE_LIMIT = {
    get: async (k: string) => kv.get(k) ?? null,
    put: async (k: string, v: string) => {
      kv.set(k, v);
    },
  };
  return {
    ASSETS: { fetch: async () => new Response("") },
    RATE_LIMIT,
    SITE_URL: "https://maskoff.co.jp",
    CONTACT_FROM_EMAIL: "MasKOFF <noreply@maskoff.co.jp>",
    CONTACT_TO_EMAIL: "info@maskoff.co.jp",
    GITHUB_REPO: "x/y",
    RESEND_API_KEY: "re_test",
    TURNSTILE_SECRET_KEY: "", // 空 = 検証スキップ
    MICROCMS_WEBHOOK_SECRET: "s",
    GITHUB_DISPATCH_TOKEN: "t",
  } as unknown as Env;
}

const ctx = { waitUntil: (p: Promise<unknown>) => void p, passThroughOnException: () => undefined } as unknown as ExecutionContext;

const valid = {
  company: "",
  name: "山田 太郎",
  email: "taro@example.com",
  tel: "",
  category: "web",
  message: "コーポレートサイトの制作について相談したいです。",
  consent: true,
  website: "",
  turnstileToken: "local",
};

function req(body: unknown, origin = "https://maskoff.co.jp", ip = "203.0.113.1") {
  return new Request("https://maskoff.co.jp/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin, "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

function fakeFetch() {
  const calls: string[] = [];
  const fetchFn = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  return { calls, fetchFn };
}

test("Origin が違えば 403", async () => {
  const res = await handleContact(req(valid, "https://evil.example"), makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 403);
});

test("同一 IP 5 件目以降は 429", async () => {
  const kv = new Map([["contact:203.0.113.1", "5"]]);
  const res = await handleContact(req(valid), makeEnv(kv), ctx, fakeFetch());
  assert.equal(res.status, 429);
});

test("ハニーポットに値があれば 200 を返してメールは送らない", async () => {
  const f = fakeFetch();
  const res = await handleContact(req({ ...valid, website: "http://spam" }), makeEnv(new Map()), ctx, f);
  assert.equal(res.status, 200);
  assert.equal(f.calls.length, 0);
});

test("検証エラーは 400 と項目別メッセージ", async () => {
  const res = await handleContact(req({ ...valid, name: "", consent: false }), makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 400);
  const body = (await res.json()) as { ok: boolean; errors: Record<string, string> };
  assert.equal(body.ok, false);
  assert.ok(body.errors.name);
  assert.ok(body.errors.consent);
});

test("正常系は Resend を 2 回呼んで 200", async () => {
  const f = fakeFetch();
  const res = await handleContact(req(valid), makeEnv(new Map()), ctx, f);
  assert.equal(res.status, 200);
  assert.equal(f.calls.filter((u) => u.includes("api.resend.com")).length, 2);
});

test("JSON でない body は 400", async () => {
  const r = new Request("https://maskoff.co.jp/api/contact", { method: "POST", headers: { origin: "https://maskoff.co.jp" }, body: "not json" });
  const res = await handleContact(r, makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 400);
});
