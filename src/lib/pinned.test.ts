import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPinned } from "./pinned.ts";

const now = new Date("2026-08-31T00:00:00Z");
const item = (over: Partial<{ isPinned: boolean; publishedDate: string; expiresAt: string; id: string }>) => ({
  id: "x",
  publishedDate: "2026-08-01T00:00:00Z",
  ...over,
});

test("isPinned でないものは選ばない", () => {
  assert.equal(selectPinned([item({ isPinned: false })], now), null);
});

test("expiresAt を過ぎたものは除外する", () => {
  assert.equal(selectPinned([item({ isPinned: true, expiresAt: "2026-08-30T00:00:00Z" })], now), null);
});

test("expiresAt 未設定なら掲出する", () => {
  assert.equal(selectPinned([item({ isPinned: true, id: "a" })], now)?.id, "a");
});

test("複数あれば publishedDate が新しい方", () => {
  const list = [
    item({ isPinned: true, id: "old", publishedDate: "2026-07-01T00:00:00Z" }),
    item({ isPinned: true, id: "new", publishedDate: "2026-08-20T00:00:00Z" }),
  ];
  assert.equal(selectPinned(list, now)?.id, "new");
});

test("空配列は null", () => {
  assert.equal(selectPinned([], now), null);
});

test("将来の expiresAt は掲出する", () => {
  assert.equal(selectPinned([item({ isPinned: true, id: "a", expiresAt: "2026-09-01T00:00:00Z" })], now)?.id, "a");
});

test("expiresAt がちょうど now なら除外する（厳密比較）", () => {
  assert.equal(selectPinned([item({ isPinned: true, expiresAt: "2026-08-31T00:00:00Z" })], now), null);
});
