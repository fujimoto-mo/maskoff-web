/** stagger 出現の遅延。index 番目は index × 80ms（spec §2-3） */
export function revealDelay(index: number): number {
  return Math.max(0, index) * 80;
}

/** マーキーのセル pop の遅延。画面中央からの距離（px）をセル幅で割り 35ms/セル */
export function cellPopDelay(distancePx: number, cellWidthPx: number): number {
  if (cellWidthPx <= 0) return 0;
  return Math.round((Math.abs(distancePx) / cellWidthPx) * 35);
}
