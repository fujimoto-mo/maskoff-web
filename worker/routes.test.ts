import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalRedirect, isStaticAsset, routesJson } from "./routes.ts";

test("isStaticAsset: _next / images / fonts / videos と個別ファイルは静的、HTML と API は対象外", () => {
  for (const p of ["/_next/static/a.js", "/images/logo.png", "/fonts/inter-tight/latin.woff2", "/videos/hero/a.mp4", "/favicon.ico", "/robots.txt", "/sitemap.xml"]) {
    assert.equal(isStaticAsset(p), true, p);
  }
  for (const p of ["/", "/company/", "/service/bpo/", "/api/contact", "/imagesx", "/robots.txt.bak"]) {
    assert.equal(isStaticAsset(p), false, p);
  }
});

test("routesJson: 全パスを include し、静的アセットと旧 URL を exclude（100 ルール以内）", () => {
  const r = routesJson();
  assert.equal(r.version, 1);
  assert.deepEqual(r.include, ["/*"]);
  assert.ok(r.exclude.includes("/_next/*"));
  assert.ok(r.exclude.includes("/favicon.ico"));
  assert.ok(r.exclude.includes("/PRIVACYPOLICY/"));
  assert.ok(r.exclude.includes("/privacy-policy"));
  assert.ok(r.include.length + r.exclude.length <= 100);
  for (const rule of [...r.include, ...r.exclude]) assert.ok(rule.length <= 100 && rule.startsWith("/"), rule);
});

test("canonicalRedirect: www.<正規ホスト> だけ apex へ、パスとクエリを維持", () => {
  const site = "https://maskoff.co.jp";
  assert.equal(canonicalRedirect(new URL("https://www.maskoff.co.jp/service/?a=1"), site), "https://maskoff.co.jp/service/?a=1");
  assert.equal(canonicalRedirect(new URL("https://maskoff.co.jp/"), site), null);
  assert.equal(canonicalRedirect(new URL("https://abc.maskoff-web.pages.dev/"), site), null);
  assert.equal(canonicalRedirect(new URL("http://localhost:8788/"), site), null);
  assert.equal(canonicalRedirect(new URL("https://www.maskoff.co.jp/"), undefined), null);
  assert.equal(canonicalRedirect(new URL("https://www.maskoff.co.jp/"), "not a url"), null);
});
