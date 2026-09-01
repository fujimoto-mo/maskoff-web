export type StrokeTiming = { delay: number; duration: number };

/** 各線の描画時間を長さ比で配分（合計 total ms、最短 min ms、線間 gap ms）。遅延は累積 */
export function strokeSchedule(lengths: number[], total = 1600, gap = 40, min = 80): StrokeTiming[] {
  const sum = lengths.reduce((a, b) => a + b, 0);
  const out: StrokeTiming[] = [];
  let delay = 0;
  for (const len of lengths) {
    const duration = Math.max(min, sum > 0 ? Math.round((total * len) / sum) : min);
    out.push({ delay, duration });
    delay += duration + gap;
  }
  return out;
}
