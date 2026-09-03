import { test } from "node:test";
import assert from "node:assert/strict";
import { cubeGeometry } from "./cube-geometry.ts";

const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 0.15, `${a} ≠ ${b}`);

test("cubeGeometry: 六角形の頂点は中心から r の等角配置（上・右上・右下・下・左下・左上）", () => {
  const g = cubeGeometry(270, 200, 150);
  near(g.top.x, 270);
  near(g.top.y, 50);
  near(g.bottom.x, 270);
  near(g.bottom.y, 350);
  near(g.upperRight.x, 399.9);
  near(g.upperRight.y, 125);
  near(g.lowerRight.x, 399.9);
  near(g.lowerRight.y, 275);
  near(g.lowerLeft.x, 140.1);
  near(g.lowerLeft.y, 275);
  near(g.upperLeft.x, 140.1);
  near(g.upperLeft.y, 125);
  near(g.center.x, 270);
  near(g.center.y, 200);
});

test("cubeGeometry: 3 面のポリゴンは上面・左面・右面の順で、いずれも中心を含む 4 点", () => {
  const g = cubeGeometry(270, 200, 150);
  assert.equal(g.faces.length, 3);
  for (const f of g.faces) {
    assert.equal(f.points.length, 4);
    assert.ok(
      f.points.some((p) => p.x === g.center.x && p.y === g.center.y),
      `${f.key} に中心が無い`,
    );
  }
  assert.deepEqual(
    g.faces.map((f) => f.key),
    ["top", "left", "right"],
  );
});

test("cubeGeometry: 面ラベル位置（重心）は上面が中央上、左右の面は左右対称", () => {
  const g = cubeGeometry(270, 200, 150);
  const [top, left, right] = g.faces;
  near(top.centroid.x, 270);
  near(top.centroid.y, 125);
  near(left.centroid.y, right.centroid.y);
  near(left.centroid.x + right.centroid.x, 540);
  near(left.centroid.x, 205);
});

test("cubeGeometry: points 文字列は SVG polygon にそのまま渡せる形式", () => {
  const g = cubeGeometry(0, 0, 10);
  assert.match(g.faces[0].pointsAttr, /^(-?\d+(\.\d+)?,-?\d+(\.\d+)? ?){4}$/);
});
