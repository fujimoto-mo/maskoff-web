import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStart, parseToken, parseName, formatStartParts, encodeToken, formatStartJa, compactJst, googleCalendarUrl, icsText } from "./interview-schedule.ts";

test("parseStart: タイムゾーン無しは JST、ISO の完全形も可、不正は null", () => {
  assert.equal(parseStart("2026-10-22T13:00")?.toISOString(), "2026-10-22T04:00:00.000Z");
  assert.equal(parseStart("2026-10-22T13:00:00+09:00")?.toISOString(), "2026-10-22T04:00:00.000Z");
  assert.equal(parseStart("2026-10-22T04:00:00.000Z")?.toISOString(), "2026-10-22T04:00:00.000Z");
  for (const bad of ["", null, undefined, "abc", "2026-13-99T99:99"]) assert.equal(parseStart(bad), null, String(bad));
});

test("formatStartJa / compactJst: JST で「10月22日（木）13:00〜」", () => {
  const s = parseStart("2026-10-22T13:00")!;
  assert.equal(formatStartJa(s), "10月22日（木）13:00〜");
  assert.equal(compactJst(s), "20261022T130000");
  // UTC の深夜でも JST の日付になる
  assert.equal(formatStartJa(parseStart("2026-10-08T23:30:00Z")!), "10月9日（金）08:30〜");
});

test("googleCalendarUrl: 開始 + 所要時間、ctz=Asia/Tokyo", () => {
  const u = new URL(googleCalendarUrl({ start: parseStart("2026-10-22T13:00")!, durationMin: 40, summary: "一次面接", description: "Zoom", location: "https://zoom.us/j/1" }));
  assert.equal(u.searchParams.get("dates"), "20261022T130000/20261022T134000");
  assert.equal(u.searchParams.get("ctz"), "Asia/Tokyo");
  assert.equal(u.searchParams.get("text"), "一次面接");
});

test("icsText: VEVENT に TZID 付きの開始・終了と件名が入り、カンマ・セミコロンはエスケープされる", () => {
  const ics = icsText({ start: parseStart("2026-10-22T13:00")!, durationMin: 40, summary: "一次面接, Zoom; 40分", description: "ID: 1\nパス: 2", location: "https://zoom.us/j/1" }, "uid-1");
  assert.ok(ics.includes("DTSTART;TZID=Asia/Tokyo:20261022T130000\r\n"));
  assert.ok(ics.includes("DTEND;TZID=Asia/Tokyo:20261022T134000\r\n"));
  assert.ok(ics.includes("SUMMARY:一次面接\\, Zoom\\; 40分"));
  assert.ok(ics.includes("DESCRIPTION:ID: 1\\nパス: 2"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR"));
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

test("location が空なら Google は location を付けず、.ics は LOCATION / URL 行を出さない（二次面接）", () => {
  const ev = { start: parseStart("2026-10-22T13:00")!, durationMin: 60, summary: "二次面接", description: "参加方法: Indeed", location: "" };
  assert.equal(new URL(googleCalendarUrl(ev)).searchParams.has("location"), false);
  const ics = icsText(ev, "uid-2");
  assert.ok(!ics.includes("LOCATION:") && !ics.includes("URL:") && !ics.includes("zoom"));
  assert.ok(ics.includes("DESCRIPTION:参加方法: Indeed"));
});

test("formatStartParts: 「10.22」「THU」「13:00」（JST）", () => {
  assert.deepEqual(formatStartParts(parseStart("2026-10-22T13:00")!), { date: "10.22", weekday: "THU", time: "13:00" });
  assert.deepEqual(formatStartParts(parseStart("2026-10-08T23:30:00Z")!), { date: "10.9", weekday: "FRI", time: "08:30" });
});
