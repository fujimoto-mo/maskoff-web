import { test } from "node:test";
import assert from "node:assert/strict";
import { cmsTargets, localizeImage } from "./cms-images.ts";

const REMOTE = "https://images.microcms-assets.io/assets/aaa/bbb/photo.png";

test("cmsTargets: 最大幅に縮小した寸法で AVIF / WebP / 元形式の 3 本を microCMS の画像 API から取る", () => {
  const { entry, downloads } = cmsTargets(REMOTE, "news-abc", 2492, 1664);
  assert.equal(entry.width, 1600);
  assert.equal(entry.height, 1068);
  assert.equal(entry.src, "/images/cms/news-abc.png");
  assert.equal(entry.avif, "/images/cms/news-abc.avif");
  assert.equal(entry.webp, "/images/cms/news-abc.webp");
  assert.deepEqual(
    downloads.map((d) => d.url),
    [`${REMOTE}?fm=avif&q=55&w=1600`, `${REMOTE}?fm=webp&q=78&w=1600`, `${REMOTE}?q=85&w=1600`],
  );
});

test("cmsTargets: 最大幅より小さい画像は拡大しない。jpeg は jpg に正規化", () => {
  const { entry } = cmsTargets("https://images.microcms-assets.io/x/y/a.jpeg", "n", 800, 600);
  assert.equal(entry.width, 800);
  assert.equal(entry.height, 600);
  assert.equal(entry.src, "/images/cms/n.jpg");
});

test("localizeImage: manifest にあればローカルへ差し替え、無ければ元のまま、undefined は undefined", () => {
  const img = { url: REMOTE, width: 2492, height: 1664 };
  const entry = cmsTargets(REMOTE, "news-abc", 2492, 1664).entry;
  assert.deepEqual(localizeImage(img, { [REMOTE]: entry }), { url: entry.src, width: 1600, height: 1068, avif: entry.avif, webp: entry.webp });
  assert.deepEqual(localizeImage(img, {}), img);
  assert.equal(localizeImage(undefined, {}), undefined);
});
