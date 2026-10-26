import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStart, parseToken, parseName, formatStartParts, encodeToken, formatStartJa } from "./interview-schedule.ts";

test("parseStart: タイムゾーン無しは JST、ISO の完全形も可、不正は null", () => {
  assert.equal(parseStart("2026-10-22T13:00")?.toISOString(), "2026-10-22T04:00:00.000Z");
  assert.equal(parseStart("2026-10-22T13:00:00+09:00")?.toISOString(), "2026-10-22T04:00:00.000Z");
  assert.equal(parseStart("2026-10-22T04:00:00.000Z")?.toISOString(), "2026-10-22T04:00:00.000Z");
  for (const bad of ["", null, undefined, "abc", "2026-13-99T99:99"]) assert.equal(parseStart(bad), null, String(bad));
});

test("formatStartJa: JST で「10月22日（木）13:00〜」", () => {
  const s = parseStart("2026-10-22T13:00")!;
  assert.equal(formatStartJa(s), "10月22日（木）13:00〜");
  // UTC の深夜でも JST の日付になる
  assert.equal(formatStartJa(parseStart("2026-10-08T23:30:00Z")!), "10月9日（金）08:30〜");
});

test("parseToken / encodeToken: シートの式と同じ k を相互変換、不正は null", () => {
  // シートの式 BASE(BITXOR(ROUND((V2-DATE(1970,1,1))*1440),123456789),36) で 2026/10/22 13:00 → 1U0XI1
  assert.equal(encodeToken(parseStart("2026-10-22T13:00")!), "1U0XI1");
  assert.equal(parseToken("1U0XI1")?.toISOString(), "2026-10-22T04:00:00.000Z");
  assert.equal(parseToken("1u0xi1")?.toISOString(), "2026-10-22T04:00:00.000Z");
  const s = parseStart("2026-10-08T23:30")!;
  assert.equal(parseToken(encodeToken(s))?.getTime(), s.getTime());
  for (const bad of ["", null, undefined, "!!", "ZZZZZZZZZZZ", "1U0X-I1", "bad", "abc"]) assert.equal(parseToken(bad), null, String(bad));
});

test("parseName: 末尾の「様」を落とす（表示側で「様」を付けるため二重にしない）", () => {
  assert.equal(parseName("田中陽子様"), "田中陽子");
  assert.equal(parseName(" 田中 陽子 様 "), "田中 陽子");
  assert.equal(parseName("田中陽子さま"), "田中陽子");
  assert.equal(parseName("田中陽子"), "田中陽子");
  for (const bad of ["", null, undefined, "様"]) assert.equal(parseName(bad), "", String(bad));
});

test("formatStartParts: 年・月・日・曜日・時刻に分ける（JST）", () => {
  assert.deepEqual(formatStartParts(parseStart("2026-10-22T13:00")!), { year: "2026", month: "10", day: "22", weekday: "木", time: "13:00" });
  assert.deepEqual(formatStartParts(parseStart("2026-12-31T23:30:00Z")!), { year: "2027", month: "1", day: "1", weekday: "金", time: "08:30" });
});
