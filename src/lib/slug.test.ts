import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeSlug } from "./slug.ts";

test("decodeSlug: エンコード済みの日本語を戻し、ASCII はそのまま、壊れた % は例外にしない", () => {
  assert.equal(decodeSlug("%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9"), "ニュース");
  assert.equal(decodeSlug("ニュース"), "ニュース");
  assert.equal(decodeSlug("renewal-2026"), "renewal-2026");
  assert.equal(decodeSlug("bad%E0%"), "bad%E0%");
});
