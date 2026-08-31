// public/images/**/*.{png,jpg,jpeg} → public/images/optimized/**/*.{avif,webp}
// 寸法は src/lib/images/manifest.json に書き出し、components/ui/Picture.tsx が import する。
// SVG は対象外（Picture が <img> で出力する）。透過 PNG のアルファは保持される。
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { join, relative, extname, dirname, posix } from "node:path";
import sharp from "sharp";

const SRC = "public/images";
const OUT = "public/images/optimized";
const MANIFEST = "src/lib/images/manifest.json";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (p !== OUT) out.push(...(await walk(p)));
    } else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = (await stat(SRC).catch(() => null)) ? await walk(SRC) : [];
await mkdir(OUT, { recursive: true });
await mkdir(dirname(MANIFEST), { recursive: true });

const manifest = {};
for (const file of files.sort()) {
  const rel = relative(SRC, file).split("\\").join("/");
  const base = rel.replace(extname(rel), "");
  const { width, height } = await sharp(file).metadata();
  const avif = posix.join(OUT, `${base}.avif`);
  const webp = posix.join(OUT, `${base}.webp`);
  await mkdir(dirname(avif), { recursive: true });
  await Promise.all([
    sharp(file).avif({ quality: 55 }).toFile(avif),
    sharp(file).webp({ quality: 78 }).toFile(webp),
  ]);
  manifest[`/images/${rel}`] = {
    width,
    height,
    avif: `/images/optimized/${base}.avif`,
    webp: `/images/optimized/${base}.webp`,
  };
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`optimized ${files.length} images → ${MANIFEST}`);
