import { test } from "node:test";
import assert from "node:assert/strict";
import { revealDelay, cellPopDelay } from "./reveal-delay.ts";

test("revealDelay は index × 80ms", () => {
  assert.equal(revealDelay(0), 0);
  assert.equal(revealDelay(3), 240);
});

test("cellPopDelay は中央からの距離をセル幅で割って 35ms 刻み", () => {
  assert.equal(cellPopDelay(0, 200), 0);
  assert.equal(cellPopDelay(200, 200), 35);
  assert.equal(cellPopDelay(-500, 200), 88); // 距離は絶対値、四捨五入
});

test("cellPopDelay はセル幅 0 で 0", () => {
  assert.equal(cellPopDelay(300, 0), 0);
});
