export type Box = { left: number; top: number; width: number; height: number };

/**
 * getClientRects() の矩形群を行ごとに 1 本に統合し、蛍光ペンの矩形（block 相対）にする。
 * 高さは行高 × 0.78、Y は行高 × 0.04 上げ（0.16 → 0.10 → 0.03 → -0.04 と上へ詰めた。2026-09-17）、左右に 0.18em ずつはみ出す（spec §3-5）。
 */
export function mergeLineRects(rects: readonly Box[], block: Box, lineHeight: number, emPx: number): Box[] {
  const sorted = rects.filter((r) => r.width > 0).slice().sort((a, b) => a.top - b.top || a.left - b.left);
  const groups: Box[][] = [];
  for (const r of sorted) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(r.top - g[0].top) <= lineHeight * 0.5) g.push(r);
    else groups.push([r]);
  }
  const padX = 0.18 * emPx;
  return groups.map((g) => {
    const left = Math.min(...g.map((r) => r.left));
    const right = Math.max(...g.map((r) => r.left + r.width));
    const top = Math.min(...g.map((r) => r.top));
    return {
      left: left - block.left - padX,
      top: top - block.top - lineHeight * 0.04,
      width: right - left + padX * 2,
      height: lineHeight * 0.78,
    };
  });
}
