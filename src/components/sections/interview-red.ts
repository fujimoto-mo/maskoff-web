/**
 * 面接案内ページ（/interview/）の赤。ボタン・文字・線・点をすべてこの 1 色に揃える。
 * --color-marker に黒を 12% 混ぜた色（白文字を乗せる Zoom ボタンでコントラスト 4.5:1 を確保するため。.cta-liquid の hover と同じ）。
 * Tailwind がクラス名を拾えるよう、組み立てずに完全な文字列で書く
 */
export const RED_BG = "bg-[color-mix(in_srgb,var(--color-marker)_88%,black)]";
export const RED_TEXT = "text-[color-mix(in_srgb,var(--color-marker)_88%,black)]";
