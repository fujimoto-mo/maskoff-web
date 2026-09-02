import { test } from "node:test";
import assert from "node:assert/strict";
import { duplicate } from "./marquee-cells.ts";

test("配列を 2 倍にして順序を保つ", () => {
  assert.deepEqual(duplicate(["a", "b", "c"]), ["a", "b", "c", "a", "b", "c"]);
});

test("空配列は空のまま", () => {
  assert.deepEqual(duplicate([]), []);
});

test("元の配列を変更しない", () => {
  const src = [1, 2];
  duplicate(src);
  assert.deepEqual(src, [1, 2]);
});
