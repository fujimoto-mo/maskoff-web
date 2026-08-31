// public/images/**/*.{jpg,jpeg,png} → public/images/optimized/**/*.{avif,webp} + manifest.json
// next/image が static export で使えないため、ビルド前に実行して Picture.tsx へ寸法を供給する。
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { join, relative, extname, dirname } from "node:path";
import sharp from "sharp";

const SRC = "public/images";
const OUT = "public/images/optimized";
const manifest = {};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (p !== OUT) out.push(...(await walk(p))); }
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}

await mkdir(OUT, { recursive: true });
const files = (await stat(SRC).catch(() => null)) ? await walk(SRC) : [];

for (const file of files) {
  const rel = relative(SRC, file);
  const base = rel.replace(extname(rel), "");
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const avif = join(OUT, `${base}.avif`);
  const webp = join(OUT, `${base}.webp`);
  await mkdir(dirname(avif), { recursive: true });
  await Promise.all([
    sharp(file).avif({ quality: 55 }).toFile(avif),
    sharp(file).webp({ quality: 78 }).toFile(webp),
  ]);
  manifest[`/images/${rel.replaceAll("\\", "/")}`] = {
    width, height,
    src: `/images/${rel.replaceAll("\\", "/")}`,
    avif: `/images/optimized/${base.replaceAll("\\", "/")}.avif`,
    webp: `/images/optimized/${base.replaceAll("\\", "/")}.webp`,
  };
}
await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`optimized ${files.length} images → ${OUT}/manifest.json`);
