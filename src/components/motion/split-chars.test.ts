import { test } from "node:test";
import assert from "node:assert/strict";
import { splitChars } from "./split-chars.ts";

test("文字ごとに連番の index を振る", () => {
  assert.deepEqual(splitChars("FAQ"), [
    { kind: "char", ch: "F", index: 0 },
    { kind: "char", ch: "A", index: 1 },
    { kind: "char", ch: "Q", index: 2 },
  ]);
});

test("空白は space トークン、index は進めない", () => {
  const t = splitChars("OPEN CALL");
  assert.deepEqual(t[4], { kind: "space" });
  assert.deepEqual(t[5], { kind: "char", ch: "C", index: 4 });
});

test("改行は br トークン", () => {
  const t = splitChars("A\nB");
  assert.deepEqual(t, [
    { kind: "char", ch: "A", index: 0 },
    { kind: "br" },
    { kind: "char", ch: "B", index: 1 },
  ]);
});

test("サロゲートペアを分割しない", () => {
  assert.deepEqual(splitChars("𠮷"), [{ kind: "char", ch: "𠮷", index: 0 }]);
});
