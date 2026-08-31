/**
 * ビルド時の画像最適化。
 *
 * 静的エクスポートでは next/image の最適化サーバーが動かないため、
 * ビルド前にここで WebP / AVIF と複数サイズを生成しておく。
 *
 * 入力: public/images/**\/*.{jpg,jpeg,png}
 * 出力: public/_opt/<相対パス>-<幅>.{avif,webp}
 *
 * 生成物は components/ui/Picture.tsx が <picture> で出し分ける。
 *
 * 実行:  node scripts/optimize-images.mjs
 * package.json:  "prebuild": "node scripts/optimize-images.mjs"
 */

import { readdir, mkdir, stat } from "node:fs/promises";
import { join, relative, dirname, extname, basename } from "node:path";
import sharp from "sharp";

const SRC_DIR = "public/images";
const OUT_DIR = "public/_opt";

/** 生成する幅。SP / タブレット / PC / 高解像度 */
const WIDTHS = [400, 800, 1200, 1600];

/** 透過を保つ必要がある画像はここに含まれるパスで判定 */
const KEEP_ALPHA = ["/hero/", "/logo/"];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (/\.(jpe?g|png)$/i.test(e.name)) files.push(p);
  }
  return files;
}

async function optimize(file) {
  const rel = relative(SRC_DIR, file);
  const name = basename(rel, extname(rel));
  const outSubDir = join(OUT_DIR, dirname(rel));
  await mkdir(outSubDir, { recursive: true });

  const image = sharp(file);
  const meta = await image.metadata();
  const alpha = KEEP_ALPHA.some((k) => `/${rel}`.includes(k)) || meta.hasAlpha;

  // 元画像より大きいサイズは生成しない
  const widths = WIDTHS.filter((w) => w <= (meta.width ?? 0));
  if (widths.length === 0) widths.push(meta.width ?? 800);

  for (const w of widths) {
    const resized = sharp(file).resize({ width: w, withoutEnlargement: true });

    await resized
      .clone()
      .avif({ quality: alpha ? 60 : 55, effort: 4 })
      .toFile(join(outSubDir, `${name}-${w}.avif`));

    await resized
      .clone()
      .webp({ quality: alpha ? 82 : 78 })
      .toFile(join(outSubDir, `${name}-${w}.webp`));
  }

  return { rel, widths, width: meta.width, height: meta.height };
}

async function main() {
  try {
    await stat(SRC_DIR);
  } catch {
    console.log(`[optimize-images] ${SRC_DIR} が無いのでスキップします`);
    return;
  }

  const files = await walk(SRC_DIR);
  console.log(`[optimize-images] ${files.length} 件を処理します`);

  const manifest = {};
  for (const f of files) {
    const r = await optimize(f);
    manifest[r.rel] = { widths: r.widths, width: r.width, height: r.height };
    console.log(`  ✓ ${r.rel}  [${r.widths.join(", ")}]`);
  }

  // Picture.tsx が参照するマニフェスト。
  // width / height を持たせることで CLS を防ぐ。
  const { writeFile } = await import("node:fs/promises");
  await mkdir("src/lib/images", { recursive: true });
  await writeFile(
    "src/lib/images/manifest.json",
    JSON.stringify(manifest, null, 2),
  );

  console.log("[optimize-images] 完了");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
