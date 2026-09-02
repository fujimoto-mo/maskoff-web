import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeLineRects } from "./marker-rects.ts";

const block = { left: 100, top: 1000, width: 560, height: 800 };

test("1 矩形: block 相対、高さ 0.78 倍・Y 0.16 倍・左右 0.18em の拡張", () => {
  const r = mergeLineRects([{ left: 150, top: 1200, width: 200, height: 28 }], block, 28, 14);
  assert.deepEqual(r, [{ left: 50 - 2.52, top: 200 + 4.48, width: 200 + 5.04, height: 21.84 }]);
});

test("同じ行の複数矩形は 1 本に統合", () => {
  const r = mergeLineRects(
    [
      { left: 150, top: 1200, width: 100, height: 28 },
      { left: 250, top: 1201, width: 120, height: 28 },
    ],
    block,
    28,
    14,
  );
  assert.equal(r.length, 1);
  assert.equal(r[0].width, 220 + 5.04);
});

test("行が違えば分ける（top 差が lineHeight/2 超）", () => {
  const r = mergeLineRects(
    [
      { left: 150, top: 1200, width: 100, height: 28 },
      { left: 100, top: 1228, width: 300, height: 28 },
    ],
    block,
    28,
    14,
  );
  assert.equal(r.length, 2);
  assert.ok(r[0].top < r[1].top);
});

test("幅 0 の矩形は無視", () => {
  assert.deepEqual(mergeLineRects([{ left: 0, top: 0, width: 0, height: 28 }], block, 28, 14), []);
});

test("未ソート・3 行にまたがる入力を行ごとに 1 本へまとめ、上から順に返す", () => {
  const r = mergeLineRects(
    [
      { left: 260, top: 1256, width: 90, height: 28 }, // 3 行目の後半
      { left: 150, top: 1200, width: 100, height: 28 }, // 1 行目の前半
      { left: 100, top: 1229, width: 120, height: 28 }, // 2 行目
      { left: 100, top: 1255, width: 160, height: 28 }, // 3 行目の前半
      { left: 250, top: 1201, width: 120, height: 28 }, // 1 行目の後半
    ],
    block,
    28,
    14,
  );
  assert.equal(r.length, 3);
  assert.ok(r[0].top < r[1].top && r[1].top < r[2].top);
  assert.equal(r[0].width, 220 + 5.04); // 150→370
  assert.equal(r[1].width, 120 + 5.04); // 100→220
  assert.equal(r[2].width, 250 + 5.04); // 100→350
});
