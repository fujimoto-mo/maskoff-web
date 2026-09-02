import { test } from "node:test";
import assert from "node:assert/strict";
import { breadcrumbJsonLd, organizationJsonLd, faqPageJsonLd } from "./jsonld.ts";

test("Organization に PostalAddress と sameAs が入る", () => {
  const j = organizationJsonLd({
    name: "株式会社MasKOFF",
    url: "https://maskoff.co.jp",
    address: "東京都",
    sns: { instagram: "https://www.instagram.com/a", x: "https://x.com/a" },
  });
  assert.equal(j["@type"], "Organization");
  assert.equal(j.logo, "https://maskoff.co.jp/images/logo.png");
  assert.equal(j.address["@type"], "PostalAddress");
  assert.deepEqual(j.sameAs, ["https://www.instagram.com/a", "https://x.com/a"]);
});

test("FAQPage は Question/Answer の配列", () => {
  const j = faqPageJsonLd([{ question: "Q1?", answer: "A1" }]);
  assert.equal(j["@type"], "FAQPage");
  assert.equal(j.mainEntity.length, 1);
  assert.equal(j.mainEntity[0].name, "Q1?");
  assert.equal(j.mainEntity[0].acceptedAnswer.text, "A1");
});

test("breadcrumbJsonLd は position 連番と絶対 URL を出す", () => {
  const b = breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "会社情報", path: "/company/" }], "https://maskoff.co.jp");
  assert.equal(b.itemListElement.length, 2);
  assert.equal(b.itemListElement[1].position, 2);
  assert.equal(b.itemListElement[1].item, "https://maskoff.co.jp/company/");
});
