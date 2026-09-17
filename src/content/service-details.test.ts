import { test } from "node:test";
import assert from "node:assert/strict";
import { SERVICES } from "../lib/services.ts";
import manifest from "../lib/images/manifest.json" with { type: "json" };
import { SERVICE_DETAILS, getServiceDetail } from "./service-details.ts";

const slugs = SERVICES.map((s) => s.slug);
/** 承認表（spec 2026-09-17-service-layouts §1）: FAQ を持たない事業 */
const NO_FAQ = ["recruitment-ads", "cross-border-ec"];

test("service-details: SERVICES の全 slug に詳細があり、余分なキーが無い", () => {
  assert.deepEqual(Object.keys(SERVICE_DETAILS).sort(), [...slugs].sort());
  assert.throws(() => getServiceDetail("no-such-slug"));
});

test("service-details: intro は 2〜3 段落、マーカーは 1 段落 1 か所・1 ページ 3 か所まで", () => {
  for (const slug of slugs) {
    const d = getServiceDetail(slug);
    assert.ok(d.intro.length >= 2 && d.intro.length <= 3, `${slug}: intro`);
    let total = 0;
    for (const p of d.intro) {
      const n = p.filter((seg) => typeof seg !== "string").length;
      assert.ok(n <= 1, `${slug}: 1 段落にマーカー ${n} 個`);
      total += n;
      for (const seg of p) assert.ok((typeof seg === "string" ? seg : seg.marker).length > 0, `${slug}: intro 空`);
    }
    assert.ok(total <= 3, `${slug}: ページ内マーカー ${total} 個`);
  }
});

test("service-details: sections は 2〜7 個、各 type の個数制約、文字列は空でない", () => {
  for (const slug of slugs) {
    const d = getServiceDetail(slug);
    assert.ok(d.sections.length >= 2 && d.sections.length <= 7, `${slug}: sections ${d.sections.length}`);
    for (const s of d.sections) {
      const tag = `${slug}/${s.type}`;
      if ("en" in s) assert.ok(s.en && s.ja, `${tag}: 見出し`);
      switch (s.type) {
        case "cards":
          assert.equal(s.items.length, s.cols ?? 3, `${tag}: cards は cols と同数`);
          for (const c of s.items) assert.ok(c.title && c.text, `${tag}: 空`);
          break;
        case "issues":
          assert.ok(s.items.length >= 3 && s.items.length <= 4, tag);
          for (const c of s.items) assert.ok(c.problem && c.solution, `${tag}: 空`);
          break;
        case "flow":
          assert.ok(s.steps.length >= 3 && s.steps.length <= 8, tag);
          for (const c of s.steps) assert.ok(c.title && c.text, `${tag}: 空`);
          break;
        case "tiles":
        case "chips":
          assert.ok(s.items.length >= 4 && s.items.length <= 10, tag);
          for (const c of s.items) assert.ok(c.length > 0, `${tag}: 空`);
          break;
        case "product":
          assert.equal(s.points.length, 3, tag);
          break;
        case "cycle":
          assert.equal(s.items.length, 4, tag);
          break;
        case "notice":
          assert.ok(s.title && s.text, tag);
          break;
        case "faq":
          assert.equal(s.items.length, 3, tag);
          for (const c of s.items) assert.ok(c.q && c.a, `${tag}: 空`);
          break;
        case "media":
          assert.ok(s.image.src, tag);
          break;
      }
    }
  }
});

test("service-details: FAQ の有無は承認表どおり", () => {
  for (const slug of slugs) {
    const has = getServiceDetail(slug).sections.some((s) => s.type === "faq");
    assert.equal(has, !NO_FAQ.includes(slug), `${slug}: faq`);
  }
});

test("service-details: 画像は manifest に存在し、alt がある", () => {
  for (const slug of slugs) {
    for (const s of getServiceDetail(slug).sections) {
      const imgs: { src: string; alt: string }[] = [];
      if (s.type === "media" || s.type === "product") imgs.push(s.image);
      if (s.type === "cards" && s.image) imgs.push(s.image);
      if (s.type === "flow") for (const st of s.steps) if (st.image) imgs.push(st.image);
      for (const g of imgs) {
        assert.ok(g.src in manifest, `${slug}: ${g.src} が manifest に無い`);
        assert.ok(g.alt.length > 0, `${slug}: alt 空`);
      }
    }
  }
});
