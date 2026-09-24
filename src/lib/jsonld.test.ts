import { test } from "node:test";
import assert from "node:assert/strict";
import { breadcrumbJsonLd, organizationJsonLd, faqPageJsonLd, jobPostingJsonLd } from "./jsonld.ts";

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

test("Organization: SNS がトップページだけの仮値なら sameAs を出さない", () => {
  const j = organizationJsonLd({ name: "n", url: "https://maskoff.co.jp", address: "a", sns: { instagram: "https://www.instagram.com/", x: "https://x.com/" } });
  assert.equal("sameAs" in j, false);
  const k = organizationJsonLd({ name: "n", url: "https://maskoff.co.jp", address: "a", sns: { instagram: "https://www.instagram.com/maskoff", x: "https://x.com/" } });
  assert.deepEqual(k.sameAs, ["https://www.instagram.com/maskoff"]);
});

test("JobPosting: 必須項目と勤務地（本社）が入り、任意項目は指定時だけ出る", () => {
  const site = { name: "株式会社MasKOFF", url: "https://maskoff.co.jp", postalAddress: { postalCode: "150-0021", addressRegion: "東京都", addressLocality: "渋谷区", streetAddress: "恵比寿西1-33-6-216" } };
  const j = jobPostingJsonLd({ title: "セールススタッフ", description: "提案営業", datePosted: "2026-09-24", employmentType: "FULL_TIME" }, site);
  assert.equal(j["@type"], "JobPosting");
  assert.equal(j.hiringOrganization.name, "株式会社MasKOFF");
  assert.equal(j.jobLocation.address.postalCode, "150-0021");
  assert.equal(j.jobLocation.address.addressCountry, "JP");
  assert.equal("validThrough" in j, false);
  assert.equal("baseSalary" in j, false);
  const k = jobPostingJsonLd({ title: "t", description: "d", datePosted: "2026-09-24", validThrough: "2026-12-31", employmentType: "PART_TIME", salary: { min: 1200, unit: "HOUR" } }, site);
  assert.equal(k.validThrough, "2026-12-31");
  assert.equal(k.baseSalary?.value.minValue, 1200);
  assert.equal("maxValue" in (k.baseSalary?.value ?? {}), false);
});
