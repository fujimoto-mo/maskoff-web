import { test } from "node:test";
import assert from "node:assert/strict";
import { wrap, advance, clampFling, MAX_FLING } from "./marquee-physics.ts";

test("wrap は x を (-half, 0] に正規化する", () => {
  assert.equal(wrap(0, 1000), 0);
  assert.equal(wrap(-1000, 1000), 0);
  assert.equal(wrap(-1200, 1000), -200);
  assert.equal(wrap(300, 1000), -700);
  assert.equal(wrap(5, 0), 0);
});

test("advance は速度を v0 へ減衰させながら x を進める", () => {
  let s = { x: 0, v: 900, v0: -100, half: 1000 };
  for (let i = 0; i < 180; i++) s = advance(s, 1 / 60); // 3 秒
  assert.ok(Math.abs(s.v - s.v0) < 1, String(s.v));
  assert.ok(s.x <= 0 && s.x > -1000);
});

test("v0 のまま等速なら dt × v0 だけ進む", () => {
  const s = advance({ x: 0, v: -100, v0: -100, half: 1000 }, 0.5);
  assert.equal(Math.round(s.x), -50);
});

test("clampFling は ±MAX_FLING に収める", () => {
  assert.equal(clampFling(5000), MAX_FLING);
  assert.equal(clampFling(-5000), -MAX_FLING);
  assert.equal(clampFling(120), 120);
});
