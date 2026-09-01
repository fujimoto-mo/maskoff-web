export type Rgb = [number, number, number];

/** 補間する変数名（--color-<name>）。fg-invert の暗側は dark-bg を使う */
export const THEME_VARS = ["bg", "fg", "fg-body", "fg-muted", "surface", "border", "fg-invert"] as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * VISION の矩形から反転の進行度 0〜1 を返す（spec §4-1）。
 * 上端が画面の 45% に来たら始まり 5% で 1。下端が 45% を切り始めたら戻り 20% で 0。
 */
export function progress(top: number, bottom: number, vh: number): number {
  const tIn = clamp01((0.45 * vh - top) / (0.4 * vh));
  const tOut = clamp01((bottom - 0.2 * vh) / (0.25 * vh));
  return Math.min(tIn, tOut);
}

export function mix(a: Rgb, b: Rgb, t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function isOn(t: number): boolean {
  return t > 0.5;
}
