import { test } from "node:test";
import assert from "node:assert/strict";
import { progress, mix, hexToRgb, isOn } from "./scroll-theme-math.ts";

const vh = 900;

test("上端が画面の 45% より下なら 0", () => {
  assert.equal(progress(410, 1500, vh), 0);
});

test("上端が 100px なら 0.8 以上", () => {
  assert.ok(progress(100, 1200, vh) >= 0.8);
});

test("下端が 300px なら 0.4〜0.6、210px なら 0.2 以下（戻り）", () => {
  const mid = progress(-800, 300, vh);
  assert.ok(mid >= 0.4 && mid <= 0.6, String(mid));
  assert.ok(progress(-900, 210, vh) <= 0.2);
});

test("0〜1 にクランプ", () => {
  assert.equal(progress(-2000, 3000, vh), 1);
  assert.equal(progress(2000, 3000, vh), 0);
});

test("mix は sRGB 線形補間", () => {
  assert.equal(mix([255, 255, 255], [10, 10, 10], 0.5), "rgb(133, 133, 133)");
  assert.equal(mix([255, 255, 255], [10, 10, 10], 0), "rgb(255, 255, 255)");
});

test("hexToRgb", () => {
  assert.deepEqual(hexToRgb("#f2f2f0"), [242, 242, 240]);
  assert.deepEqual(hexToRgb("#FFF"), [255, 255, 255]);
});

test("isOn は 0.5 を超えたら true", () => {
  assert.equal(isOn(0.5), false);
  assert.equal(isOn(0.51), true);
});
