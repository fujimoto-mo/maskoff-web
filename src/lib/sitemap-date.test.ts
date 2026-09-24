import { test } from "node:test";
import assert from "node:assert/strict";
import { lastModifiedOf } from "./sitemap-date.ts";

test("lastModifiedOf: 公開日より新しい更新日があればそれを使う", () => {
  const d = lastModifiedOf({ publishedDate: "2026-09-01T00:00:00.000Z", revisedAt: "2026-09-10T03:00:00.000Z", updatedAt: "2026-09-05T00:00:00.000Z" });
  assert.equal(d.toISOString(), "2026-09-10T03:00:00.000Z");
});

test("lastModifiedOf: 更新日が公開日より前（下書き時の編集）や不正値なら公開日", () => {
  assert.equal(lastModifiedOf({ publishedDate: "2026-09-01T00:00:00.000Z", revisedAt: "2026-08-20T00:00:00.000Z" }).toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(lastModifiedOf({ publishedDate: "2026-09-01T00:00:00.000Z", updatedAt: "not a date" }).toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(lastModifiedOf({ publishedDate: "2026-09-01T00:00:00.000Z" }).toISOString(), "2026-09-01T00:00:00.000Z");
});
