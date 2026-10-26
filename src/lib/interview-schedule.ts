/**
 * /interview/ の日時まわり（純粋関数。node:test 対象）。
 * URL の k（parseToken）または d（例 2026-10-22T13:00。タイムゾーン無しは JST とみなす。ISO 8601 の完全形も可）を Date にし、
 * 「10月22日（木）13:00〜」の表示文字列を作る。
 */
const JST = "Asia/Tokyo";

/** d パラメータ → Date。空・不正なら null */
export function parseStart(d: string | null | undefined): Date | null {
  if (!d) return null;
  const s = d.trim();
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00+09:00` : s;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * URL の k（日時を見えにくくした英数字。例 1U0XI1 = 2026-10-22 13:00 JST）。スプレッドシートの AL 列（データは 4 行目から。AL4 に入れて下へコピー）で作る
 * （W 列 = 一次面接日程「7月16日(木) 13:00」または日付値、G 列 = 姓名「田中陽子様」。式の全文は docs ではなくここが正）:
 * =IF(W4="","",LET(d,IF(ISNUMBER(W4),W4,LET(m,VALUE(REGEXEXTRACT(W4,"(\d+)月")),dd,VALUE(REGEXEXTRACT(W4,"月\s*(\d+)日")),h,VALUE(REGEXEXTRACT(W4,"(\d+)[:：]")),mi,VALUE(REGEXEXTRACT(W4,"[:：](\d+)")),x,DATE(YEAR(TODAY()),m,dd)+TIME(h,mi,0),IF(x<TODAY()-90,DATE(YEAR(TODAY())+1,m,dd)+TIME(h,mi,0),x))),"https://www.maskoff.co.jp/interview/?k="&BASE(BITXOR(ROUND((d-DATE(1970,1,1))*1440),123456789),36)&IF(G4="","","&n="&ENCODEURL(G4))))
 * 二次面接（/interview/second/。AA 列 = 二次面接日程）は W4 を AA4 に、パスを /interview/second/ にした式:
 * =IF(AA4="","",LET(d,IF(ISNUMBER(AA4),AA4,LET(m,VALUE(REGEXEXTRACT(AA4,"(\d+)月")),dd,VALUE(REGEXEXTRACT(AA4,"月\s*(\d+)日")),h,VALUE(REGEXEXTRACT(AA4,"(\d+)[:：]")),mi,VALUE(REGEXEXTRACT(AA4,"[:：](\d+)")),x,DATE(YEAR(TODAY()),m,dd)+TIME(h,mi,0),IF(x<TODAY()-90,DATE(YEAR(TODAY())+1,m,dd)+TIME(h,mi,0),x))),"https://www.maskoff.co.jp/interview/second/?k="&BASE(BITXOR(ROUND((d-DATE(1970,1,1))*1440),123456789),36)&IF(G4="","","&n="&ENCODEURL(G4))))
 * 中身は「1970-01-01 00:00 からの JST の分数」を TOKEN_KEY と XOR して 36 進にしたもの。暗号ではない（本人の面接日時しか入れない前提）。
 * TOKEN_KEY を変えると発行済みの URL が全部読めなくなるので、シートの式と必ず同時に変える。
 */
export const TOKEN_KEY = 123456789;

/** 日時 → k（テストと確認用。運用ではシートの式で作る） */
export function encodeToken(start: Date): string {
  const jstMin = Math.round(start.getTime() / 60_000) + 9 * 60;
  return (jstMin ^ TOKEN_KEY).toString(36).toUpperCase();
}

/** k → Date。空・不正なら null */
export function parseToken(k: string | null | undefined): Date | null {
  if (!k || !/^[0-9a-z]{1,10}$/i.test(k.trim())) return null;
  const n = parseInt(k.trim(), 36);
  if (!Number.isSafeInteger(n) || n > 0x7fffffff) return null;
  const jstMin = n ^ TOKEN_KEY;
  const date = new Date((jstMin - 9 * 60) * 60_000);
  // 打ち間違い・でたらめな k も 36 進としては読めてしまうので、ありえない年は弾く
  const y = date.getUTCFullYear();
  return y >= 2020 && y <= 2100 ? date : null;
}

type Parts = { y: string; mo: string; d: string; h: string; mi: string; wd: string };
function jstParts(date: Date): Parts {
  const p = new Intl.DateTimeFormat("ja-JP", { timeZone: JST, year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(date);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour").padStart(2, "0"), mi: get("minute").padStart(2, "0"), wd: get("weekday") };
}

/** "10月22日（木）13:00〜" */
export function formatStartJa(start: Date): string {
  const p = jstParts(start);
  return `${p.mo}月${p.d}日（${p.wd}）${p.h}:${p.mi}〜`;
}

/** 日時カードの大きな表示用。{ year: "2026", month: "10", day: "22", weekday: "木", time: "13:00" }（JST。「2026年10月22日 (木) 13:00〜」の数字と単位の大きさを変えて組む） */
export function formatStartParts(start: Date): { year: string; month: string; day: string; weekday: string; time: string } {
  const p = jstParts(start);
  return { year: p.y, month: p.mo, day: p.d, weekday: p.wd, time: `${p.h}:${p.mi}` };
}

/** URL の n（氏名。シートの G 列「田中陽子様」）→ 敬称を除いた氏名。末尾の「様 / さま」と空白を落とし 40 文字まで */
export function parseName(n: string | null | undefined): string {
  return (n ?? "").trim().replace(/[\s　]*(様|さま)$/, "").trim().slice(0, 40);
}
