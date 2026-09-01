import { test } from "node:test";
import assert from "node:assert/strict";
import { strokeSchedule } from "./handwriting-timing.ts";

test("長さに比例して合計 total に配分し、線の間に gap を置く", () => {
  const s = strokeSchedule([100, 300], 1600, 40, 80);
  assert.deepEqual(s, [
    { delay: 0, duration: 400 },
    { delay: 440, duration: 1200 },
  ]);
});

test("極端に短い線は min を保証する", () => {
  const s = strokeSchedule([1, 999], 1000, 0, 80);
  assert.equal(s[0].duration, 80);
  assert.equal(s[1].delay, 80);
});

test("空配列は空", () => {
  assert.deepEqual(strokeSchedule([]), []);
});

test("既定値は total 1600 / gap 40 / min 80", () => {
  const s = strokeSchedule([50, 50]);
  assert.deepEqual(s, [
    { delay: 0, duration: 800 },
    { delay: 840, duration: 800 },
  ]);
});
