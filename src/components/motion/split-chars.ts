export type Token = { kind: "char"; ch: string; index: number } | { kind: "space" } | { kind: "br" };

/** 見出し英字を 1 文字ずつのトークンにする。index は文字だけで連番（アニメの遅延計算用） */
export function splitChars(text: string): Token[] {
  const out: Token[] = [];
  let index = 0;
  for (const ch of Array.from(text)) {
    if (ch === "\n") out.push({ kind: "br" });
    else if (ch === " ") out.push({ kind: "space" });
    else out.push({ kind: "char", ch, index: index++ });
  }
  return out;
}
