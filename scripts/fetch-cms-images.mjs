// microCMS の画像（NEWS のサムネイル）をビルド時に取得して public/images/cms/ に同梱し、
// src/lib/images/cms-manifest.json を書く（CLAUDE.md §2-4: 画像を microCMS から直接配信しない）。
// 変換は microCMS の画像 API（imgix）に任せるので sharp は不要。`next build` の前に実行する。
// 環境変数が無い（microCMS 未接続）ときは空の manifest を書いて終了する。
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { CMS_DIR, cmsTargets } from "../src/lib/cms-images.ts";

const MANIFEST = "src/lib/images/cms-manifest.json";
const PUBLIC = "public";

// next build は .env.local を読むが、このスクリプトは npm 経由で先に走るので同じ規則（先勝ち）で読む
async function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of (await readFile(".env.local", "utf8")).split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    const v = m[2].trim().replace(/^"|"$/g, "");
    if (v) process.env[m[1]] = v;
  }
}
await loadEnvLocal();

// 前回の同梱物は毎回作り直す（削除された記事の画像を残さない）
await rm(`${PUBLIC}${CMS_DIR}`, { recursive: true, force: true });

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
await mkdir("src/lib/images", { recursive: true });
if (!DOMAIN || !KEY) {
  await writeFile(MANIFEST, "{}\n");
  console.log("cms-images: microCMS 未設定のためスキップ（manifest は空）");
  process.exit(0);
}

const res = await fetch(`https://${DOMAIN}.microcms.io/api/v1/news?limit=100&fields=id,thumbnail`, { headers: { "X-MICROCMS-API-KEY": KEY } });
if (!res.ok) throw new Error(`microCMS news ${res.status}`);
const { contents } = await res.json();

const manifest = {};
let n = 0;
for (const c of contents) {
  const t = c.thumbnail;
  if (!t?.url) continue;
  const { entry, downloads } = cmsTargets(t.url, `news-${c.id}`, t.width, t.height);
  for (const d of downloads) {
    const r = await fetch(d.url);
    if (!r.ok) throw new Error(`cms image ${r.status}: ${d.url}`);
    const file = `${PUBLIC}${d.file}`;
    await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
    await writeFile(file, Buffer.from(await r.arrayBuffer()));
  }
  manifest[t.url] = entry;
  n++;
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`cms-images: ${n} 枚を ${PUBLIC}/images/cms/ に同梱 → ${MANIFEST}`);
