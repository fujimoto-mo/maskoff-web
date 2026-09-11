import type { Pt } from "./cube-geometry.ts";

/**
 * VISION 相関図の引き出し線と SP 配置（純粋データ）。座標は VisionDiagram の SVG viewBox（540x440）単位。
 * 立方体は cubeGeometry(270, 200, 150)。各線は「面の内側 → 立方体の外で折れる → 事業名ブロックの端」の 3 点。
 * 検証は vision-leads.test.ts（始点が面の内側、折れ点が立方体の外、終点がブロックの端に届く）。
 * @example pointsAttr(LEADS_SP[0]) → "250,95 306,39 324,39"
 */
export const VIEW = { w: 540, h: 440 } as const;

/**
 * SP（≤600px）の配置。すべて幅（540 = 100%）に対する比率で、VisionDiagram が CSS 変数として渡す。
 * - hrLeft: HR ブロックの左端。ブロックは w = 1 - hrLeft で右寄せ（self-end）
 * - hrBottom: HR ブロックの下端 = SVG 上端から幅の 11% 下（margin-bottom: -11% で SVG に重ねる）
 * - rowTop: IT / RC の下段の上端 = SVG 下端から幅の 12% 上（margin-top: -12%）
 * - col: 下段の各列の幅（2 列で 98%。中央 2% の隙間に立方体の下の頂点が来る）
 */
export const SP = { hrLeft: 0.6, hrBottom: 0.11, rowTop: 0.12, col: 0.49 } as const;

const p = (x: number, y: number): Pt => ({ x, y });

/** PC / タブレット: 面の中 → 斜め → ブロックの内側の端へ水平（ブロック位置は VisionDiagram の BLOCK_POS） */
export const LEADS_PC: readonly (readonly Pt[])[] = [
  [p(318, 112), p(395, 43), p(417, 43)],
  [p(232, 270), p(196, 368), p(179, 368)],
  [p(308, 270), p(340, 368), p(349, 368)],
];

/**
 * SP: HR は上面から右上へ 45° → 水平で HR ブロックの左端（x = 540 × hrLeft）へ。
 * IT / RC は左面・右面から斜め下へ → 垂直で下段の上端（y = 440 − 540 × rowTop）へ。
 */
export const LEADS_SP: readonly (readonly Pt[])[] = [
  [p(250, 95), p(306, 39), p(VIEW.w * SP.hrLeft, 39)],
  [p(232, 270), p(205, 340), p(205, VIEW.h - VIEW.w * SP.rowTop)],
  [p(308, 270), p(335, 340), p(335, VIEW.h - VIEW.w * SP.rowTop)],
];

/** 座標列を SVG polyline の points 属性にする */
export const pointsAttr = (pts: readonly Pt[]) => pts.map((q) => `${q.x},${q.y}`).join(" ");
