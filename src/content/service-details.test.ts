import { test } from "node:test";
import assert from "node:assert/strict";
import { SERVICES } from "../lib/services.ts";
import manifest from "../lib/images/manifest.json" with { type: "json" };
import { SERVICE_DETAILS, getServiceDetail } from "./service-details.ts";

const slugs = SERVICES.map((s) => s.slug);

test("service-details: SERVICES の全 slug に詳細があり、余分なキーが無い", () => {
  assert.deepEqual(Object.keys(SERVICE_DETAILS).sort(), [...slugs].sort());
  assert.throws(() => getServiceDetail("no-such-slug"));
});

test("service-details: 各配列の個数と空文字の禁止", () => {
  for (const slug of slugs) {
    const d = getServiceDetail(slug);
    assert.ok(d.intro.length >= 2 && d.intro.length <= 3, `${slug}: intro`);
    assert.equal(d.features.length, 3, `${slug}: features`);
    assert.ok(d.issues.length >= 3 && d.issues.length <= 4, `${slug}: issues`);
    assert.ok(d.flow.length >= 4 && d.flow.length <= 5, `${slug}: flow`);
    assert.ok(d.scope.length >= 6 && d.scope.length <= 8, `${slug}: scope`);
    assert.equal(d.gallery.length, 2, `${slug}: gallery`);
    assert.equal(d.faq.length, 3, `${slug}: faq`);
    for (const p of d.intro) for (const seg of p) assert.ok((typeof seg === "string" ? seg : seg.marker).length > 0, `${slug}: intro 空`);
    for (const f of d.features) assert.ok(f.title && f.text, `${slug}: features 空`);
    for (const i of d.issues) assert.ok(i.problem && i.solution, `${slug}: issues 空`);
    for (const f of d.flow) assert.ok(f.title && f.text, `${slug}: flow 空`);
    for (const s of d.scope) assert.ok(s.length > 0, `${slug}: scope 空`);
    for (const q of d.faq) assert.ok(q.q && q.a, `${slug}: faq 空`);
  }
});

test("service-details: マーカーは 1 段落 1 か所・1 ページ 3 か所まで（CLAUDE.md §4-1）", () => {
  for (const slug of slugs) {
    const d = getServiceDetail(slug);
    let total = 0;
    for (const p of d.intro) {
      const n = p.filter((seg) => typeof seg !== "string").length;
      assert.ok(n <= 1, `${slug}: 1 段落にマーカー ${n} 個`);
      total += n;
    }
    assert.ok(total <= 3, `${slug}: ページ内マーカー ${total} 個`);
  }
});

test("service-details: gallery の画像は manifest に存在し、alt がある", () => {
  for (const slug of slugs) {
    for (const g of getServiceDetail(slug).gallery) {
      assert.ok(g.src in manifest, `${slug}: ${g.src} が manifest に無い（npm run images 未実行？）`);
      assert.ok(g.alt.length > 0, `${slug}: alt 空`);
    }
  }
});
