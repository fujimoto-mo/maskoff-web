export type RowState = { x: number; v: number; v0: number; half: number };

/** 指を離したときの慣性の上限（px/s） */
export const MAX_FLING = 900;
/** 基準速度へ戻る時定数（秒）。約 3τ = 1.2s で収束 */
export const TAU = 0.4;

/** 1 周分（half）で剰余を取り (-half, 0] に収める */
export function wrap(x: number, half: number): number {
  if (half <= 0) return 0;
  const m = ((x % half) + half) % half; // [0, half)
  return m === 0 ? 0 : m - half;
}

/** dt 秒進める。速度は v0 へ指数減衰 */
export function advance(s: RowState, dt: number): RowState {
  const v = s.v + (s.v0 - s.v) * (1 - Math.exp(-dt / TAU));
  return { ...s, v, x: wrap(s.x + v * dt, s.half) };
}

export function clampFling(v: number): number {
  return Math.max(-MAX_FLING, Math.min(MAX_FLING, v));
}
