export type MarqueeCell =
  | { type: "image"; src: string; alt?: string }
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
