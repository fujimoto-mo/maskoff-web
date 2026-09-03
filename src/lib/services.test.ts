import { test } from "node:test";
import assert from "node:assert/strict";
import { SERVICES } from "./services.ts";
import manifest from "./images/manifest.json" with { type: "json" };

test("SERVICES: 8 事業、slug は一意の kebab-case、番号は 01〜08 の順", () => {
  assert.equal(SERVICES.length, 8);
  const slugs = SERVICES.map((s) => s.slug);
  assert.equal(new Set(slugs).size, 8);
  for (const s of SERVICES)
    assert.match(s.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, s.slug);
  SERVICES.forEach((s, i) =>
    assert.equal(s.num, String(i + 1).padStart(2, "0")),
  );
});

test("SERVICES: HOME のバッジに入る verb は 4 文字以内、英字ラベルは大文字", () => {
  for (const s of SERVICES) {
    assert.ok(
      s.verb.length >= 2 && s.verb.length <= 4,
      `${s.slug}: verb "${s.verb}"`,
    );
    assert.match(s.en, /^[A-Z0-9 \-/]+$/, `${s.slug}: en "${s.en}"`);
  }
});

test("SERVICES: 本文・リード・タグ（3 つ）が空でなく、画像は manifest に存在する", () => {
  const keys = Object.keys(manifest as Record<string, unknown>);
  for (const s of SERVICES) {
    assert.ok(s.title && s.lead && s.description, s.slug);
    assert.equal(s.tags.length, 3, `${s.slug}: tags`);
    assert.ok(
      s.tags.every((t) => t.trim().length > 0),
      s.slug,
    );
    assert.ok(
      keys.includes(s.image),
      `${s.slug}: ${s.image} が manifest に無い`,
    );
  }
});
