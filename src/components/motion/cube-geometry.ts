/**
 * VISION 相関図の等角立方体の座標（純粋関数）。中心 (cx, cy) と半径 r（中心から六角形の頂点まで）から、
 * 6 頂点・3 面のポリゴン・面ラベルの位置（重心）を返す。SVG の座標系（y 下向き）。
 * @example const g = cubeGeometry(270, 200, 150); g.faces[0].pointsAttr → "270,50 399.9,125 270,200 140.1,125"
 */
export type Pt = { x: number; y: number };
export type FaceKey = "top" | "left" | "right";
export type Face = {
  key: FaceKey;
  points: Pt[];
  pointsAttr: string;
  centroid: Pt;
};

const round = (n: number) => Math.round(n * 10) / 10;
const pt = (x: number, y: number): Pt => ({ x: round(x), y: round(y) });

export function cubeGeometry(cx: number, cy: number, r: number) {
  const dx = r * Math.cos(Math.PI / 6); // 30°
  const dy = r / 2;
  const center = pt(cx, cy);
  const top = pt(cx, cy - r);
  const bottom = pt(cx, cy + r);
  const upperRight = pt(cx + dx, cy - dy);
  const lowerRight = pt(cx + dx, cy + dy);
  const lowerLeft = pt(cx - dx, cy + dy);
  const upperLeft = pt(cx - dx, cy - dy);

  const face = (key: FaceKey, points: Pt[]): Face => ({
    key,
    points,
    pointsAttr: points.map((p) => `${p.x},${p.y}`).join(" "),
    centroid: pt(
      points.reduce((s, p) => s + p.x, 0) / points.length,
      points.reduce((s, p) => s + p.y, 0) / points.length,
    ),
  });

  return {
    center,
    top,
    bottom,
    upperRight,
    lowerRight,
    lowerLeft,
    upperLeft,
    faces: [
      face("top", [top, upperRight, center, upperLeft]),
      face("left", [upperLeft, center, bottom, lowerLeft]),
      face("right", [center, upperRight, lowerRight, bottom]),
    ],
  };
}
