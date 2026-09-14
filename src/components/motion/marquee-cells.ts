export type MarqueeCell =
  /** anim: 透過アニメーション WebP（Picture の anim）。reduced-motion では src の静止画のまま */
  | { type: "image"; src: string; alt?: string; anim?: string }
  /** 短いループ動画（muted / inline）。poster は静止画。JS 無効・reduced-motion では poster のまま。size はセルに対する表示比率（0–1、既定 1。2/3 で他の画像セルと同程度の大きさ） */
  | { type: "video"; src: string; poster: string; alt?: string; size?: number }
  | { type: "text"; lines: string[] }
  | { type: "logo" };

export type MarqueeRow = {
  cells: MarqueeCell[];
  /** 右→左ではなく左→右に流す */
  reverse?: boolean;
  /** 1 周の秒数。行ごとに変えて速度差を出す（既定 60） */
  duration?: number;
};

/** シームレスループ用に配列を 2 回並べる。2 周目は aria-hidden で描画すること。 */
export function duplicate<T>(cells: readonly T[]): T[] {
  return [...cells, ...cells];
}
