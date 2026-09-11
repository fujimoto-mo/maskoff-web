import { test } from "node:test";
import assert from "node:assert/strict";
import { cubeGeometry, type Pt } from "./cube-geometry.ts";
import { LEADS_PC, LEADS_SP, SP, VIEW, pointsAttr } from "./vision-leads.ts";

const CUBE = cubeGeometry(270, 200, 150);

/** 凸多角形の内側判定（各辺に対する外積の符号が揃えば内側。辺上は外側扱い） */
const inside = (p: Pt, poly: Pt[]) => {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (cross === 0) return false;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
};
const inCube = (p: Pt) => CUBE.faces.some((f) => inside(p, f.points));
const near = (a: number, b: number, tol = 1) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test("引き出し線は PC / SP とも上面・左面・右面の内側から始まり、3 点の折れ線", () => {
  for (const leads of [LEADS_PC, LEADS_SP]) {
    assert.equal(leads.length, 3);
    leads.forEach((lead, i) => {
      assert.equal(lead.length, 3, `${i}: 点の数`);
      assert.ok(inside(lead[0], CUBE.faces[i].points), `${i}: 始点 ${lead[0].x},${lead[0].y} が面の外`);
    });
  }
});

test("引き出し線の折れ点と終点は立方体の外にある（線が面を横切って戻らない）", () => {
  for (const leads of [LEADS_PC, LEADS_SP]) {
    for (const lead of leads) {
      assert.ok(!inCube(lead[1]), `折れ点 ${lead[1].x},${lead[1].y} が立方体の中`);
      assert.ok(!inCube(lead[2]), `終点 ${lead[2].x},${lead[2].y} が立方体の中`);
    }
  }
});

test("SP: HR の線は水平に終わり、HR ブロックの左端（幅の 60%）にブロック下端より上で届く", () => {
  const [, bend, end] = LEADS_SP[0];
  assert.equal(bend.y, end.y, "末尾が水平でない");
  assert.ok(bend.x < end.x, "末尾が右向き（ブロック側）でない");
  near(end.x, VIEW.w * SP.hrLeft);
  assert.ok(end.y < VIEW.w * SP.hrBottom, `終点 y=${end.y} が HR ブロック下端 ${VIEW.w * SP.hrBottom} より下`);
  assert.ok(end.y > 0, "終点が viewBox の上に出ている");
});

test("SP: IT / RC の線は垂直に終わり、下段の上端で自分の列の範囲内に届く", () => {
  const rowTop = VIEW.h - VIEW.w * SP.rowTop;
  const [, itBend, itEnd] = LEADS_SP[1];
  const [, rcBend, rcEnd] = LEADS_SP[2];
  for (const [bend, end] of [[itBend, itEnd], [rcBend, rcEnd]] as const) {
    assert.equal(bend.x, end.x, "末尾が垂直でない");
    assert.ok(bend.y < end.y, "末尾が下向きでない");
    near(end.y, rowTop);
  }
  assert.ok(itEnd.x > 0 && itEnd.x < VIEW.w * SP.col, `IT 終点 x=${itEnd.x} が左列の外`);
  assert.ok(rcEnd.x > VIEW.w * (1 - SP.col) && rcEnd.x < VIEW.w, `RC 終点 x=${rcEnd.x} が右列の外`);
});

test("SP: 線はすべて viewBox の中に収まる（SVG の overflow に頼らない）", () => {
  for (const lead of LEADS_SP)
    for (const p of lead)
      assert.ok(p.x >= 0 && p.x <= VIEW.w && p.y >= 0 && p.y <= VIEW.h, `${p.x},${p.y}`);
});

test("SP の配置比率: HR は右上 40% 幅、下段 2 列は合計が 100% 未満で隙間がある", () => {
  assert.ok(SP.hrLeft > 0.5 && SP.hrLeft < 0.7);
  assert.ok(SP.col * 2 < 1);
});

test("pointsAttr: 座標列を SVG の points 属性の文字列にする", () => {
  assert.equal(pointsAttr([{ x: 1, y: 2 }, { x: 3.5, y: 4 }]), "1,2 3.5,4");
});
