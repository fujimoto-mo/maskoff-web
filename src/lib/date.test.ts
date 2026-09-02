import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./date.ts";

test("ISO を JST の YYYY.MM.DD にする", () => {
  assert.equal(formatDate("2026-08-31T00:00:00.000Z"), "2026.08.31");
});

test("UTC 深夜は JST では翌日", () => {
  assert.equal(formatDate("2026-08-31T15:30:00.000Z"), "2026.09.01");
});
