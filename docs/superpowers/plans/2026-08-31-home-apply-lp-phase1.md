# HOME（apply 型 LP）フェーズ① Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** creator.dipsy.com/apply の構成を踏襲した HOME と全ページ共通シェルを、CLAUDE.md 準拠で `src/` に新規実装し、クリーン環境で `npm ci && npm run build` が通る状態にする。

**Architecture:** Next.js 16 App Router の静的エクスポート（`output: "export"`）。UI は Tailwind v4 の `@theme` トークンだけで組み、SP の挙動（カルーセル / アコーディオン）は CSS scroll-snap と `<details>` で完結させる。サーバー処理は `worker/`（Cloudflare Workers）のみで、フォーム検証は `src/lib/schema/contact.ts` の zod スキーマを Worker と共有する。アニメーション（GSAP / Lenis）はフェーズ③に回し、本フェーズは CSS keyframes のマーキーと回転バッジのみ。

**Tech Stack:** Next.js 16.3 / React 19.2 / TypeScript 5.9 / Tailwind CSS 4.3（`@tailwindcss/postcss`）/ zod 4 / sharp 0.35 / Cloudflare Workers（wrangler 4）/ `node:test`（Node 24 のネイティブ TS 実行）

**Spec:** `docs/superpowers/specs/2026-08-31-home-apply-lp-design.md`

## Global Constraints

- Node は `.node-version` の **24.17.0**。`npm ci` を使う（`npm install` は Task 1 の lock 再生成のみ）。
- `next/image` 禁止。画像は `src/components/ui/Picture.tsx` 経由。`<img>` 直書き禁止（`Picture` 内部の SVG 経路のみ例外）。
- コンテナに `max-width` / `mx-auto` / `container` を使わない。左右は `--spacing-pad-x`（32px）/ `--spacing-pad-x-sp`（20px）のみ。
- 色は `tokens.css` の `@theme` 変数のみ。Tailwind 既定パレット（`gray-500` 等）と `style={{ color }}` 禁止。有彩色は `--color-marker #2E891E` と `--color-required #EF3B59` の 2 つだけ。
- モバイルでセクションを `display:none` にしない。
- `src/app/api/` を作らない。`wrangler.toml` の `run_worker_first = ["/api/*"]` を消さない。
- ブレークポイントは `max-sp:`（≤600）/ `sp:`（≥601）/ `max-nav:`（≤720）/ `max-tab:`（≤820）/ `max-form:`（≤900）/ `max-pc:`（≤960）/ `pc:`（≥961）のみ。Tailwind 既定の `sm:` `md:` `lg:` は `--breakpoint-*: initial` で無効化済み。
- Server Component 既定。`"use client"` は `MobileNav` / `StickyCta` / `CarouselDots` / `ContactForm` の 4 つだけ。
- 1 ファイル 1 コンポーネント、default export、必須 props を持つ部品は JSDoc に呼び出し例。
- ユニットテストは `node:test`。テスト対象は **内部 import を持たない葉モジュール**（`zod` 等の node_modules は可）。テストと葉モジュール内の相対 import は **`.ts` 拡張子付き**、型は `import type`。`worker/**` の相対 import も `.ts` 付き。
- `enum` / `namespace` / parameter property 禁止（`erasableSyntaxOnly`）。
- 文言・画像はすべてサンプル。差し替え対象には `// SAMPLE:` コメントを付ける。参考サイト（dipsy）の文章・写真は流用しない。
- コミットは日本語の `type: 要約` 形式（例 `feat: ヒーローのマーキーを追加`）。各 Task の最後に必ずコミット。
- ブランチ: `feat/home-apply-lp`（Task 1 で作成）。

---

## File Structure

| パス | 責務 |
|---|---|
| `package.json` `tsconfig.json` `next.config.ts` `.gitignore` | 基盤（Task 1） |
| `scripts/optimize-images.mjs` | `public/images/**` → AVIF/WebP + `src/lib/images/manifest.json`（Task 2） |
| `scripts/gen-sample-assets.mjs` | サンプル画像の生成（一度だけ実行、成果物をコミット）（Task 2） |
| `src/lib/images/manifest.json` | 画像寸法の単一情報源（コミットする）（Task 2） |
| `src/components/ui/Picture.tsx` | `<picture>` 出力。manifest 未登録は throw。SVG は `<img>`（Task 2） |
| `src/styles/tokens.css` | `@theme` トークン（Task 3） |
| `src/app/globals.css` | Tailwind import + 共通クラス（`.wrap` `.section` `.marker` `carousel` keyframes）（Task 3） |
| `src/app/layout.tsx` | フォント / metadata / Organization JSON-LD / Header / Footer / StickyCta（Task 3, 6, 16） |
| `src/lib/cn.ts` `src/lib/site.ts` | クラス結合 / サイト定数（Task 3） |
| `src/components/ui/{SectionHeading,Button,Marker,Field,JsonLd}.tsx` | UI 部品（Task 4） |
| `src/types/microcms.ts` `src/content/sample.ts` `src/lib/pinned.ts` `src/lib/jsonld.ts` `src/lib/microcms.ts` | データ層（Task 5） |
| `src/components/layout/{SkipLink,Header,MobileNav,Footer,NoticeBanner,StickyCta}.tsx` | 共通シェル（Task 6） |
| `src/components/motion/marquee-cells.ts` `src/components/motion/Marquee.tsx` `src/components/sections/Hero.tsx` | ヒーロー（Task 7） |
| `src/components/sections/VisionBlock.tsx` `public/images/company/*.svg` | VISION（Task 8） |
| `src/lib/services.ts` `src/components/ui/CarouselDots.tsx` `src/components/sections/ServiceGrid.tsx` | SERVICE（Task 9） |
| `src/lib/works.ts` `src/components/sections/WorksList.tsx` | WORKS（Task 10） |
| `src/lib/partners.ts` `src/components/sections/PartnerGrid.tsx` | PARTNERS（Task 11） |
| `src/components/sections/NewsStrip.tsx` | NEWS / NOTICE（Task 12） |
| `src/components/sections/FaqList.tsx` | FAQ + FAQPage JSON-LD（Task 13） |
| `src/components/sections/{StepFlow,ContactForm,ContactSection}.tsx` `src/app/contact/thanks/page.tsx` | CONTACT（Task 14） |
| `worker/lib/json.ts` `worker/index.ts` `worker/contact.ts` `worker/rebuild.ts` `worker/tsconfig.json` `wrangler.toml` `.dev.vars.example` | Worker（Task 15） |
| `src/app/{sitemap.ts,robots.ts,not-found.tsx}` `public/_redirects` | SEO（Task 16） |
| `CLAUDE.md` `docs/architecture.md` `README.md` | ドキュメント更新（Task 17） |
| — | 最終検証と dev サーバー起動（Task 18） |

---

### Task 1: 基盤の入れ替え（ブランチ・root ツリー削除・依存復元）

**Files:**
- Delete: `app/` `components/` `lib/` `content/` `Untitled`
- Modify: `package.json` `tsconfig.json` `next.config.ts` `.gitignore`
- Keep: `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico}` `src/styles/tokens.css` `src/lib/schema/contact.ts`（既存）

**Interfaces:**
- Produces: `@/*` → `./src/*` のパスエイリアス、`npm run typecheck` / `npm test` / `npm run build` の 3 コマンド

- [ ] **Step 1: ブランチを切る**

```bash
cd /root/maskoff-web/maskoff-web
git switch -c feat/home-apply-lp
```

- [ ] **Step 2: root の旧実装を削除する**

```bash
git rm -r -q app components lib content Untitled
ls   # app/ components/ lib/ content/ Untitled が無いこと
```

- [ ] **Step 3: `package.json` を置き換える**

```json
{
  "name": "maskoff-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "predev": "node scripts/optimize-images.mjs",
    "dev": "next dev",
    "prebuild": "node scripts/optimize-images.mjs",
    "build": "next build",
    "start": "npx serve out",
    "lint": "eslint",
    "typecheck": "tsc --noEmit && tsc -p worker/tsconfig.json --noEmit",
    "test": "node --test \"src/**/*.test.ts\" \"worker/**/*.test.ts\"",
    "images": "node scripts/optimize-images.mjs",
    "assets:sample": "node scripts/gen-sample-assets.mjs",
    "preview": "npm run build && wrangler dev",
    "deploy": "npm run build && wrangler deploy"
  },
  "dependencies": {
    "gsap": "^3.15.0",
    "lenis": "^1.3.26",
    "next": "^16.3.3",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "zod": "^4.5.4"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^5.20260830.1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.3",
    "prettier": "^3.9.6",
    "prettier-plugin-tailwindcss": "^0.8.1",
    "sharp": "^0.35.4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "wrangler": "^4.127.1"
  }
}
```

- [ ] **Step 4: `tsconfig.json` を置き換える**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules", "worker", "out", "scripts"]
}
```

- [ ] **Step 5: `next.config.ts` を置き換える**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers Static Assets へ静的エクスポート。API Routes は使えない（worker/ に書く）。
  output: "export",
  // 静的エクスポートでは最適化サーバーが動かない → scripts/optimize-images.mjs + components/ui/Picture.tsx
  images: { unoptimized: true },
  // /path/ 形式で出力（Cloudflare が index.html を素直に配信できる）
  trailingSlash: true,
  reactStrictMode: true,
  // リダイレクトは public/_redirects に書く（redirects() は静的エクスポートで無効）
};

export default nextConfig;
```

- [ ] **Step 6: `.gitignore` を置き換える**

```gitignore
node_modules
.next
out
.env*.local
.dev.vars
.wrangler
public/images/optimized
tsconfig.tsbuildinfo
next-env.d.ts
*:Zone.Identifier
```

- [ ] **Step 7: 依存を再インストールして lock を作り直す**

```bash
rm -rf node_modules package-lock.json
npm install
node -p "require('next/package.json').version"   # 16.x
node -p "require('tailwindcss/package.json').version"   # 4.x
ls node_modules/swiper 2>/dev/null || echo "swiper なし: OK"
```

- [ ] **Step 8: 既存の `src/` 雛形でビルドが通ることを確認する**

`src/app/globals.css` は `@import "tailwindcss"; @import "../styles/tokens.css";` のまま。`src/app/page.tsx` の `md:` 変種は Task 3 で消すので今は触らない。

```bash
npm run typecheck   # worker/tsconfig.json は既存のまま通る
npm run build       # prebuild が public/images を最適化 → out/index.html が出る
ls out/index.html
```

Expected: `✓ Compiled` と `Route (app) ┌ ○ /` が表示され、`out/index.html` が存在する。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "chore: root の旧実装を削除し src/ 構成と CLAUDE.md 世代の依存に戻す"
```

---

### Task 2: 画像パイプライン（manifest を `src/lib/images/` へ）・`Picture`・サンプル素材

**Files:**
- Modify: `scripts/optimize-images.mjs`
- Create: `scripts/gen-sample-assets.mjs`
- Create: `src/lib/images/manifest.json`（スクリプト出力、コミットする）
- Create: `src/components/ui/Picture.tsx`
- Create: `public/images/hero/hero-01..15.png` `public/images/service/svc-01..08.png` `public/images/works/logo-01..06.png` `public/images/works/w01-1..w06-5.png` `public/images/partners/p01..04.png` `public/images/partners/icon-01..04.png`（生成物）
- Delete: `public/images/works/01..06.jpg`（旧サンプル）

**Interfaces:**
- Produces: `Picture` props `{ src: string; alt: string; sizes?: string; width?: number; height?: number; className?: string; imgClassName?: string; priority?: boolean }`。ラスターは `sizes` 必須、`.svg` は `width` / `height` 必須。
- Produces: manifest の形 `Record<"/images/...", { width: number; height: number; avif: string; webp: string }>`

- [ ] **Step 1: `scripts/optimize-images.mjs` を置き換える**

```js
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
```

- [ ] **Step 2: サンプル素材ジェネレータ `scripts/gen-sample-assets.mjs` を作る**

```js
// サンプル画像を一度だけ生成する（成果物はコミット）。実データが揃ったら public/images を差し替えて削除してよい。
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const P = (...s) => `public/images/${s.join("/")}`;
const pad = (n) => String(n).padStart(2, "0");
const svgToPng = async (svg, path) => sharp(Buffer.from(svg)).png().toFile(path);

// --- ヒーロー: 透過 PNG 15 枚（不揃いなサイズ・シルエット） -------------------
const HERO_COLORS = ["#0a0a0a", "#2e891e", "#6b6b68", "#b3b3b3", "#444444"];
const heroShape = (i, w, h) => {
  const c = HERO_COLORS[i % HERO_COLORS.length];
  const shapes = [
    `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.42}" fill="${c}"/>`,
    `<rect x="${w * 0.15}" y="${h * 0.1}" width="${w * 0.7}" height="${h * 0.8}" rx="${w * 0.12}" fill="${c}"/>`,
    `<polygon points="${w / 2},${h * 0.08} ${w * 0.92},${h * 0.9} ${w * 0.08},${h * 0.9}" fill="${c}"/>`,
    `<path d="M${w * 0.2},${h * 0.3} C${w * 0.1},${h * 0.05} ${w * 0.7},${h * 0.02} ${w * 0.85},${h * 0.3} S${w * 0.95},${h * 0.9} ${w * 0.5},${h * 0.95} S${w * 0.05},${h * 0.7} ${w * 0.2},${h * 0.3}Z" fill="${c}"/>`,
    `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.42}" fill="none" stroke="${c}" stroke-width="${w * 0.12}"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes[i % shapes.length]}</svg>`;
};

// --- 汎用: 単色地 + ラベル ------------------------------------------------------
const labelCard = (w, h, bg, fg, label, sub = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <text x="50%" y="52%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${Math.min(w, h) * 0.16}" fill="${fg}">${label}</text>
    ${sub ? `<text x="50%" y="66%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.min(w, h) * 0.06}" fill="${fg}" opacity=".6">${sub}</text>` : ""}
  </svg>`;

await mkdir(P("hero"), { recursive: true });
await mkdir(P("service"), { recursive: true });
await mkdir(P("works"), { recursive: true });
await mkdir(P("partners"), { recursive: true });

const heroSizes = [[720, 820], [640, 640], [860, 700], [600, 900], [760, 760], [700, 620], [880, 880], [640, 760], [720, 720], [800, 600], [660, 860], [760, 640], [700, 700], [820, 740], [640, 680]];
for (let i = 0; i < 15; i++) {
  const [w, h] = heroSizes[i];
  await svgToPng(heroShape(i, w, h), P("hero", `hero-${pad(i + 1)}.png`));
}
for (let i = 1; i <= 8; i++) {
  await svgToPng(labelCard(800, 800, i % 2 ? "#eaeaea" : "#b3b3b3", "#0a0a0a", `SERVICE ${pad(i)}`, "SAMPLE"), P("service", `svc-${pad(i)}.png`));
}
for (let i = 1; i <= 6; i++) {
  await svgToPng(labelCard(400, 400, "#0a0a0a", "#ffffff", String.fromCharCode(64 + i)), P("works", `logo-${pad(i)}.png`));
  for (let k = 1; k <= 5; k++) {
    await svgToPng(labelCard(600, 600, k % 2 ? "#eaeaea" : "#f5f5f4", "#6b6b68", `W${pad(i)}-${k}`), P("works", `w${pad(i)}-${k}.png`));
  }
}
for (let i = 1; i <= 4; i++) {
  await svgToPng(labelCard(1050, 650, i % 2 ? "#444444" : "#6b6b68", "#ffffff", `PARTNER ${pad(i)}`, "SAMPLE"), P("partners", `p${pad(i)}.png`));
  await svgToPng(labelCard(176, 176, "#ffffff", "#0a0a0a", `P${i}`), P("partners", `icon-${pad(i)}.png`));
}
await writeFile(P("README.md"), "# サンプル画像\n\nscripts/gen-sample-assets.mjs で生成した仮画像。実データに差し替えたら `npm run images` で manifest を更新する。\n");
console.log("sample assets generated");
```

- [ ] **Step 3: 旧サンプルを消し、素材と manifest を生成する**

```bash
git rm -q public/images/works/01.jpg public/images/works/02.jpg public/images/works/03.jpg public/images/works/04.jpg public/images/works/05.jpg public/images/works/06.jpg
npm run assets:sample
npm run images
node -e "const m=require('./src/lib/images/manifest.json'); const k=Object.keys(m); console.log(k.length, k[0], m[k[0]])"
```

Expected: `63 /images/hero/hero-01.png { width: 720, height: 820, avif: '/images/optimized/hero/hero-01.avif', webp: ... }`（15 + 8 + 6 + 30 + 8 = 67 件に `logo.png` `ogp.png` を加えた 69 件前後。件数は `ls public/images -R | grep -c png` と一致すること）。

- [ ] **Step 4: `src/components/ui/Picture.tsx` を作る**

```tsx
import manifest from "@/lib/images/manifest.json";

type Entry = { width: number; height: number; avif: string; webp: string };
const MANIFEST = manifest as Record<string, Entry>;

type Props = {
  /** public/images 配下のパス。例 "/images/hero/hero-01.png" */
  src: string;
  alt: string;
  /** ラスター画像では必須。例 "(max-width: 600px) 80vw, 33vw" */
  sizes?: string;
  /** .svg のときだけ必須（manifest に載らないため） */
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  /** LCP 候補（ヒーロー先頭）だけ true */
  priority?: boolean;
};
// className は <picture> に、imgClassName は <img> に付く（SVG も同じ）

/**
 * static export では next/image が使えないため、scripts/optimize-images.mjs が生成した
 * AVIF / WebP と manifest.json から <picture> を組み立てる。width / height を必ず出力し CLS を防ぐ。
 *
 * @example
 * <Picture src="/images/service/svc-01.png" alt="" sizes="(max-width: 600px) 80vw, 33vw" imgClassName="size-full object-cover" />
 * <Picture src="/images/company/vision-handwriting.svg" alt="創ることが好きだ" width={640} height={160} />
 */
export default function Picture({ src, alt, sizes, width, height, className, imgClassName, priority = false }: Props) {
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  if (src.endsWith(".svg")) {
    if (!width || !height) throw new Error(`Picture: SVG (${src}) には width / height を渡してください`);
    // <picture> で包むと eslint の @next/next/no-img-element が許容する
    return (
      <picture className={className}>
        <img src={src} alt={alt} width={width} height={height} className={imgClassName} loading={loading} decoding="async" />
      </picture>
    );
  }

  const m = MANIFEST[src];
  if (!m) throw new Error(`Picture: ${src} が manifest にありません。npm run images を実行してください`);
  if (!sizes) throw new Error(`Picture: ${src} に sizes を指定してください`);

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={m.avif} sizes={sizes} />
      <source type="image/webp" srcSet={m.webp} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={m.width}
        height={m.height}
        sizes={sizes}
        className={imgClassName}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </picture>
  );
}
```

- [ ] **Step 5: 型チェックとビルド**

```bash
npm run typecheck
npm run build
ls public/images/optimized/hero | head -3
```

Expected: エラーなし。`hero-01.avif hero-01.webp ...` が並ぶ。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: 画像パイプラインを src/lib/images/manifest.json に統一し Picture とサンプル素材を追加"
```

---

### Task 3: トークン・共通 CSS・フォント・layout 骨格

**Files:**
- Modify: `src/styles/tokens.css`（全置換）
- Modify: `src/app/globals.css`（全置換）
- Modify: `src/app/layout.tsx`（全置換。Header 等は Task 6 で追加）
- Modify: `src/app/page.tsx`（暫定の骨格）
- Create: `src/lib/cn.ts` `src/lib/site.ts`

**Interfaces:**
- Produces: Tailwind ユーティリティ `wrap` `section-pad` `carousel` `marker`、変種 `max-sp:` `sp:` `max-nav:` `max-tab:` `max-form:` `max-pc:` `pc:`、`text-display` `text-display-sp` `text-sub` `text-sub-sp` `text-body` `text-caption` `text-card-title` `text-card-title-sp` `text-nav`、spacing `pad-x` `pad-x-sp` `header-h` `section-t` `section-b` `fv-gap` `head-mb` `head-mb-sp` `gap-service-row` `gap-service-col` `gap-card` `gap-cols` `mq-cell` `mq-gap`、radius `card` `visual` `form` `input` `btn` `pill`、色 `bg` `bg-dark` `surface` `surface-alt` `fg` `fg-body` `fg-muted` `fg-invert` `border` `placeholder-text` `marker` `required` `disabled`
- Produces: `cn(...parts: Array<string | false | null | undefined>): string`
- Produces: `SITE` `NAV` `SUB_NAV` 定数（型は `as const`）

- [ ] **Step 1: `src/styles/tokens.css` を置き換える**

```css
/* ============================================================
   デザイントークン（creator.dipsy.com/apply の実測値。2026-08-31 spec §5）
   値の変更は CLAUDE.md の更新提案を先に出すこと。
   ============================================================ */
@theme {
  /* --- ブレークポイント（Tailwind 既定の sm/md/lg は無効化）------------
     max-sp: ≤600 / sp: ≥601 / max-nav: ≤720 / max-tab: ≤820
     max-form: ≤900 / max-pc: ≤960 / pc: ≥961 */
  --breakpoint-*: initial;
  --breakpoint-sp: 601px;
  --breakpoint-nav: 721px;
  --breakpoint-tab: 821px;
  --breakpoint-form: 901px;
  --breakpoint-pc: 961px;

  /* --- 色（有彩色は marker / required の 2 つだけ）------------------- */
  --color-bg: #ffffff;
  --color-bg-dark: #0a0a0a;
  --color-bg-mid: #b3b3b3;
  --color-surface: #f9f9f9;
  --color-surface-alt: #f5f5f4;
  --color-placeholder: #eaeaea;
  --color-fg: #0a0a0a;
  --color-fg-body: #444444;
  --color-fg-muted: #6b6b68;
  --color-fg-invert: #ffffff;
  --color-border: #e4e4e1;
  --color-placeholder-text: #b5b5b2;
  --color-marker: #2e891e;
  --color-required: #ef3b59;
  --color-disabled: #a9a9a9;

  /* --- レイアウト ------------------------------------------------- */
  --spacing-pad-x: 32px;
  --spacing-pad-x-sp: 20px;
  --spacing-header-h: 64px;
  --spacing-section-t: clamp(80px, 10vw, 132px);
  --spacing-section-b: clamp(92px, 11vw, 144px);
  --spacing-fv-gap: clamp(110px, 11vw, 170px);
  --spacing-head-mb: 40px;
  --spacing-head-mb-sp: 32px;
  --spacing-gap-service-row: clamp(48px, 6vw, 72px);
  --spacing-gap-service-col: clamp(28px, 4vw, 56px);
  --spacing-gap-card: 18px;
  --spacing-gap-cols: 64px;
  --spacing-mq-cell: clamp(148px, 20vw, 256px);
  --spacing-mq-gap: clamp(20px, 2.8vw, 32px);

  /* --- 角丸 ------------------------------------------------------- */
  --radius-card: 8px;
  --radius-visual: 10px;
  --radius-form: 18px;
  --radius-input: 6px;
  --radius-btn: 8px;
  --radius-pill: 999px;

  /* --- タイポグラフィ --------------------------------------------- */
  --text-display: clamp(27px, 4.8vw, 46px);
  --text-display--line-height: 1;
  --text-display--letter-spacing: -0.045em;
  --text-display--font-weight: 700;
  --text-display-sp: min(13vw, 60px);
  --text-display-sp--line-height: 1;
  --text-display-sp--letter-spacing: -0.045em;
  --text-display-sp--font-weight: 700;
  --text-sub: 14px;
  --text-sub--line-height: 1.2;
  --text-sub--letter-spacing: 0.05em;
  --text-sub--font-weight: 500;
  --text-sub-sp: 13px;
  --text-sub-sp--line-height: 1.2;
  --text-sub-sp--letter-spacing: 0.05em;
  --text-sub-sp--font-weight: 500;
  --text-body: 14px;
  --text-body--line-height: 1.8;
  --text-body-sp: 13px;
  --text-body-sp--line-height: 1.8;
  --text-caption: 12px;
  --text-caption--line-height: 1.75;
  --text-card-title: 20px;
  --text-card-title--line-height: 1.45;
  --text-card-title--letter-spacing: -0.01em;
  --text-card-title--font-weight: 700;
  --text-card-title-sp: 16px;
  --text-card-title-sp--line-height: 1.5;
  --text-card-title-sp--font-weight: 700;
  --text-nav: 13px;
  --text-nav--line-height: 1.5;
  --text-nav--letter-spacing: 0.02em;
  --text-nav--font-weight: 500;

  /* --- モーション ------------------------------------------------- */
  --ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-sym: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 300ms;
  --duration-base: 550ms;
  --duration-slow: 900ms;
  --duration-marker: 850ms;
}

/* next/font が <html> に付ける変数を参照するため inline で定義 */
@theme inline {
  --font-display: var(--font-inter-tight), "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-body: var(--font-inter-tight), var(--font-noto), "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

- [ ] **Step 2: `src/app/globals.css` を置き換える**

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }
  body {
    background: var(--color-bg);
    color: var(--color-fg-body);
    font-family: var(--font-body);
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    font-feature-settings: "palt";
    -webkit-font-smoothing: antialiased;
  }
  @media (width < 601px) {
    body {
      font-size: var(--text-body-sp);
    }
  }
  h1, h2, h3, h4 {
    color: var(--color-fg);
  }
  :where(a, button, input, textarea, select, summary):focus-visible {
    outline: 2px solid var(--color-fg);
    outline-offset: 2px;
  }
  /* MobileNav が開いている間はスクロールを止める */
  [data-menu-open] body {
    overflow: hidden;
  }
}

/* フルブリード。max-width / mx-auto は使わない（CLAUDE.md §3-1） */
@utility wrap {
  padding-inline: var(--spacing-pad-x);
  @media (width < 601px) {
    padding-inline: var(--spacing-pad-x-sp);
  }
}

@utility section-pad {
  padding-block: var(--spacing-section-t) var(--spacing-section-b);
}

/* SP の横スワイプ（CSS scroll-snap）。子要素は幅 80% で中央スナップ、次カードが peek する */
@utility carousel {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-inline: calc(var(--spacing-pad-x-sp) * -1);
  padding: 4px var(--spacing-pad-x-sp);
  &::-webkit-scrollbar {
    display: none;
  }
  & > * {
    flex: 0 0 80%;
    scroll-snap-align: center;
  }
}

/* 緑マーカー。左から右へ描画。フェーズ③で ScrollTrigger が .is-active を付ける（①は常時付与） */
@utility marker {
  background-image: linear-gradient(
    transparent 40%,
    color-mix(in srgb, var(--color-marker) 50%, transparent) 40% 94%,
    transparent 94%
  );
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 0% 100%;
  transition: background-size var(--duration-marker) var(--ease-sym);
  &.is-active {
    background-size: 100% 100%;
  }
}

/* マーキーと回転バッジ */
@keyframes drift {
  to { transform: translateX(-50%); }
}
@keyframes drift-rev {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .marker {
    background-size: 100% 100%;
  }
}
```

- [ ] **Step 3: `src/lib/cn.ts` を作る**

```ts
/** クラス名を結合する。falsy は捨てる。 @example cn("a", cond && "b") // "a b" */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

- [ ] **Step 4: `src/lib/site.ts` を作る**

```ts
// SAMPLE: 住所・電話・SNS は仮。公開前に実データへ差し替える。
export const SITE = {
  name: "株式会社MasKOFF",
  nameEn: "MasKOFF Inc.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maskoff.co.jp",
  tagline: "TAKE THE MASK OFF",
  description:
    "MASK OFF には「仮面を外す」「素の自分」という意味があります。株式会社MasKOFFは、アパレル企画・製造販売、アーティスト活動支援、ホームページ制作を通じて、人と企業の「素」を引き出します。",
  address: "〒000-0000 東京都○○区○○ 1-2-3 ○○ビル 5F",
  tel: "03-0000-0000",
  email: "info@maskoff.co.jp",
  sns: {
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
} as const;

/** ヘッダー・フッターの主要ナビ。HOME 内アンカーではなくサイト共通（spec §3-7） */
export const NAV = [
  { href: "/company/", label: "COMPANY", ja: "会社情報" },
  { href: "/service/", label: "SERVICE", ja: "事業内容" },
  { href: "/news/", label: "NEWS", ja: "ニュース" },
  { href: "/recruit/", label: "RECRUIT", ja: "採用情報" },
] as const;

export const SUB_NAV = [
  { href: "/notice/", label: "お知らせ" },
  { href: "/privacy-policy/", label: "プライバシーポリシー" },
] as const;
```

- [ ] **Step 5: `src/app/layout.tsx` を置き換える**

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

// ビルド時に取得してセルフホストする（外部リクエストなし・CLS なし）
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}｜${SITE.tagline}`, template: `%s｜${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: "ja_JP", images: ["/images/ogp.png"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${interTight.variable} ${notoSansJP.variable}`}>
      <body className="bg-bg text-fg-body antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: `src/app/page.tsx` を暫定の骨格に置き換える（Task 7 で本実装）**

```tsx
export default function HomePage() {
  return (
    <main id="main" className="wrap section-pad">
      <h1 className="font-display text-display max-sp:text-display-sp text-fg">MasKOFF</h1>
      <p className="mt-1.5 text-sub text-fg-muted">HOME（構築中）</p>
    </main>
  );
}
```

- [ ] **Step 7: ビルドして生成 CSS にトークンが出ていることを確認**

```bash
npm run typecheck && npm run build
grep -o 'width < 601px' out/_next/static/chunks/*.css | head -1
grep -oE -- '--spacing-pad-x: ?32px' out/_next/static/chunks/*.css | head -1
grep -c 'md\\:' out/_next/static/chunks/*.css || echo "md: 変種なし: OK"
```

Expected: 3 つとも該当行が出る（`md:` は 0 件）。

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "feat: 実測トークン・共通 CSS・next/font を導入し layout を骨格化"
```

---

### Task 4: UI 部品（SectionHeading / Button / Marker / Field / JsonLd）

**Files:**
- Create: `src/components/ui/SectionHeading.tsx` `src/components/ui/Button.tsx` `src/components/ui/Marker.tsx` `src/components/ui/Field.tsx` `src/components/ui/JsonLd.tsx`
- Modify: `src/app/page.tsx`（スモーク用に一時的に使う）

**Interfaces:**
- Produces: `SectionHeading({ en, ja, as?, id?, invert?, className? })` — `en` の `\n` は SP のみ改行
- Produces: `Button({ href?, type?, variant?: "pill"|"block"|"line", disabled?, className?, dot?, children })`
- Produces: `Marker({ children })`
- Produces: `Field({ label, htmlFor, required?, error?, hint?, children })` と `INPUT_CLASS` 定数
- Produces: `JsonLd({ data: Record<string, unknown> })`

- [ ] **Step 1: `SectionHeading.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** 英字見出し。"OFFICIAL\nCREATORS" のように \n を入れると SP でだけ改行する */
  en: string;
  /** 和文の従見出し */
  ja: string;
  as?: "h1" | "h2";
  /** section の aria-labelledby から参照する id */
  id?: string;
  /** 黒背景セクションで true */
  invert?: boolean;
  className?: string;
};

/**
 * 全セクション共通の見出し。英字が主・和文が従の序列をここで担保する。
 * @example <SectionHeading en="SERVICE" ja="事業内容" id="service-title" />
 */
export default function SectionHeading({ en, ja, as = "h2", id, invert = false, className }: Props) {
  const Tag = as;
  const nodes: ReactNode[] = en
    .split("\n")
    .flatMap((line, i) => (i === 0 ? [line] : [<br key={`br-${i}`} className="hidden max-sp:inline" />, line]));
  return (
    <div className={cn("mb-head-mb max-sp:mb-head-mb-sp", className)}>
      <Tag id={id} className={cn("-ml-[0.045em] font-display text-display max-sp:text-display-sp", invert ? "text-fg-invert" : "text-fg")}>
        {nodes}
      </Tag>
      <p className={cn("mt-1.5 ml-[3px] text-sub max-sp:text-sub-sp", invert ? "text-fg-invert/70" : "text-fg-muted")}>{ja}</p>
    </div>
  );
}
```

- [ ] **Step 2: `Button.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "pill" | "block" | "line";
type Props = {
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  /** 左に白点（ヘッダー CTA） */
  dot?: boolean;
  children: ReactNode;
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold tracking-[.02em] transition-opacity hover:opacity-[.88] disabled:cursor-not-allowed disabled:opacity-35";
const VARIANTS: Record<Variant, string> = {
  pill: "rounded-pill bg-fg px-[22px] py-2.5 text-[13px] text-fg-invert",
  block: "w-full rounded-btn bg-fg px-[34px] py-[18px] text-[16px] text-fg-invert max-tab:text-[14px]",
  line: "rounded-pill border border-fg px-[22px] py-2.5 text-[13px] text-fg",
};

/**
 * @example <Button href="/contact/" dot>お問い合わせ</Button>
 * @example <Button type="submit" variant="block" disabled={busy}>送信する</Button>
 */
export default function Button({ href, type = "button", variant = "pill", disabled, className, dot = false, children }: Props) {
  const cls = cn(BASE, VARIANTS[variant], className);
  const inner = (
    <>
      {dot && <span aria-hidden className="size-2 rounded-full bg-current" />}
      {children}
    </>
  );
  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled}>
      {inner}
    </button>
  );
}
```

- [ ] **Step 3: `Marker.tsx`**

```tsx
import type { ReactNode } from "react";

/**
 * 本文中のキーフレーズに緑マーカー。1 セクション 2〜3 箇所まで（CLAUDE.md §4-1）。
 * @example <p>私たちは<Marker>素の自分</Marker>を引き出します。</p>
 */
export default function Marker({ children }: { children: ReactNode }) {
  return <span className="marker is-active text-fg">{children}</span>;
}
```

- [ ] **Step 4: `Field.tsx`**

```tsx
import type { ReactNode } from "react";

/** input / select / textarea に付ける共通クラス（dipsy の入力欄実測） */
export const INPUT_CLASS =
  "w-full rounded-input border-[1.5px] border-transparent bg-surface-alt px-[15px] py-4 text-[14px] text-fg placeholder:text-placeholder-text transition-colors focus:border-fg focus:outline-none aria-invalid:border-required max-tab:text-[16px]";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  /** エラー文。id は `${htmlFor}-error` で出力するので input 側の aria-describedby に渡す */
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
};

/**
 * @example
 * <Field label="お名前" htmlFor="name" required error={errors.name}>
 *   <input id="name" name="name" className={INPUT_CLASS} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
 * </Field>
 */
export default function Field({ label, htmlFor, required = false, error, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-fg">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-required">
            *
          </span>
        )}
      </label>
      {children}
      {hint}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-caption text-required">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: `JsonLd.tsx`**

```tsx
/** 構造化データを <script type="application/ld+json"> で出力する。 @example <JsonLd data={organizationJsonLd(SITE)} /> */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
```

- [ ] **Step 6: `src/app/page.tsx` で一時的に使ってスモーク**

```tsx
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Marker from "@/components/ui/Marker";

export default function HomePage() {
  return (
    <main id="main" className="wrap section-pad">
      <SectionHeading as="h1" en={"OFFICIAL\nCREATORS"} ja="見出しの確認" id="home-title" />
      <p>
        本文の<Marker>マーカー</Marker>確認。
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/contact/" dot>お問い合わせ</Button>
        <Button variant="line" href="/news/">すべて見る</Button>
      </div>
    </main>
  );
}
```

```bash
npm run typecheck && npm run build
grep -o 'hidden max-sp:inline' out/index.html | head -1
```

Expected: ビルド成功。`<br class="hidden max-sp:inline">` が HTML にある。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: SectionHeading / Button / Marker / Field / JsonLd を追加"
```

---

### Task 5: データ層（型・サンプル・`selectPinned` / `formatDate` / JSON-LD ビルダー・microCMS クライアント）

**Files:**
- Create: `src/types/microcms.ts` `src/content/sample.ts` `src/lib/pinned.ts` `src/lib/date.ts` `src/lib/jsonld.ts` `src/lib/microcms.ts`
- Test: `src/lib/pinned.test.ts` `src/lib/date.test.ts` `src/lib/jsonld.test.ts`

**Interfaces:**
- Produces: `selectPinned<T extends { isPinned?: boolean; publishedDate: string; expiresAt?: string }>(list: readonly T[], now?: Date): T | null`
- Produces: `formatDate(iso: string): string` → `"2026.08.31"`（JST）
- Produces: `organizationJsonLd(site: { name; url; address; sns: { instagram; x } })` / `faqPageJsonLd(items: ReadonlyArray<{ question; answer }>)`
- Produces: `getNews() getNotice() getFaq() getMembers() getJobs() getPinnedNotice()`、`NEWS_CATEGORY_LABELS`、`first(v)`
- 注意: microCMS のセレクトフィールドは単一選択でも **配列**で返る。`category` `level` `employmentType` は `X[]` 型にし、表示時は `first()` で取り出す。

- [ ] **Step 1: `src/types/microcms.ts`**

```ts
// docs/microcms-schemas/*.json と 1:1。フィールドを増やすときは JSON と同時に更新する。
export type MicroImage = { url: string; width: number; height: number };

type Base = { id: string; createdAt: string; updatedAt: string; publishedAt: string; revisedAt: string };

export type NewsCategory = "press" | "works" | "media" | "event";
export type News = Base & {
  title: string;
  slug: string;
  category: NewsCategory[]; // microCMS のセレクトは配列で返る
  publishedDate: string;
  thumbnail?: MicroImage;
  excerpt?: string;
  body: string; // HTML
};

export type NoticeLevel = "normal" | "important" | "urgent";
export type Notice = Base & {
  title: string;
  slug: string;
  level: NoticeLevel[];
  isPinned?: boolean;
  publishedDate: string;
  expiresAt?: string;
  body: string;
};

export type FaqCategory = "service" | "price" | "flow" | "recruit";
export type Faq = Base & { question: string; answer: string; note?: string; category?: FaqCategory[]; order: number };

export type Member = Base & {
  name: string;
  slug: string;
  role: string;
  avatar: MicroImage;
  bio: string;
  markerPhrases?: string;
  worksImages?: MicroImage[];
  instagram?: string;
  externalUrl?: string;
  order: number;
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
export type Job = Base & {
  title: string;
  slug: string;
  employmentType: EmploymentType[];
  description: string;
  requirements: string;
  preferred?: string;
  salaryMin?: number;
  salaryMax?: number;
  workLocation: string;
  workHours?: string;
  benefits?: string;
  validThrough?: string;
  isOpen: boolean;
  order: number;
};
```

- [ ] **Step 2: `src/lib/pinned.test.ts` を先に書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPinned } from "./pinned.ts";

const now = new Date("2026-08-31T00:00:00Z");
const item = (over: Partial<{ isPinned: boolean; publishedDate: string; expiresAt: string; id: string }>) => ({
  id: "x",
  publishedDate: "2026-08-01T00:00:00Z",
  ...over,
});

test("isPinned でないものは選ばない", () => {
  assert.equal(selectPinned([item({ isPinned: false })], now), null);
});

test("expiresAt を過ぎたものは除外する", () => {
  assert.equal(selectPinned([item({ isPinned: true, expiresAt: "2026-08-30T00:00:00Z" })], now), null);
});

test("expiresAt 未設定なら掲出する", () => {
  assert.equal(selectPinned([item({ isPinned: true, id: "a" })], now)?.id, "a");
});

test("複数あれば publishedDate が新しい方", () => {
  const list = [
    item({ isPinned: true, id: "old", publishedDate: "2026-07-01T00:00:00Z" }),
    item({ isPinned: true, id: "new", publishedDate: "2026-08-20T00:00:00Z" }),
  ];
  assert.equal(selectPinned(list, now)?.id, "new");
});

test("空配列は null", () => {
  assert.equal(selectPinned([], now), null);
});
```

- [ ] **Step 3: 失敗を確認**

```bash
npm test
```

Expected: `Cannot find module '.../src/lib/pinned.ts'` で fail。

- [ ] **Step 4: `src/lib/pinned.ts`（葉モジュール。内部 import なし）**

```ts
export type Pinnable = { isPinned?: boolean; publishedDate: string; expiresAt?: string };

/**
 * HOME 最上部に帯で出す NOTICE を 1 件選ぶ。isPinned かつ expiresAt 未到来のうち最新。
 * @example const n = selectPinned(await getNotice()); if (n) <NoticeBanner />
 */
export function selectPinned<T extends Pinnable>(list: readonly T[], now: Date = new Date()): T | null {
  const t = now.getTime();
  const live = list.filter((n) => n.isPinned === true && (!n.expiresAt || new Date(n.expiresAt).getTime() > t));
  live.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  return live[0] ?? null;
}
```

- [ ] **Step 5: `src/lib/date.test.ts` を書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate } from "./date.ts";

test("ISO を JST の YYYY.MM.DD にする", () => {
  assert.equal(formatDate("2026-08-31T00:00:00.000Z"), "2026.08.31");
});

test("UTC 深夜は JST では翌日", () => {
  assert.equal(formatDate("2026-08-31T15:30:00.000Z"), "2026.09.01");
});
```

- [ ] **Step 6: `src/lib/date.ts`**

```ts
const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });

/** ISO 日時 → "2026.08.31"（JST）。一覧の日付表示に使う。 */
export function formatDate(iso: string): string {
  return fmt.format(new Date(iso)).replaceAll("/", ".");
}
```

- [ ] **Step 7: `src/lib/jsonld.test.ts` を書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { organizationJsonLd, faqPageJsonLd } from "./jsonld.ts";

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
```

- [ ] **Step 8: `src/lib/jsonld.ts`（葉モジュール）**

```ts
type OrgInput = { name: string; url: string; address: string; sns: { instagram: string; x: string } };

/** 全ページ共通の Organization（layout.tsx で 1 回だけ出力） */
export function organizationJsonLd(site: OrgInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo.png`,
    address: { "@type": "PostalAddress", addressCountry: "JP", streetAddress: site.address },
    sameAs: [site.sns.instagram, site.sns.x],
  };
}

/** FAQ セクションの FAQPage。注記（note）は含めない */
export function faqPageJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
```

- [ ] **Step 9: テストが通ることを確認**

```bash
npm test
```

Expected: `tests 9` `pass 9` `fail 0`。

- [ ] **Step 10: `src/content/sample.ts`**

```ts
// SAMPLE: microCMS 未接続時に使うサンプル。文言はすべて仮。
import type { News, Notice, Faq, Member, Job } from "@/types/microcms";

const base = (id: string, date: string) => ({ id, createdAt: date, updatedAt: date, publishedAt: date, revisedAt: date });

const news: News[] = [
  { ...base("n001", "2026-08-31T00:00:00.000Z"), title: "コーポレートサイトをリニューアルしました", slug: "renewal-2026", category: ["press"], publishedDate: "2026-08-31T00:00:00.000Z", excerpt: "事業内容と採用情報を整理し、お問い合わせ導線を改善しました。", body: "<p>株式会社MasKOFFは本日、コーポレートサイトを全面リニューアルしました。</p>" },
  { ...base("n002", "2026-07-15T00:00:00.000Z"), title: "自社ブランドの 2026 秋冬コレクションを発表", slug: "aw2026", category: ["works"], publishedDate: "2026-07-15T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
  { ...base("n003", "2026-06-02T00:00:00.000Z"), title: "業界誌にアパレル OEM の取り組みが掲載されました", slug: "media-2026-06", category: ["media"], publishedDate: "2026-06-02T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
  { ...base("n004", "2026-04-10T00:00:00.000Z"), title: "アーティスト支援プログラム第 2 期の参加者を募集", slug: "artist-program-2", category: ["event"], publishedDate: "2026-04-10T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
];

const notice: Notice[] = [
  { ...base("t001", "2026-08-01T00:00:00.000Z"), title: "夏季休業のお知らせ（8/13〜8/16）", slug: "summer-2026", level: ["important"], isPinned: true, publishedDate: "2026-08-01T00:00:00.000Z", body: "<p>誠に勝手ながら、下記期間を夏季休業とさせていただきます。</p>" },
  { ...base("t002", "2026-05-20T00:00:00.000Z"), title: "お問い合わせフォームのメンテナンスについて", slug: "maintenance-2026-05", level: ["normal"], publishedDate: "2026-05-20T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
];

const faq: Faq[] = [
  { ...base("f1", "2026-01-01T00:00:00.000Z"), question: "相談や見積もりは無料ですか?", answer: "はい。初回のヒアリングとお見積りは無料です。フォームからご連絡ください。", category: ["price"], order: 1 },
  { ...base("f2", "2026-01-01T00:00:00.000Z"), question: "地方や海外からでも依頼できますか?", answer: "可能です。打ち合わせはオンラインで行い、全国・海外のお客様とお取引しています。", category: ["flow"], order: 2 },
  { ...base("f3", "2026-01-01T00:00:00.000Z"), question: "小ロットのアパレル製造にも対応していますか?", answer: "対応しています。企画からサンプル制作、量産まで一貫してお受けします。", note: "※ 素材や仕様によって最小ロットが異なります。", category: ["service"], order: 3 },
  { ...base("f4", "2026-01-01T00:00:00.000Z"), question: "ホームページ制作の期間はどれくらいですか?", answer: "規模によりますが、コーポレートサイトで 1.5〜3 か月が目安です。", category: ["flow"], order: 4 },
  { ...base("f5", "2026-01-01T00:00:00.000Z"), question: "アーティスト活動支援とは何をしてもらえますか?", answer: "グッズ製作、EC 構築、イベント出展のサポートなど、活動に必要な実務を伴走します。", category: ["service"], order: 5 },
  { ...base("f6", "2026-01-01T00:00:00.000Z"), question: "未経験でも採用に応募できますか?", answer: "できます。学歴・経験不問で、入社後に基礎から学べる体制があります。", category: ["recruit"], order: 6 },
];

const members: Member[] = [
  { ...base("m1", "2026-01-01T00:00:00.000Z"), name: "○○ ○○", slug: "ceo", role: "代表取締役", avatar: { url: "/images/works/logo-01.png", width: 400, height: 400 }, bio: "アパレルブランドの立ち上げを経て、株式会社MasKOFFを設立。", order: 1 },
  { ...base("m2", "2026-01-01T00:00:00.000Z"), name: "○○ ○○", slug: "director", role: "取締役 / クリエイティブ", avatar: { url: "/images/works/logo-02.png", width: 400, height: 400 }, bio: "Web 制作とアーティスト支援を統括。", order: 2 },
];

const jobs: Job[] = [
  { ...base("j001", "2026-08-01T00:00:00.000Z"), title: "Web エンジニア", slug: "web-engineer", employmentType: ["FULL_TIME"], description: "<p>コーポレートサイト・EC の設計と実装。</p>", requirements: "<ul><li>Web 開発の実務経験 1 年以上</li></ul>", workLocation: "東京本社 / フルリモート可", isOpen: true, order: 1 },
  { ...base("j002", "2026-07-10T00:00:00.000Z"), title: "アパレル企画", slug: "apparel-planner", employmentType: ["FULL_TIME"], description: "<p>自社ブランドと OEM の企画・生産管理。</p>", requirements: "<ul><li>学歴・経験不問</li></ul>", workLocation: "東京本社", isOpen: true, order: 2 },
  { ...base("j003", "2026-06-01T00:00:00.000Z"), title: "アーティスト支援コーディネーター", slug: "artist-coordinator", employmentType: ["CONTRACTOR"], description: "<p>アーティストの活動計画づくりとイベント運営。</p>", requirements: "<ul><li>イベント運営経験があれば歓迎</li></ul>", workLocation: "東京本社", isOpen: true, order: 3 },
];

export const SAMPLE = { news, notice, faq, members, jobs };
```

- [ ] **Step 11: `src/lib/microcms.ts`**

```ts
/**
 * microCMS クライアント（ビルド時のみ実行）。
 * 環境変数が無ければ content/sample.ts を返すので、未契約でも next build が通る。
 * 画像は microCMS から直接配信しない（CLAUDE.md §2-4）。HOME では CMS 画像を使わない。
 */
import { SAMPLE } from "@/content/sample";
import { selectPinned } from "@/lib/pinned";
import type { News, Notice, Faq, Member, Job, NewsCategory } from "@/types/microcms";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
const ENABLED = Boolean(DOMAIN && KEY);

type ListRes<T> = { contents: T[]; totalCount: number };

async function list<T>(endpoint: string, sample: readonly T[], query: Record<string, string> = {}): Promise<T[]> {
  if (!ENABLED) return [...sample];
  const qs = new URLSearchParams({ limit: "100", ...query });
  const res = await fetch(`https://${DOMAIN}.microcms.io/api/v1/${endpoint}?${qs}`, {
    headers: { "X-MICROCMS-API-KEY": KEY as string },
  });
  if (!res.ok) throw new Error(`microCMS ${endpoint} ${res.status}`);
  return ((await res.json()) as ListRes<T>).contents;
}

export const getNews = () => list<News>("news", SAMPLE.news, { orders: "-publishedDate" });
export const getNotice = () => list<Notice>("notice", SAMPLE.notice, { orders: "-publishedDate" });
export const getFaq = () => list<Faq>("faq", SAMPLE.faq, { orders: "order" });
export const getMembers = () => list<Member>("members", SAMPLE.members, { orders: "order" });
export const getJobs = () => list<Job>("jobs", SAMPLE.jobs, { orders: "order", filters: "isOpen[equals]true" });

/** HOME 最上部の帯に出す NOTICE（無ければ null） */
export async function getPinnedNotice(): Promise<Notice | null> {
  return selectPinned(await getNotice());
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  press: "プレスリリース",
  works: "実績",
  media: "メディア掲載",
  event: "イベント",
};

/** microCMS のセレクト（配列）から先頭を取る */
export function first<T>(v: T | readonly T[] | undefined): T | undefined {
  return Array.isArray(v) ? (v[0] as T | undefined) : (v as T | undefined);
}
```

- [ ] **Step 12: 型チェック・テスト・コミット**

```bash
npm run typecheck && npm test
git add -A
git commit -m "feat: microCMS 型・サンプルデータ・selectPinned / formatDate / JSON-LD ビルダーを追加"
```

---

### Task 6: 共通シェル（SkipLink / Header / MobileNav / Footer / NoticeBanner / StickyCta）

**Files:**
- Create: `src/components/layout/SkipLink.tsx` `src/components/layout/Header.tsx` `src/components/layout/MobileNav.tsx` `src/components/layout/Footer.tsx` `src/components/layout/NoticeBanner.tsx` `src/components/layout/StickyCta.tsx`
- Modify: `src/app/layout.tsx` `src/app/page.tsx`

**Interfaces:**
- Consumes: `Button` `JsonLd` `cn` `SITE` `NAV` `SUB_NAV` `getPinnedNotice` `first` `organizationJsonLd`
- Produces: `layout.tsx` が `<main id="main">{children}</main>` を持つ。ページは `<main>` を書かない。
- Produces: `StickyCta` は `#contact` 要素の可視で消える（Task 14 の `ContactSection` が `id="contact"` を持つ）

- [ ] **Step 1: `SkipLink.tsx`**

```tsx
/** キーボード利用者向け。フォーカス時だけ左上に現れる */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-pill focus:bg-fg focus:px-4 focus:py-2 focus:text-fg-invert"
    >
      本文へスキップ
    </a>
  );
}
```

- [ ] **Step 2: `MobileNav.tsx`（client）**

```tsx
"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { NAV, SUB_NAV, SITE } from "@/lib/site";

/** ≤720px のハンバーガー + 全画面オーバーレイ。Header から呼ぶ。 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = `mobile-menu-${useId()}`;
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.setAttribute("data-menu-open", "");
      firstLink.current?.focus();
    } else {
      root.removeAttribute("data-menu-open");
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.removeAttribute("data-menu-open");
    };
  }, [open]);

  const bar = "absolute inset-x-[9px] h-[1.5px] bg-fg";
  return (
    <div className="ml-auto hidden max-nav:block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[100] -mr-2 size-10"
      >
        <span aria-hidden className={cn(bar, "transition-transform duration-300", open ? "top-[19px] rotate-45" : "top-[13px]")} />
        <span aria-hidden className={cn(bar, "top-[19px] transition-opacity duration-200", open && "opacity-0")} />
        <span aria-hidden className={cn(bar, "transition-transform duration-300", open ? "top-[19px] -rotate-45" : "top-[25px]")} />
      </button>

      <div id={panelId} role="dialog" aria-modal="true" aria-label="メニュー" hidden={!open} className="fixed inset-0 z-[95] bg-bg/92 backdrop-blur-[10px]">
        <nav aria-label="メイン（モバイル）" className="absolute inset-x-6 top-[calc(var(--spacing-header-h)+40px)] flex flex-col items-start gap-[18px]">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              ref={i === 0 ? firstLink : undefined}
              href={n.href}
              onClick={() => setOpen(false)}
              className="font-display text-[min(11.5vw,54px)] font-semibold leading-[1.05] tracking-[-.04em] text-fg"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-5 text-caption text-fg-muted">
            {SUB_NAV.map((s) => (
              <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>
                {s.label}
              </Link>
            ))}
          </div>
          <Button href="/contact/" dot className="mt-4 w-full py-[22px] text-[18px]">
            お問い合わせ
          </Button>
          <div className="mt-6 flex gap-6 text-caption font-medium tracking-[.06em] text-fg-muted">
            <a href={SITE.sns.instagram} target="_blank" rel="noopener">INSTAGRAM ↗</a>
            <a href={SITE.sns.x} target="_blank" rel="noopener">X ↗</a>
          </div>
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `Header.tsx`（Server）**

```tsx
import Link from "next/link";
import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import { NAV, SITE } from "@/lib/site";

/** 全ページ共通ヘッダー。ナビはサイト共通（HOME 内アンカーではない）。 */
export default function Header() {
  return (
    <header className="wrap sticky top-0 z-50 flex h-header-h items-center gap-7 bg-bg">
      <Link href="/" aria-label={`${SITE.name} ホーム`} className="font-display text-[20px] font-extrabold leading-none tracking-[-.04em] text-fg">
        MasKOFF
      </Link>
      <nav aria-label="メイン" className="ml-auto flex items-center gap-[22px] max-nav:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="text-nav text-fg transition-colors hover:text-fg-muted">
            {n.label}
          </Link>
        ))}
        <Button href="/contact/" dot>
          お問い合わせ
        </Button>
      </nav>
      <MobileNav />
    </header>
  );
}
```

- [ ] **Step 4: `Footer.tsx`**

```tsx
import Link from "next/link";
import { NAV, SUB_NAV, SITE } from "@/lib/site";

/** dipsy 同様の最小フッター。SP は追従バッジ分の下余白を取る */
export default function Footer() {
  const links = [...NAV.map((n) => ({ href: n.href, label: n.label })), ...SUB_NAV.map((s) => ({ href: s.href, label: s.label }))];
  return (
    <footer className="wrap pt-8 pb-7 text-caption text-fg-muted max-nav:pb-16">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div>
          <p className="font-display text-[16px] font-extrabold tracking-[-.04em] text-fg">MasKOFF</p>
          <p className="mt-1">{SITE.name}</p>
          <p>{SITE.address}</p>
        </div>
        <nav aria-label="フッター" className="flex flex-wrap gap-x-5 gap-y-2 max-sp:grid max-sp:grid-cols-2">
          {links.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-7 font-display tracking-[.06em]">© {SITE.name}</p>
    </footer>
  );
}
```

- [ ] **Step 5: `NoticeBanner.tsx`（Server, async）**

```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";
import { first, getPinnedNotice } from "@/lib/microcms";

/** isPinned な NOTICE を HOME 最上部に 1 行で出す。無ければ何も描画しない。 */
export default async function NoticeBanner() {
  const n = await getPinnedNotice();
  if (!n) return null;
  const urgent = first(n.level) === "urgent";
  return (
    <div className="wrap border-b border-border bg-surface py-2.5 text-caption">
      <Link href={`/notice/${n.slug}/`} className={cn("flex items-center gap-3", urgent ? "text-required" : "text-fg")}>
        <span className="shrink-0 rounded-pill border border-current px-2 py-0.5 text-[10px] font-bold tracking-[.08em]">{urgent ? "重要" : "お知らせ"}</span>
        <span className="truncate">{n.title}</span>
      </Link>
    </div>
  );
}
```

- [ ] **Step 6: `StickyCta.tsx`（client）**

```tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** ≤720px の右下固定バッジ。HOME では #contact が見えている間は消える。 */
export default function StickyCta() {
  const path = usePathname();
  const isHome = path === "/";
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const target = document.getElementById("contact");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.1 });
    io.observe(target);
    return () => io.disconnect();
  }, [isHome]);

  if (path.startsWith("/contact")) return null;

  return (
    <a
      href={isHome ? "#contact" : "/contact/"}
      className={cn(
        "fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-[60] hidden size-20 rounded-full transition-[opacity,transform] duration-300 max-nav:block",
        hidden && "pointer-events-none scale-90 opacity-0",
      )}
    >
      <span className="sr-only">お問い合わせへ</span>
      <svg viewBox="0 0 80 80" aria-hidden className="size-full">
        <circle cx="40" cy="40" r="40" className="fill-fg" />
        <g className="origin-center animate-[spin_18s_linear_infinite] [transform-box:fill-box]">
          <defs>
            <path id="cta-ring" d="M40,40 m-27,0 a27,27 0 1,1 54,0 a27,27 0 1,1 -54,0" />
          </defs>
          <text className="fill-fg-invert font-display text-[8.5px] font-bold tracking-[.18em]">
            <textPath href="#cta-ring">CONTACT US · お問い合わせ · </textPath>
          </text>
        </g>
        <path d="M40 31v18m-7-7 7 7 7-7" className="stroke-fg-invert" strokeWidth="2" fill="none" strokeLinecap="square" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 7: `src/app/layout.tsx` にシェルを組み込む**

`import` を追加し、`<body>` を次に置き換える（metadata とフォント定義は Task 3 のまま）:

```tsx
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipLink from "@/components/layout/SkipLink";
import StickyCta from "@/components/layout/StickyCta";
import JsonLd from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
```

```tsx
      <body className="bg-bg text-fg-body antialiased">
        <JsonLd data={organizationJsonLd(SITE)} />
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyCta />
      </body>
```

- [ ] **Step 8: `src/app/page.tsx` を `<main>` なしに直し、NoticeBanner を載せる**

```tsx
import NoticeBanner from "@/components/layout/NoticeBanner";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      <NoticeBanner />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
```

- [ ] **Step 9: dev サーバーで PC / SP を撮って確認**

```bash
npm run dev &   # 起動後 http://localhost:3000
```

別シェルで（playwright-core はリポジトリ外の既存ツール。スクリプトはコミットしない）:

```bash
cd /tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad && cat > shot-local.mjs <<'EOS'
import { chromium } from '/root/tumugi_ver/tumugi_docker/e2e/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome', args: ['--no-sandbox'] });
for (const [name, vp, mobile] of [['pc', { width: 1440, height: 900 }, false], ['sp', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await p.screenshot({ path: `local-${name}.png`, fullPage: true });
  if (mobile) { await p.click('button[aria-controls]'); await p.waitForTimeout(400); await p.screenshot({ path: 'local-sp-menu.png' }); }
  await ctx.close();
}
await b.close();
EOS
node shot-local.mjs && ls local-*.png
```

`local-pc.png` `local-sp.png` `local-sp-menu.png` を Read で開いて確認する:
- PC: ヘッダーに COMPANY / SERVICE / NEWS / RECRUIT と黒ピル CTA、NOTICE 帯、フッターに社名・住所・リンク
- SP: ハンバーガーのみ、右下に回転バッジ、メニュー展開で巨大リンク 4 つ + CTA + INSTAGRAM ↗ / X ↗

- [ ] **Step 10: コミット**

```bash
kill %1 2>/dev/null
npm run typecheck && npm run build
git add -A
git commit -m "feat: Header / MobileNav / Footer / NoticeBanner / StickyCta の共通シェルを追加"
```

---

### Task 7: Hero（3 行マーキー）

**Files:**
- Create: `src/components/motion/marquee-cells.ts` `src/components/motion/Marquee.tsx` `src/components/sections/Hero.tsx`
- Test: `src/components/motion/marquee-cells.test.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `MarqueeCell = { type:"image"; src; alt? } | { type:"text"; lines: string[] } | { type:"logo" }`、`MarqueeRow = { cells: MarqueeCell[]; reverse?: boolean; duration?: number }`、`duplicate<T>(cells: readonly T[]): T[]`
- Produces: `Marquee({ rows, eagerCount? })`（Server）、`Hero()`（`<section>` + `fv-gap` の spacer を返す）

- [ ] **Step 1: `marquee-cells.test.ts` を書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { duplicate } from "./marquee-cells.ts";

test("配列を 2 倍にして順序を保つ", () => {
  assert.deepEqual(duplicate(["a", "b", "c"]), ["a", "b", "c", "a", "b", "c"]);
});

test("空配列は空のまま", () => {
  assert.deepEqual(duplicate([]), []);
});

test("元の配列を変更しない", () => {
  const src = [1, 2];
  duplicate(src);
  assert.deepEqual(src, [1, 2]);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test` → `Cannot find module '.../marquee-cells.ts'`

- [ ] **Step 3: `marquee-cells.ts`（葉モジュール）**

```ts
export type MarqueeCell =
  | { type: "image"; src: string; alt?: string }
  | { type: "text"; lines: string[] }
  | { type: "logo" };

export type MarqueeRow = {
  cells: MarqueeCell[];
  /** 右→左ではなく左→右に流す */
  reverse?: boolean;
  /** 1 周の秒数。行ごとに変えて速度差を出す（既定 60） */
  duration?: number;
};

/** シームレスループ用に配列を 2 回並べる。2 周目は aria-hidden で描画すること。 */
export function duplicate<T>(cells: readonly T[]): T[] {
  return [...cells, ...cells];
}
```

- [ ] **Step 4: `npm test` → pass 12**

- [ ] **Step 5: `Marquee.tsx`（Server。CSS keyframes のみ。GSAP 化はフェーズ③）**

```tsx
import type { CSSProperties } from "react";
import { duplicate, type MarqueeCell, type MarqueeRow } from "@/components/motion/marquee-cells";
import Picture from "@/components/ui/Picture";
import { cn } from "@/lib/cn";

type Props = {
  rows: MarqueeRow[];
  /** 先頭行の先頭から何枚を eager / fetchPriority=high にするか（LCP 対策） */
  eagerCount?: number;
};

function Cell({ cell, priority }: { cell: MarqueeCell; priority: boolean }) {
  if (cell.type === "image") {
    return (
      <Picture
        src={cell.src}
        alt={cell.alt ?? ""}
        sizes="(max-width: 600px) 45vw, 20vw"
        priority={priority}
        className="block size-full"
        imgClassName="size-full object-contain"
      />
    );
  }
  if (cell.type === "logo") {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="flex size-[62%] items-center justify-center rounded-[22%] bg-fg font-display text-[min(3.4vw,28px)] font-extrabold tracking-[-.04em] text-fg-invert">
          MasKOFF
        </div>
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col items-center justify-center text-center font-display text-[min(6.6vw,30px)] font-bold uppercase leading-[.92] tracking-[-.012em] text-fg">
      {cell.lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </div>
  );
}

/**
 * 横無限マーキー。各行の cells を 2 回描画して translateX(-50%) でループする。
 * prefers-reduced-motion では globals.css の一括停止で静止画になる。
 * @example <Marquee rows={[{ cells: [img, img, { type: "text", lines: ["TAKE THE", "MASK", "OFF"] }] }]} />
 */
export default function Marquee({ rows, eagerCount = 3 }: Props) {
  return (
    <div className="flex flex-col gap-mq-gap overflow-hidden max-sp:gap-5">
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <div
            className={cn(
              "flex w-max gap-mq-gap max-sp:gap-5",
              row.reverse ? "animate-[drift-rev_var(--d)_linear_infinite]" : "animate-[drift_var(--d)_linear_infinite]",
            )}
            style={{ "--d": `${row.duration ?? 60}s` } as CSSProperties}
          >
            {duplicate(row.cells).map((cell, i) => {
              const clone = i >= row.cells.length;
              return (
                <div key={i} aria-hidden={clone || undefined} className="size-mq-cell flex-none max-sp:size-[max(160px,calc((100svh-176px)/3))]">
                  <Cell cell={cell} priority={r === 0 && !clone && i < eagerCount && cell.type === "image"} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: `Hero.tsx`**

```tsx
import Marquee from "@/components/motion/Marquee";
import type { MarqueeRow } from "@/components/motion/marquee-cells";
import { SITE } from "@/lib/site";

// SAMPLE: public/images/hero/ の透過 PNG は仮素材。実素材に差し替えたら枚数と配置を見直す。
const img = (n: number) => ({ type: "image" as const, src: `/images/hero/hero-${String(n).padStart(2, "0")}.png` });
const TEXT = { type: "text" as const, lines: ["TAKE THE", "MASK", "OFF"] };

const ROWS: MarqueeRow[] = [
  { cells: [img(1), img(2), img(3), TEXT, img(4), img(5)], duration: 60 },
  { cells: [img(6), img(7), img(8), { type: "logo" }, img(9), img(10)], reverse: true, duration: 72 },
  { cells: [img(11), img(12), TEXT, img(13), img(14), img(15)], duration: 66 },
];

/** HOME ヒーロー。h1 は視覚非表示、マーキーは装飾として aria-hidden。 */
export default function Hero() {
  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col justify-center pt-[clamp(30px,4vw,50px)] pb-[clamp(38px,5.2vw,64px)] sp:min-h-[calc(100svh-var(--spacing-header-h))]"
      >
        <h1 id="hero-title" className="sr-only">
          {SITE.name} — {SITE.tagline}｜アパレル企画・製造販売 / アーティスト活動支援 / ホームページ制作
        </h1>
        <div aria-hidden>
          <Marquee rows={ROWS} />
        </div>
      </section>
      <div aria-hidden className="h-fv-gap" />
    </>
  );
}
```

- [ ] **Step 7: `page.tsx` に Hero を載せる**

```tsx
import NoticeBanner from "@/components/layout/NoticeBanner";
import Hero from "@/components/sections/Hero";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      <NoticeBanner />
      <Hero />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
```

- [ ] **Step 8: 確認**

```bash
npm run typecheck && npm test && npm run build
grep -o 'fetchpriority="high"' out/index.html | wc -l   # 3
grep -o 'aria-hidden="true"' out/index.html | wc -l      # 複製セル分（18 以上）
```

Task 6 Step 9 の `shot-local.mjs` で PC / SP を撮り、3 行のマーキーが表示され、PC で 1 画面に収まり、SP でセルが 3 行とも見えることを確認する。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: 3 行マーキーのヒーローを追加"
```

---

### Task 8: VisionBlock（手書き見出し SVG + マーカー本文 + 相関図）

**Files:**
- Create: `public/images/company/vision-handwriting.svg` `public/images/company/vision-diagram.svg` `src/components/sections/VisionBlock.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Picture`（SVG 経路: `width` / `height` 必須）、`Marker`、`SectionHeading`
- Produces: `VisionBlock()`

- [ ] **Step 1: `vision-handwriting.svg`（手書き風のプレースホルダ。実データはデザイナー入稿の SVG に差し替え）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160" fill="none" stroke="#0a0a0a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <!-- SAMPLE: 「仮面を外して、素の自分で。」を想定した手書き風ストローク。alt は Picture 側で渡す -->
  <path d="M28 40c22-18 48-16 62 4s-6 52-30 60 18 18 44 4M120 34c30 4 60 4 88 0M132 60c22 30 40 44 70 58M210 30c10 40 6 80 0 100M250 44c22-16 48-14 60 8s-8 46-34 52M330 36c20 0 44 2 66 6M338 62c20 28 32 44 62 62M410 40c18-10 44-10 58 4s-2 42-28 52M480 30c8 40 4 80 0 104M512 56c18-8 40-6 52 8s-2 40-26 46M580 60c14 20 22 40 26 62"/>
  <path d="M60 130c14 2 30 2 46 0" stroke-width="5"/>
</svg>
```

- [ ] **Step 2: `vision-diagram.svg`（CREATOR / EC / SNS 相当の相関図をサンプルで）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="540" height="420" viewBox="0 0 540 420" font-family="Helvetica, Arial, sans-serif" font-weight="700" text-anchor="middle">
  <!-- SAMPLE: 事業の関係図。文言は仮 -->
  <circle cx="270" cy="210" r="150" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
  <g fill="#f9f9f9" stroke="#e4e4e1" stroke-width="1.5">
    <circle cx="270" cy="60" r="56"/>
    <circle cx="120" cy="330" r="56"/>
    <circle cx="420" cy="330" r="56"/>
    <circle cx="228" cy="220" r="48"/>
    <circle cx="312" cy="220" r="48"/>
  </g>
  <g fill="#0a0a0a" font-size="15">
    <text x="270" y="65">BRAND</text>
    <text x="120" y="335">ARTIST</text>
    <text x="420" y="335">CLIENT</text>
    <text x="228" y="225">WEB</text>
    <text x="312" y="225">EC</text>
  </g>
  <text x="270" y="400" fill="#0a0a0a" font-size="17" letter-spacing="-0.5">TAKE THE MASK OFF</text>
</svg>
```

- [ ] **Step 3: `VisionBlock.tsx`**

```tsx
import Marker from "@/components/ui/Marker";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";

/** VISION。黒背景遷移・手書きストローク描画・段落フェードはフェーズ③。 */
export default function VisionBlock() {
  return (
    <section id="vision" aria-labelledby="vision-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="VISION" ja="私たちの想い" id="vision-title" />
        <div className="grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-[76px]">
          <div>
            <Picture src="/images/company/vision-handwriting.svg" alt="仮面を外して、素の自分で。" width={640} height={160} className="mb-10 block w-full max-w-[560px]" imgClassName="h-auto w-full" />
            {/* SAMPLE: 本文は仮。マーカーは 1 セクション 3 箇所まで */}
            <div className="space-y-[22px] text-body leading-[2] text-fg max-sp:text-body-sp [&>p]:max-w-[560px]">
              <p>「MASK OFF」には、仮面を外す、素の自分という意味があります。誰かに合わせるために被った仮面は、いつのまにか自分の輪郭を曖昧にしていく。</p>
              <p>
                私たちはファッションブランドの企画から始まった会社です。服は、着る人の「素」を隠すためではなく、<Marker>引き出すためにある</Marker>。その考え方は、アーティストの活動支援にも、ホームページ制作にも通じています。
              </p>
              <p>
                領域は違っても、やっていることは同じです。人や企業が本来持っている個性を見つけ、形にして、届ける。<Marker>進化したこの時代で、新たな個性をさらけ出す</Marker>。
              </p>
              <p>
                MasKOFFは、そのための仕組みと仲間をつくる会社です。<Marker>素の自分で立てる場所</Marker>が、ここから増えていくことを願って。
              </p>
            </div>
          </div>
          <div className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
            <Picture src="/images/company/vision-diagram.svg" alt="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" width={540} height={420} className="block w-full" imgClassName="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `page.tsx` に `<VisionBlock />` を `<Hero />` の直後に追加し、確認**

```bash
npm run typecheck && npm run build
```

`shot-local.mjs` で PC: 2 カラム（左に手書き SVG + 本文、右に図）、SP: 縦積みで図が最後、マーカーが 3 箇所に緑帯。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: VISION セクションを追加"
```

---

### Task 9: ServiceGrid（PC 3 列 / SP scroll-snap カルーセル）+ CarouselDots

**Files:**
- Create: `src/lib/services.ts` `src/components/ui/CarouselDots.tsx` `src/components/sections/ServiceGrid.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Service = { slug; verb; title; lead; image }`、`SERVICES: readonly Service[]`（8 件）
- Produces: `CarouselDots({ trackId, count, label })`（client、≥601 では非表示）
- Produces: `ServiceGrid({ services?, limit? })`

- [ ] **Step 1: `src/lib/services.ts`**

```ts
// SAMPLE: CLAUDE.md §1 の 3 事業（アパレル / アーティスト支援 / ホームページ制作）を 8 サービスに展開した仮データ。
// 詳細ページ用の本文はフェーズ②で追加する。
export type Service = {
  slug: string;
  /** バッジに入る動詞。4 文字以内（86px の丸に収める） */
  verb: string;
  title: string;
  /** 一覧カード用 1〜2 行 */
  lead: string;
  /** 正方形。public/images/service/ */
  image: string;
};

export const SERVICES: readonly Service[] = [
  { slug: "apparel-brand", verb: "まとう", title: "自社ブランド企画・販売", lead: "素の自分を引き出すオリジナルブランドを、企画からEC販売まで自社で手がけます。", image: "/images/service/svc-01.png" },
  { slug: "apparel-oem", verb: "つくる", title: "アパレル OEM・小ロット製造", lead: "サンプル1点から量産まで。素材選びと工場調整を含めて一貫して伴走します。", image: "/images/service/svc-02.png" },
  { slug: "artist-goods", verb: "かたちに", title: "アーティストグッズ製作", lead: "作品をTシャツやグッズに。版下調整から生産、納品までをまとめてお受けします。", image: "/images/service/svc-03.png" },
  { slug: "artist-support", verb: "ささえる", title: "アーティスト活動支援", lead: "EC開設・イベント出展・物販運営など、制作以外の実務を引き受けます。", image: "/images/service/svc-04.png" },
  { slug: "web-corporate", verb: "つたえる", title: "コーポレートサイト制作", lead: "表示速度と検索対策を標準装備した、月額コスト0円で運用できるサイトを作ります。", image: "/images/service/svc-05.png" },
  { slug: "web-ec", verb: "ひらく", title: "EC サイト構築", lead: "ブランドの世界観を損なわないECを構築し、公開後の改善まで続けます。", image: "/images/service/svc-06.png" },
  { slug: "branding", verb: "みつける", title: "ブランディング・ロゴ", lead: "言葉とビジュアルで「素」を定義し、名刺からWebまで一貫した印象を作ります。", image: "/images/service/svc-07.png" },
  { slug: "sns-marketing", verb: "ひろげる", title: "SNS 運用支援", lead: "投稿設計からレポートまで。数字ではなく作品で見つけてもらう運用を組み立てます。", image: "/images/service/svc-08.png" },
];
```

- [ ] **Step 2: `CarouselDots.tsx`（client）**

```tsx
"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** scroll-snap のトラック要素の id。子要素 1 つ = 1 スライド */
  trackId: string;
  count: number;
  /** aria-label 用。例 "事業カード" */
  label: string;
};

/**
 * SP カルーセルのドット。IntersectionObserver で現在位置を追い、クリックでスナップ移動する。
 * ≥601px では非表示（グリッド表示のため）。
 * @example <ul id="service-track" className="max-sp:carousel">…</ul><CarouselDots trackId="service-track" count={6} label="事業カード" />
 */
export default function CarouselDots({ trackId, count, label }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = document.getElementById(trackId);
    if (!track) return;
    const items = Array.from(track.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(items.indexOf(e.target));
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [trackId]);

  const go = (i: number) => {
    document.getElementById(trackId)?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div role="tablist" aria-label={label} className="mt-6 hidden justify-center gap-2 max-sp:flex">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${i + 1}枚目`}
          onClick={() => go(i)}
          className={cn("size-2 rounded-full transition-colors", i === active ? "bg-fg" : "bg-border")}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `ServiceGrid.tsx`**

```tsx
import Link from "next/link";
import Button from "@/components/ui/Button";
import CarouselDots from "@/components/ui/CarouselDots";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { SERVICES, type Service } from "@/lib/services";

type Props = {
  services?: readonly Service[];
  /** HOME は先頭 6 件（3 列 × 2 行） */
  limit?: number;
};

/**
 * PC: 3 列グリッド（≤960 は 2 列）/ SP: CSS scroll-snap カルーセル + ドット。
 * 両方を同じマークアップにして CSS で出し分ける（ハイドレーション不一致と CLS を避ける）。
 * @example <ServiceGrid limit={6} />
 */
export default function ServiceGrid({ services = SERVICES, limit = 6 }: Props) {
  const items = services.slice(0, limit);
  return (
    <section id="service" aria-labelledby="service-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="SERVICE" ja="事業内容" id="service-title" />
        <ul id="service-track" className="mt-[clamp(56px,7vw,88px)] grid grid-cols-3 gap-x-gap-service-col gap-y-gap-service-row max-pc:grid-cols-2 max-sp:carousel">
          {items.map((s) => (
            <li key={s.slug}>
              <Link href={`/service/${s.slug}/`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-visual bg-surface">
                  <Picture
                    src={s.image}
                    alt=""
                    sizes="(max-width: 600px) 80vw, (max-width: 960px) 50vw, 33vw"
                    className="block size-full"
                    imgClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden
                    className="absolute top-[10%] right-[8%] flex size-[86px] items-center justify-center rounded-full bg-fg text-[14px] font-bold text-fg-invert max-sp:size-[74px] max-sp:text-[13px]"
                  >
                    {s.verb}
                  </span>
                </div>
                <h3 className="mt-[22px] mb-3 text-center text-card-title text-fg max-tab:text-card-title-sp">{s.title}</h3>
                <p className="text-[13.5px] leading-[1.8] text-fg-body max-tab:text-[11.5px]">{s.lead}</p>
              </Link>
            </li>
          ))}
        </ul>
        <CarouselDots trackId="service-track" count={items.length} label="事業カード" />
        <p className="mt-10 text-center">
          <Button href="/service/" variant="line">
            事業一覧を見る
          </Button>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `page.tsx` に `<ServiceGrid />` を `<VisionBlock />` の直後に追加し、確認**

```bash
npm run typecheck && npm run build
```

`shot-local.mjs`（SP は `p.click('[role=tab]:nth-child(3)')` を足して 3 枚目へ移動した状態も撮る）:
- PC: 3 列 × 2 行、バッジに動詞、ドットなし
- SP: 1 枚 80% 幅 + 次カードが右に peek、ドット 6 個、3 番目クリックで 3 枚目が中央

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: SERVICE グリッド（SP は scroll-snap カルーセル）を追加"
```

---

### Task 10: WorksList（dipsy OFFICIAL CREATORS 相当の全幅行リスト）

**Files:**
- Create: `src/lib/works.ts` `src/components/sections/WorksList.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Work = { id; name; kind; text; logo; thumbs: string[]; url? }`、`WORKS: readonly Work[]`（6 件）。`thumbs` はフェーズ③の `Collage` 用で①では描画しない。
- Produces: `WorksList({ works? })`。各行に `data-pat="p1|p2"`（③のサムネ配置パターン）

- [ ] **Step 1: `src/lib/works.ts`**

```ts
// SAMPLE: 制作・支援事例。ロゴ・サムネは仮画像。microCMS の API 上限（5 本）を温存するため静的管理。
export type Work = {
  id: string;
  /** クライアント名・ブランド名 */
  name: string;
  /** 案件種別。例 "アパレルブランド / EC 構築" */
  kind: string;
  /** 80〜140 字 */
  text: string;
  /** 正方形ロゴ。public/images/works/ */
  logo: string;
  /** コラージュ用サムネ 3〜5 枚（フェーズ③で使用） */
  thumbs: string[];
  url?: string;
};

const thumbs = (n: number) => Array.from({ length: 5 }, (_, k) => `/images/works/w${String(n).padStart(2, "0")}-${k + 1}.png`);

export const WORKS: readonly Work[] = [
  { id: "w1", name: "Sample Brand A", kind: "アパレルブランド / EC 構築", text: "ブランドコンセプトの言語化から EC の立ち上げ、初回コレクションの生産までを伴走。企画開始から 3 か月で販売を開始した。", logo: "/images/works/logo-01.png", thumbs: thumbs(1), url: "https://example.com/" },
  { id: "w2", name: "Sample Artist B", kind: "アーティスト活動支援 / グッズ製作", text: "個展に合わせたグッズ 6 種の製作と物販運営を担当。会期後はオンライン販売へ移行し、在庫管理まで引き受けている。", logo: "/images/works/logo-02.png", thumbs: thumbs(2) },
  { id: "w3", name: "Sample Clinic C", kind: "コーポレートサイト", text: "予約導線を再設計し、静的サイト + ヘッドレス CMS で月額コスト 0 円の運用に移行。表示速度スコアは 60 台から 90 台へ。", logo: "/images/works/logo-03.png", thumbs: thumbs(3) },
  { id: "w4", name: "Sample Team D", kind: "ユニフォーム OEM", text: "地域スポーツクラブのユニフォームとサポーターグッズを小ロットで製造。毎シーズンのデザイン更新にも対応している。", logo: "/images/works/logo-04.png", thumbs: thumbs(4) },
  { id: "w5", name: "Sample Studio E", kind: "ブランディング / ロゴ", text: "写真スタジオのロゴと名刺、Web サイトを一貫したトーンで制作。開業から 1 年で指名予約が 7 割を占めるまでになった。", logo: "/images/works/logo-05.png", thumbs: thumbs(5) },
  { id: "w6", name: "Sample Label F", kind: "EC サイト構築 / SNS 運用", text: "インディーレーベルの EC を構築し、リリースに合わせた SNS 投稿設計を支援。初回ドロップは 48 時間で完売した。", logo: "/images/works/logo-06.png", thumbs: thumbs(6) },
];
```

- [ ] **Step 2: `WorksList.tsx`**

```tsx
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { WORKS, type Work } from "@/lib/works";

/**
 * 全幅の行リスト。PC は [ロゴ 88px | 名前・種別 | 概要（右寄せ）]、≤820 は縦積み。
 * サムネの散布・名前ロール・カスタムカーソルはフェーズ③（data-pat を使う）。
 * @example <WorksList />
 */
export default function WorksList({ works = WORKS }: { works?: readonly Work[] }) {
  return (
    <section id="works" aria-labelledby="works-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="WORKS" ja="制作・支援事例" id="works-title" />
      </div>
      <ul className="max-tab:wrap max-tab:flex max-tab:flex-col max-tab:gap-16">
        {works.map((w, i) => (
          <li
            key={w.id}
            data-pat={i % 2 ? "p1" : "p2"}
            className="grid grid-cols-[88px_minmax(220px,auto)_1fr] items-center gap-x-[30px] px-pad-x py-7 max-tab:grid-cols-[60px_1fr] max-tab:gap-x-3.5 max-tab:px-0.5 max-tab:py-1"
          >
            <Picture src={w.logo} alt="" sizes="88px" className="block size-[88px] overflow-hidden rounded-full max-tab:size-[60px]" imgClassName="size-full object-cover" />
            <div className="min-w-0">
              <h3 className="truncate font-display text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.15] tracking-[.005em] text-fg max-tab:text-[19px] max-tab:leading-[1.1]">
                {w.url ? (
                  <a href={w.url} target="_blank" rel="noopener" className="transition-opacity hover:opacity-70">
                    {w.name}
                  </a>
                ) : (
                  w.name
                )}
              </h3>
              <p className="mt-0.5 text-[12.5px] font-medium tracking-[.02em] text-fg-muted max-tab:text-[11px] max-tab:font-semibold">{w.kind}</p>
            </div>
            <p className="w-[max(520px,52vw)] max-w-full justify-self-end text-[13px] leading-[1.85] text-fg-body max-tab:col-span-full max-tab:mt-3 max-tab:w-auto max-tab:text-[11.5px] max-tab:leading-[1.8]">
              {w.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: `page.tsx` に `<WorksList />` を `<ServiceGrid />` の直後に追加し、確認**

```bash
npm run typecheck && npm run build
```

`shot-local.mjs`: PC で 6 行が全幅（ロゴ 88px、名前 30px、右端に概要）、SP でロゴ 60px + 名前、概要が下段。

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "feat: WORKS の全幅行リストを追加"
```

---

### Task 11: PartnerGrid（dipsy SPONSORING 相当）

**Files:**
- Create: `src/lib/partners.ts` `src/components/sections/PartnerGrid.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Partner = { id; tag; name; text; image; icon }`、`PARTNERS: readonly Partner[]`（4 件）
- Produces: `PartnerGrid({ partners? })`
- Consumes: `CarouselDots`（Task 9）

- [ ] **Step 1: `src/lib/partners.ts`**

```ts
// SAMPLE: 支援先。画像は 21:13、アイコンは正方形。
export type Partner = {
  id: string;
  /** 左上タグ。大文字英字 */
  tag: string;
  name: string;
  text: string;
  /** 21:13。public/images/partners/ */
  image: string;
  /** 44px 表示の正方形アイコン */
  icon: string;
};

export const PARTNERS: readonly Partner[] = [
  { id: "p1", tag: "SPORTS", name: "Sample Football Club", text: "地域からトップリーグを目指すクラブ。2026 シーズンのオフィシャルパートナーとしてユニフォーム製作を担当。", image: "/images/partners/p01.png", icon: "/images/partners/icon-01.png" },
  { id: "p2", tag: "EVENT", name: "Sample Creative Fes", text: "映像・デザイン・音楽の表現者が集う創作フェス。ブース出展と物販運営を支援。", image: "/images/partners/p02.png", icon: "/images/partners/icon-02.png" },
  { id: "p3", tag: "SCHOOL", name: "Sample Design School", text: "若手デザイナー向けの実践講座にカリキュラムと講師を提供。", image: "/images/partners/p03.png", icon: "/images/partners/icon-03.png" },
  { id: "p4", tag: "COMMUNITY", name: "Sample Artist Collective", text: "所属アーティストの制作・発信・販売をまとめてバックアップ。", image: "/images/partners/p04.png", icon: "/images/partners/icon-04.png" },
];
```

- [ ] **Step 2: `PartnerGrid.tsx`**

```tsx
import CarouselDots from "@/components/ui/CarouselDots";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTNERS, type Partner } from "@/lib/partners";

/**
 * PC: 4 列（≤960 は 2 列）/ SP: scroll-snap カルーセル + ドット。ホバーで画像 1.07 倍。
 * @example <PartnerGrid />
 */
export default function PartnerGrid({ partners = PARTNERS }: { partners?: readonly Partner[] }) {
  return (
    <section id="partners" aria-labelledby="partners-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="PARTNERS" ja="MasKOFFが支援する活動" id="partners-title" />
        {/* SAMPLE */}
        <p className="-mt-2 mb-11 text-body text-fg-body max-sp:text-body-sp">
          スポーツ・カルチャー・教育の現場を、ものづくりとテクノロジーで支えています。
          <br className="max-sp:hidden" />
          表現者が輝く場所に寄り添い、その未来を共につくる仲間であり続けます。
        </p>
        <ul id="partner-track" className="grid grid-cols-4 gap-gap-card max-pc:grid-cols-2 max-sp:carousel">
          {partners.map((p) => (
            <li key={p.id} className="group">
              <div className="relative mb-4 aspect-[21/13] overflow-hidden rounded-card bg-surface">
                <Picture
                  src={p.image}
                  alt=""
                  sizes="(max-width: 600px) 80vw, (max-width: 960px) 50vw, 25vw"
                  className="block size-full"
                  imgClassName="size-full object-cover transition-transform duration-[600ms] ease-out-quart group-hover:scale-[1.07]"
                />
                <span className="absolute top-3 left-3 rounded-pill bg-fg/55 px-3 py-1 font-display text-[10px] font-bold tracking-[.08em] text-fg-invert backdrop-blur-[8px] max-tab:text-[11px]">
                  {p.tag}
                </span>
                <Picture src={p.icon} alt="" sizes="44px" className="absolute right-2.5 bottom-2.5 block size-11 overflow-hidden rounded-[10px]" imgClassName="size-full" />
              </div>
              <h3 className="mb-1.5 text-[18px] font-bold leading-[1.55] tracking-[.01em] text-fg max-tab:mb-2 max-tab:text-[16px] max-tab:leading-[1.5]">{p.name}</h3>
              <p className="text-caption text-fg-body max-tab:text-[11.5px] max-tab:leading-[1.8]">{p.text}</p>
            </li>
          ))}
        </ul>
        <CarouselDots trackId="partner-track" count={partners.length} label="パートナー" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `page.tsx` に `<PartnerGrid />` を `<WorksList />` の直後に追加し、確認**

```bash
npm run typecheck && npm run build
```

`shot-local.mjs`: PC 4 列（タグピル左上、アイコン右下）、SP は 80% カード + ドット 4 個。

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "feat: PARTNERS グリッドを追加"
```

---

### Task 12: NewsStrip（NEWS / NOTICE 最新 3 件）

**Files:**
- Create: `src/components/sections/NewsStrip.tsx`
- Modify: `src/app/page.tsx`（async 化して CMS を取得）

**Interfaces:**
- Consumes: `getNews` `getNotice` `NEWS_CATEGORY_LABELS` `first`（Task 5）、`formatDate`（Task 5）
- Produces: `NewsStrip({ news: News[]; notice: Notice[] })`

- [ ] **Step 1: `NewsStrip.tsx`**

```tsx
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/date";
import { NEWS_CATEGORY_LABELS, first } from "@/lib/microcms";
import type { News, Notice } from "@/types/microcms";

type Props = { news: News[]; notice: Notice[] };

function Row({ href, date, tag, title }: { href: string; date: string; tag?: string; title: string }) {
  return (
    <li className="border-b border-border">
      <Link href={href} className="group grid grid-cols-[auto_auto_1fr] items-baseline gap-x-5 py-5 max-sp:grid-cols-[auto_auto] max-sp:gap-y-1.5">
        <time dateTime={date} className="font-display text-caption tabular-nums text-fg-muted">
          {formatDate(date)}
        </time>
        {tag ? <span className="rounded-pill border border-border px-2 py-0.5 text-[10px] font-bold tracking-[.06em] text-fg-muted">{tag}</span> : <span />}
        <span className="text-body font-bold text-fg transition-colors group-hover:text-fg-muted max-sp:col-span-2 max-sp:text-body-sp">{title}</span>
      </Link>
    </li>
  );
}

/**
 * HOME の NEWS / NOTICE 最新 3 件（CLAUDE.md §5）。dipsy には無いセクション。
 * @example <NewsStrip news={await getNews()} notice={await getNotice()} />
 */
export default function NewsStrip({ news, notice }: Props) {
  return (
    <section id="news" aria-labelledby="news-title" className="section-pad">
      <div className="wrap grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-16">
        <div>
          <SectionHeading en="NEWS" ja="ニュース" id="news-title" />
          <ul className="border-t border-border">
            {news.slice(0, 3).map((n) => (
              <Row key={n.id} href={`/news/${n.slug}/`} date={n.publishedDate} tag={NEWS_CATEGORY_LABELS[first(n.category) ?? "press"]} title={n.title} />
            ))}
          </ul>
          <p className="mt-6">
            <Button href="/news/" variant="line">
              すべてのニュース
            </Button>
          </p>
        </div>
        <div>
          <SectionHeading en="NOTICE" ja="お知らせ" id="notice-title" />
          <ul className="border-t border-border">
            {notice.slice(0, 3).map((n) => (
              <Row key={n.id} href={`/notice/${n.slug}/`} date={n.publishedDate} title={n.title} />
            ))}
          </ul>
          <p className="mt-6">
            <Button href="/notice/" variant="line">
              すべてのお知らせ
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `page.tsx` を async にして組み込む**

```tsx
import NoticeBanner from "@/components/layout/NoticeBanner";
import Hero from "@/components/sections/Hero";
import NewsStrip from "@/components/sections/NewsStrip";
import PartnerGrid from "@/components/sections/PartnerGrid";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import WorksList from "@/components/sections/WorksList";
import SectionHeading from "@/components/ui/SectionHeading";
import { getNews, getNotice } from "@/lib/microcms";

export default async function HomePage() {
  const [news, notice] = await Promise.all([getNews(), getNotice()]);
  return (
    <>
      <NoticeBanner />
      <Hero />
      <VisionBlock />
      <ServiceGrid />
      <WorksList />
      <PartnerGrid />
      <NewsStrip news={news} notice={notice} />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
```

- [ ] **Step 3: 確認とコミット**

```bash
npm run typecheck && npm run build
grep -o '2026\.08\.31' out/index.html | head -1   # 日付が JST 表記
git add -A
git commit -m "feat: NEWS / NOTICE 最新 3 件のセクションを追加"
```

---

### Task 13: FaqList（`<details>`、PC は常時展開・SP はアコーディオン）+ FAQPage JSON-LD

**Files:**
- Create: `src/components/sections/FaqList.tsx`
- Modify: `src/app/globals.css`（FAQ の PC 展開ルールを追記）`src/app/page.tsx`

**Interfaces:**
- Consumes: `getFaq`、`faqPageJsonLd`、`JsonLd`
- Produces: `FaqList({ items: Faq[] })`

- [ ] **Step 1: `globals.css` の末尾（`@media (prefers-reduced-motion)` の前）に追記**

```css
/* FAQ: ≥601px は常時展開（::details-content 対応ブラウザ。未対応はクリックで開ける）。≤600px はネイティブ開閉 */
@media (width >= 601px) {
  .faq-card summary {
    pointer-events: none;
  }
  .faq-card details::details-content {
    display: block;
    content-visibility: visible;
    height: auto;
  }
}
```

- [ ] **Step 2: `FaqList.tsx`**

```tsx
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { faqPageJsonLd } from "@/lib/jsonld";
import type { Faq } from "@/types/microcms";

/**
 * <details>/<summary> を閉じた状態で SSR。PC は globals.css の ::details-content で常時展開、SP は「＋」で開閉。
 * JS を使わないので JS 無効環境とクローラの双方で読める。FAQPage JSON-LD も同じデータから出す。
 * @example <FaqList items={await getFaq()} />
 */
export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad">
      <JsonLd data={faqPageJsonLd(items)} />
      <div className="wrap">
        <SectionHeading en="FAQ" ja="よくあるご質問" id="faq-title" />
        <ul className="grid grid-cols-3 gap-gap-card max-pc:grid-cols-2 max-sp:grid-cols-1 max-sp:gap-3">
          {items.map((f) => (
            <li key={f.id} className="faq-card rounded-card bg-surface px-[22px] py-6">
              <details className="group">
                <summary className="flex cursor-default list-none items-baseline gap-2.5 text-[16px] font-bold leading-[1.55] tracking-[.01em] text-fg max-sp:cursor-pointer max-sp:text-[14.5px] [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="font-display text-[17px] max-sp:text-[15.5px]">
                    Q
                  </span>
                  <span className="flex-1">{f.question}</span>
                  <span
                    aria-hidden
                    className="relative ml-auto hidden size-4 shrink-0 self-center transition-transform duration-300 ease-sym group-open:rotate-45 max-sp:block before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-full before:-translate-y-1/2 before:bg-fg after:absolute after:top-0 after:left-1/2 after:h-full after:w-[1.5px] after:-translate-x-1/2 after:bg-fg"
                  />
                </summary>
                <p className="mt-2.5 text-caption text-fg-body">{f.answer}</p>
                {f.note && <small className="mt-2 block text-caption text-fg-muted">{f.note}</small>}
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `page.tsx` に組み込む**

`import FaqList from "@/components/sections/FaqList";` と `getFaq` を追加し、

```tsx
  const [news, notice, faq] = await Promise.all([getNews(), getNotice(), getFaq()]);
```

`<NewsStrip … />` の直後に `<FaqList items={faq} />` を置く。

- [ ] **Step 4: 確認**

```bash
npm run typecheck && npm run build
grep -o '"@type":"FAQPage"' out/index.html | wc -l   # 1
grep -o '<details' out/index.html | wc -l            # 6（open 属性なし）
```

`shot-local.mjs`（SP は `p.click('.faq-card summary')` 後も撮る）: PC は 3 列で全問の回答が見えている、SP は閉じた 1 列で「＋」、クリックで開いて「×」に回転。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: FAQ（details ベース）と FAQPage JSON-LD を追加"
```

---

### Task 14: ContactSection（StepFlow + フォームカード）と `/contact/thanks/`

**Files:**
- Create: `src/components/sections/StepFlow.tsx` `src/components/sections/ContactForm.tsx` `src/components/sections/ContactSection.tsx` `src/app/contact/thanks/page.tsx`
- Modify: `src/app/page.tsx`
- Keep: `src/lib/schema/contact.ts`（既存。フィールド: company / name / email / tel / category / message / consent / website / turnstileToken）

**Interfaces:**
- Consumes: `contactSchema` `CATEGORY_LABELS`（`@/lib/schema/contact`）、`Field` + `INPUT_CLASS`、`Button`
- Produces: `StepFlow({ heading, steps: { title; text }[] })`、`ContactForm()`（client）、`ContactSection()`（`id="contact"`）
- Produces: フォームは `POST /api/contact` に JSON `{ company, name, email, tel, category, message, consent, website, turnstileToken }` を送る。`NEXT_PUBLIC_TURNSTILE_SITE_KEY` 未設定時は `turnstileToken: "local"`（Worker 側は secret 未設定なら検証をスキップ）。

- [ ] **Step 1: `StepFlow.tsx`**

```tsx
type Step = { title: string; text: string };

/**
 * 番号バッジ + 縦線の手順リスト。
 * @example <StepFlow heading="ご相談の流れ" steps={[{ title: "フォームの送信", text: "1 分ほどで完了します。" }]} />
 */
export default function StepFlow({ heading, steps }: { heading: string; steps: readonly Step[] }) {
  return (
    <div className="pt-2.5">
      <h4 className="mb-[26px] text-[16.5px] font-bold leading-[1.55] tracking-[.01em] text-fg max-tab:text-[16px]">[ {heading} ]</h4>
      <ol className="list-none">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative pb-6 pl-[42px] last:pb-0 after:absolute after:top-7 after:bottom-0.5 after:left-[13px] after:w-px after:bg-border last:after:hidden"
          >
            <span aria-hidden className="absolute top-[-2px] left-0 flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert">
              {i + 1}
            </span>
            <b className="block text-[14px] font-bold leading-[1.55] tracking-[.01em] text-fg">{s.title}</b>
            <span className="mt-[3px] block text-caption text-fg-muted max-tab:text-[13px] max-tab:leading-[1.8]">{s.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: `ContactForm.tsx`（client）**

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Field, { INPUT_CLASS } from "@/components/ui/Field";
import { CATEGORY_LABELS, contactSchema } from "@/lib/schema/contact";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const MAX = 2000;
type Errors = Partial<Record<string, string>>;

/**
 * お問い合わせフォーム。zod でクライアント検証 → POST /api/contact（JSON）→ /contact/thanks/。
 * 検証ルールは src/lib/schema/contact.ts のみ（Worker も同じスキーマを import する）。
 * @example <ContactForm />
 */
export default function ContactForm() {
  const router = useRouter();
  const tsRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  // Turnstile（サイトキーがある時だけ読み込む。ローカルはスキップ）
  useEffect(() => {
    if (!SITE_KEY || !tsRef.current) return;
    const el = tsRef.current;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => window.turnstile?.render(el, { sitekey: SITE_KEY, callback: (t: string) => setToken(t), "expired-callback": () => setToken("") });
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.currentTarget);
    const str = (k: string) => String(fd.get(k) ?? "");
    const raw = {
      company: str("company"),
      name: str("name"),
      email: str("email"),
      tel: str("tel"),
      category: str("category"),
      message: str("message"),
      consent: fd.get("consent") === "on",
      website: str("website"),
      turnstileToken: SITE_KEY ? token : "local",
    };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const f = z.flattenError(parsed.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])));
      if (f.turnstileToken) setServerError("スパム対策の確認が完了していません。少し待ってから再度お試しください。");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Errors };
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error ?? "送信に失敗しました。時間をおいて再度お試しください。");
      }
      router.push("/contact/thanks/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "送信に失敗しました。");
      window.turnstile?.reset();
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  const aria = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="会社名・団体名" htmlFor="company" error={errors.company}>
        <input id="company" name="company" autoComplete="organization" maxLength={100} className={INPUT_CLASS} placeholder="株式会社○○" {...aria("company")} />
      </Field>
      <Field label="お名前" htmlFor="name" required error={errors.name}>
        <input id="name" name="name" autoComplete="name" maxLength={50} className={INPUT_CLASS} placeholder="山田 太郎" {...aria("name")} />
      </Field>
      <Field label="メールアドレス" htmlFor="email" required error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} className={INPUT_CLASS} placeholder="you@example.com" {...aria("email")} />
      </Field>
      <Field label="電話番号" htmlFor="tel" error={errors.tel}>
        <input id="tel" name="tel" type="tel" autoComplete="tel" maxLength={20} className={INPUT_CLASS} placeholder="03-0000-0000" {...aria("tel")} />
      </Field>
      <Field label="お問い合わせ種別" htmlFor="category" required error={errors.category}>
        <select id="category" name="category" defaultValue="" className={INPUT_CLASS} {...aria("category")}>
          <option value="" disabled>
            選択してください
          </option>
          {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="お問い合わせ内容"
        htmlFor="message"
        required
        error={errors.message}
        hint={
          <p className="text-right text-caption text-placeholder-text">
            {message.length}/{MAX}
          </p>
        }
      >
        <textarea id="message" name="message" rows={6} maxLength={MAX} value={message} onChange={(e) => setMessage(e.target.value)} className={INPUT_CLASS} placeholder="ご相談内容をご記入ください" {...aria("message")} />
      </Field>

      {/* ハニーポット: 人間には見えない。値が入っていたら Bot */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />

      <label className="mt-1 flex items-start justify-center gap-2 text-caption text-fg">
        <input type="checkbox" name="consent" className="mt-1 accent-fg" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "consent-error" : undefined} />
        <span>
          <a href="/privacy-policy/" target="_blank" rel="noopener" className="underline underline-offset-2">
            プライバシーポリシー
          </a>
          に同意します
          <span aria-hidden className="ml-1 text-required">
            *
          </span>
        </span>
      </label>
      {errors.consent && (
        <p id="consent-error" role="alert" className="text-center text-caption text-required">
          {errors.consent}
        </p>
      )}

      {SITE_KEY && <div ref={tsRef} className="flex justify-center" />}
      {serverError && (
        <p role="alert" className="text-caption text-required">
          {serverError}
        </p>
      )}
      <Button type="submit" variant="block" disabled={busy} className="mt-1">
        {busy ? "送信しています…" : "この内容で送信する"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: `ContactSection.tsx`**

```tsx
import ContactForm from "@/components/sections/ContactForm";
import StepFlow from "@/components/sections/StepFlow";
import SectionHeading from "@/components/ui/SectionHeading";

// SAMPLE
const STEPS = [
  { title: "フォームの送信", text: "1 分ほどで完了します。" },
  { title: "担当より返信", text: "2 営業日以内にメールでご連絡します。" },
  { title: "オンライン相談", text: "30 分程度で課題とご希望を整理します。" },
  { title: "ご提案・お見積", text: "内容に合わせて最適な進め方をご提案します。" },
] as const;

/** dipsy OPEN CALL 相当。左に流れ、右にフォームカード。id="contact" は StickyCta が参照する。 */
export default function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad">
      <div className="wrap grid grid-cols-2 items-stretch gap-gap-cols max-form:grid-cols-1 max-form:gap-12">
        <div>
          <SectionHeading en="CONTACT" ja="お問い合わせ・ご相談" id="contact-title" className="mb-[34px]" />
          <p className="mb-10 text-body leading-[1.9] text-fg-body max-sp:text-body-sp">
            まず、話すことから。
            <br />
            事業のご相談、採用、取材のご依頼はこちらから。
          </p>
          <StepFlow heading="ご相談の流れ" steps={STEPS} />
        </div>
        <div className="rounded-form bg-bg px-[34px] py-12 shadow-[0_0_120px_currentColor] shadow-fg/4 max-sp:px-5 max-sp:py-[38px] max-sp:shadow-[0_0_96px_currentColor] max-sp:shadow-fg/7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `src/app/contact/thanks/page.tsx`**

```tsx
import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "送信完了", robots: { index: false, follow: false } };

export default function ThanksPage() {
  return (
    <section aria-labelledby="thanks-title" className="wrap section-pad">
      <SectionHeading as="h1" en="THANK YOU" ja="お問い合わせを受け付けました" id="thanks-title" />
      <p className="max-w-[40em] text-body text-fg-body">確認メールをお送りしました。担当より 2 営業日以内にご連絡いたします。届かない場合は迷惑メールフォルダをご確認ください。</p>
      <p className="mt-10">
        <Button href="/" variant="line">
          HOME へ戻る
        </Button>
      </p>
    </section>
  );
}
```

- [ ] **Step 5: `page.tsx` のプレースホルダを `<ContactSection />` に置き換える**

`import ContactSection from "@/components/sections/ContactSection";` を追加し、`SectionHeading` の import と暫定 `<section id="contact">` を削除して `<FaqList items={faq} />` の直後に `<ContactSection />` を置く。

- [ ] **Step 6: 確認**

```bash
npm run typecheck && npm run build
ls out/contact/thanks/index.html
grep -o 'name="website"' out/index.html | wc -l   # 1
```

`shot-local.mjs`: PC は 2 カラム（左に流れ 4 段、右に白カード）、SP は縦積み。ブラウザで未入力送信 → 各項目の下に赤いエラー文、`role="alert"`。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: CONTACT セクション（StepFlow + フォーム）と送信完了ページを追加"
```

---

### Task 15: Worker（zod スキーマ共有・環境変数名の統一・テスト）

**Files:**
- Create: `worker/lib/json.ts` `worker/contact.test.ts`
- Modify: `worker/index.ts` `worker/contact.ts` `worker/rebuild.ts` `worker/tsconfig.json` `wrangler.toml` `.dev.vars.example`

**Interfaces:**
- Produces: `handleContact(req: Request, env: Env, ctx: ExecutionContext, deps?: { fetch: typeof fetch }): Promise<Response>`（Origin → レート制限 → ハニーポット → zod → Turnstile → Resend → Slack）
- Produces: `Env` に `CONTACT_FROM_EMAIL` `CONTACT_TO_EMAIL` `GITHUB_DISPATCH_TOKEN` `SLACK_WEBHOOK_URL?`（`MAIL_FROM` `MAIL_TO` `GITHUB_TOKEN` は廃止）
- 応答: 200 `{ ok:true }` / 400 `{ ok:false, error, errors? }` / 403 / 429 / 502

- [ ] **Step 1: `worker/tsconfig.json`（テストは Node 型と衝突するので型チェック対象外）**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["./**/*.ts", "../src/lib/schema/**/*.ts"],
  "exclude": ["./**/*.test.ts"]
}
```

- [ ] **Step 2: `worker/lib/json.ts`**

```ts
/** JSON レスポンス。index.ts と contact.ts の循環 import を避けるため独立ファイルにする */
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
```

- [ ] **Step 3: `worker/contact.test.ts` を先に書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "./contact.ts";
import type { Env } from "./index.ts";

function makeEnv(kv: Map<string, string>): Env {
  const RATE_LIMIT = {
    get: async (k: string) => kv.get(k) ?? null,
    put: async (k: string, v: string) => {
      kv.set(k, v);
    },
  };
  return {
    ASSETS: { fetch: async () => new Response("") },
    RATE_LIMIT,
    SITE_URL: "https://maskoff.co.jp",
    CONTACT_FROM_EMAIL: "MasKOFF <noreply@maskoff.co.jp>",
    CONTACT_TO_EMAIL: "info@maskoff.co.jp",
    GITHUB_REPO: "x/y",
    RESEND_API_KEY: "re_test",
    TURNSTILE_SECRET_KEY: "", // 空 = 検証スキップ
    MICROCMS_WEBHOOK_SECRET: "s",
    GITHUB_DISPATCH_TOKEN: "t",
  } as unknown as Env;
}

const ctx = { waitUntil: (p: Promise<unknown>) => void p, passThroughOnException: () => undefined } as unknown as ExecutionContext;

const valid = {
  company: "",
  name: "山田 太郎",
  email: "taro@example.com",
  tel: "",
  category: "web",
  message: "コーポレートサイトの制作について相談したいです。",
  consent: true,
  website: "",
  turnstileToken: "local",
};

function req(body: unknown, origin = "https://maskoff.co.jp", ip = "203.0.113.1") {
  return new Request("https://maskoff.co.jp/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin, "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });
}

function fakeFetch() {
  const calls: string[] = [];
  const fetchFn = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  return { calls, fetchFn };
}

test("Origin が違えば 403", async () => {
  const res = await handleContact(req(valid, "https://evil.example"), makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 403);
});

test("同一 IP 5 件目以降は 429", async () => {
  const kv = new Map([["contact:203.0.113.1", "5"]]);
  const res = await handleContact(req(valid), makeEnv(kv), ctx, fakeFetch());
  assert.equal(res.status, 429);
});

test("ハニーポットに値があれば 200 を返してメールは送らない", async () => {
  const f = fakeFetch();
  const res = await handleContact(req({ ...valid, website: "http://spam" }), makeEnv(new Map()), ctx, f);
  assert.equal(res.status, 200);
  assert.equal(f.calls.length, 0);
});

test("検証エラーは 400 と項目別メッセージ", async () => {
  const res = await handleContact(req({ ...valid, name: "", consent: false }), makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 400);
  const body = (await res.json()) as { ok: boolean; errors: Record<string, string> };
  assert.equal(body.ok, false);
  assert.ok(body.errors.name);
  assert.ok(body.errors.consent);
});

test("正常系は Resend を 2 回呼んで 200", async () => {
  const f = fakeFetch();
  const res = await handleContact(req(valid), makeEnv(new Map()), ctx, f);
  assert.equal(res.status, 200);
  assert.equal(f.calls.filter((u) => u.includes("api.resend.com")).length, 2);
});

test("JSON でない body は 400", async () => {
  const r = new Request("https://maskoff.co.jp/api/contact", { method: "POST", headers: { origin: "https://maskoff.co.jp" }, body: "not json" });
  const res = await handleContact(r, makeEnv(new Map()), ctx, fakeFetch());
  assert.equal(res.status, 400);
});
```

`fakeFetch()` は `{ calls, fetchFn }` を返すので、`handleContact` の第 4 引数 `deps` の型は `{ fetchFn: typeof fetch }` にする（Step 5 参照）。

- [ ] **Step 4: 失敗を確認** — `npm test` → `contact.test.ts` が fail（`handleContact` の引数不一致 / import 解決失敗）

- [ ] **Step 5: `worker/contact.ts` を置き換える**

```ts
import { z } from "zod";
import { CATEGORY_LABELS, contactSchema, type ContactInput } from "../src/lib/schema/contact.ts";
import type { Env } from "./index.ts";
import { json } from "./lib/json.ts";

export const RATE_LIMIT_MAX = 5;
export type Deps = { fetchFn: typeof fetch };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function verifyTurnstile(token: string, secret: string, ip: string | null, fetchFn: typeof fetch) {
  if (!secret) return true; // ローカル開発（.dev.vars 未設定）では検証をスキップ
  const r = await fetchFn("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
  });
  const j = (await r.json()) as { success: boolean };
  return j.success;
}

async function sendMail(env: Env, fetchFn: typeof fetch, payload: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const r = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, reply_to: payload.replyTo, ...payload }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

async function notifySlack(env: Env, fetchFn: typeof fetch, text: string) {
  if (!env.SLACK_WEBHOOK_URL) return;
  await fetchFn(env.SLACK_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }).catch(() => undefined);
}

function rowsOf(d: ContactInput) {
  return [
    ["会社名", d.company ?? ""],
    ["お名前", d.name],
    ["メール", d.email],
    ["電話", d.tel ?? ""],
    ["種別", CATEGORY_LABELS[d.category]],
    ["内容", d.message],
  ] as const;
}

/**
 * POST /api/contact。順序: Origin → レート制限 → ハニーポット → zod → Turnstile → Resend → Slack。
 * 検証ルールは src/lib/schema/contact.ts のみ。ここに手書きの検証を足さない（CLAUDE.md §2-7）。
 */
export async function handleContact(req: Request, env: Env, ctx: ExecutionContext, deps: Deps = { fetchFn: fetch }): Promise<Response> {
  const origin = req.headers.get("origin") ?? "";
  if (!origin.startsWith(env.SITE_URL) && !origin.startsWith("http://localhost")) return json({ ok: false, error: "Forbidden" }, 403);

  const ip = req.headers.get("cf-connecting-ip");
  if (ip) {
    const key = `contact:${ip}`;
    const n = Number((await env.RATE_LIMIT.get(key)) ?? 0);
    if (n >= RATE_LIMIT_MAX) return json({ ok: false, error: "送信回数の上限に達しました。しばらくしてからお試しください。" }, 429);
    ctx.waitUntil(env.RATE_LIMIT.put(key, String(n + 1), { expirationTtl: 3600 }));
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "リクエストの形式が正しくありません。" }, 400);
  }

  // ハニーポット: 成功に見せて捨てる
  if (typeof body === "object" && body !== null && String((body as { website?: unknown }).website ?? "") !== "") return json({ ok: true });

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const f = z.flattenError(parsed.error).fieldErrors;
    const errors = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0] ?? "入力内容を確認してください"]));
    return json({ ok: false, error: "入力内容を確認してください。", errors }, 400);
  }
  const data = parsed.data;

  if (!(await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip, deps.fetchFn))) {
    return json({ ok: false, error: "スパム対策の確認に失敗しました。ページを再読み込みしてお試しください。" }, 400);
  }

  const rows = rowsOf(data);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table>${rows.map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${k}</th><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;

  try {
    await Promise.all([
      sendMail(env, deps.fetchFn, { to: env.CONTACT_TO_EMAIL, subject: `【お問い合わせ】${data.name} 様${data.company ? `（${data.company}）` : ""}`, html, text, replyTo: data.email }),
      sendMail(env, deps.fetchFn, {
        to: data.email,
        subject: "【株式会社MasKOFF】お問い合わせを受け付けました",
        text: `${data.name} 様\n\nお問い合わせありがとうございます。以下の内容で受け付けました。担当より 2 営業日以内にご連絡いたします。\n\n${text}\n\n株式会社MasKOFF`,
        html: `<p>${esc(data.name)} 様</p><p>お問い合わせありがとうございます。以下の内容で受け付けました。担当より 2 営業日以内にご連絡いたします。</p>${html}<p>株式会社MasKOFF</p>`,
      }),
    ]);
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "メール送信に失敗しました。時間をおいて再度お試しください。" }, 502);
  }

  ctx.waitUntil(notifySlack(env, deps.fetchFn, `お問い合わせ: ${data.name}（${CATEGORY_LABELS[data.category]}）`));
  return json({ ok: true });
}
```

- [ ] **Step 6: `worker/index.ts` を置き換える**

```ts
import { handleContact } from "./contact.ts";
import { json } from "./lib/json.ts";
import { handleRebuild } from "./rebuild.ts";

// 名前は CLAUDE.md §13 に一致させる（wrangler.toml [vars] / wrangler secret put / .dev.vars）
export interface Env {
  ASSETS: Fetcher;
  RATE_LIMIT: KVNamespace;
  SITE_URL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  MICROCMS_WEBHOOK_SECRET: string;
  GITHUB_DISPATCH_TOKEN: string;
  SLACK_WEBHOOK_URL?: string;
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    // run_worker_first = ["/api/*"] のため、ここに来るのは /api/* のみ（他は静的配信）
    if (url.pathname === "/api/contact") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleContact(req, env, ctx);
    }
    if (url.pathname === "/api/rebuild") {
      if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, 405, { allow: "POST" });
      return handleRebuild(req, env);
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Not Found" }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
```

- [ ] **Step 7: `worker/rebuild.ts` の先頭 2 行と token 名だけ変える**

```ts
import type { Env } from "./index.ts";
import { json } from "./lib/json.ts";
```

`authorization: \`Bearer ${env.GITHUB_TOKEN}\`` → `authorization: \`Bearer ${env.GITHUB_DISPATCH_TOKEN}\``。他は変更なし。

- [ ] **Step 8: `wrangler.toml` の `[vars]` とコメントを置き換える**

```toml
[vars]
SITE_URL = "https://maskoff.co.jp"
CONTACT_FROM_EMAIL = "MasKOFF <noreply@maskoff.co.jp>"
CONTACT_TO_EMAIL = "info@maskoff.co.jp"
GITHUB_REPO = "fujimoto-mio/maskoff-web"

# Secrets（wrangler secret put で登録 / ローカルは .dev.vars）
#   RESEND_API_KEY / TURNSTILE_SECRET_KEY / MICROCMS_WEBHOOK_SECRET / GITHUB_DISPATCH_TOKEN / SLACK_WEBHOOK_URL
```

`.dev.vars.example`:

```
# Wrangler ランタイム（Worker）— WSL 内で作成すること
RESEND_API_KEY=re_xxxxxxxx
TURNSTILE_SECRET_KEY=
MICROCMS_WEBHOOK_SECRET=change-me
GITHUB_DISPATCH_TOKEN=github_pat_xxxxxxxx
SLACK_WEBHOOK_URL=
```

- [ ] **Step 9: テスト・型チェック・wrangler の疎通**

```bash
npm test            # contact.test.ts 6 件を含め全 pass
npm run typecheck   # worker/tsconfig.json も通る
npm run build && npx wrangler dev --port 8787 &
sleep 8
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:8787/api/contact -H 'origin: http://localhost:3000' -H 'content-type: application/json' -d '{"name":""}'   # 400
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:8787/api/contact -H 'origin: https://evil.example' -H 'content-type: application/json' -d '{}'               # 403
kill %1
```

`RESEND_API_KEY` が無い環境では正常系は 502 になる（Resend 到達不可）。それで正しい。

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "feat: Worker が zod スキーマを共有して検証し、環境変数名を CLAUDE.md §13 に統一"
```

---

### Task 16: SEO（HOME の metadata / canonical・sitemap・robots・not-found・_redirects）

**Files:**
- Create: `src/app/sitemap.ts` `src/app/robots.ts` `src/app/not-found.tsx` `public/_redirects`
- Modify: `src/app/page.tsx`（`metadata` を追加）

**Interfaces:**
- Consumes: `SITE`（Task 3）、`SectionHeading` `Button`（Task 4）
- Produces: `out/sitemap.xml` `out/robots.txt` `out/404.html`

- [ ] **Step 1: `src/app/page.tsx` の先頭に metadata を追加**

```tsx
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}｜${SITE.tagline} — アパレル・アーティスト支援・Web制作` },
  description: SITE.description,
  alternates: { canonical: "/" },
};
```

- [ ] **Step 2: `src/app/sitemap.ts`（フェーズ②で全ルートを追加する）**

```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE.url}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
```

- [ ] **Step 3: `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/contact/thanks/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: `src/app/not-found.tsx`**

```tsx
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="wrap section-pad">
      <SectionHeading as="h1" en="404" ja="ページが見つかりません" id="nf-title" />
      <p className="text-body text-fg-body">URL が変更されたか、ページが削除された可能性があります。</p>
      <p className="mt-10">
        <Button href="/" variant="line">
          HOME へ戻る
        </Button>
      </p>
    </section>
  );
}
```

- [ ] **Step 5: `public/_redirects`（ひな形。DNS 切替時に現行 STUDIO の URL から 301 を記入）**

```
# Cloudflare Workers Static Assets の _redirects。
# 例: /old-path  /company/  301
```

- [ ] **Step 6: 確認とコミット**

```bash
npm run typecheck && npm run build
ls out/sitemap.xml out/robots.txt out/404.html
grep -o 'rel="canonical" href="[^"]*"' out/index.html
grep -c 'application/ld+json' out/index.html   # 2（Organization + FAQPage）
git add -A
git commit -m "feat: HOME の metadata / canonical、sitemap、robots、404 を追加"
```

---

### Task 17: ドキュメント更新（CLAUDE.md / docs/architecture.md / README.md）

**Files:**
- Modify: `CLAUDE.md` `docs/architecture.md` `README.md`

**Interfaces:** なし（spec §5-2 の変更一覧を反映する）

- [ ] **Step 1: `CLAUDE.md` を置換スクリプトで更新する**

`scratchpad` に以下を保存して `python3 update-claude-md.py` で実行する（各 `rep` は一致しなければ `AssertionError` で止まる。止まったら該当箇所を手で直す）。

```python
import pathlib
p = pathlib.Path("CLAUDE.md")
s = p.read_text(encoding="utf-8")

def rep(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)

# §2 技術スタック
rep("Next.js 15 (App Router) / TypeScript (strict)", "Next.js 16 (App Router) / TypeScript (strict)")
rep("microCMS Hobby（ヘッドレスCMS / API上限5本）\nGSAP + ScrollTrigger / Lenis / Swiper",
    "microCMS Hobby（ヘッドレスCMS / API上限5本 / SDK は使わず生 fetch）\nGSAP + ScrollTrigger / Lenis（アニメーションはフェーズ③でまとめて実装）")

# §2-7 検証の単一情報源
rep("**7. `worker/contact.ts` の `validate()` と `src/lib/schema/contact.ts` の\nzod スキーマは常に同じ条件に保つ。**\n片方だけ変更すると、開発者ツールから入力制限を回避できてしまう。",
    "**7. フォームの検証ルールは `src/lib/schema/contact.ts` の zod スキーマだけに書く。**\n`worker/contact.ts` はこのスキーマを import して `safeParse` する。Worker 側に手書きの\n検証を足さない。二重管理にすると開発者ツールから入力制限を回避できてしまう。")

# §3-1 パディング
rep("- PC: `35px`\n- SP: `19px`", "- PC: `32px`\n- SP: `20px`")

# §3-2 ガター
rep("| SERVICE | 3 | **62px** |\n| FAQ | 3 | **20px** |\n| 実績・パートナー | 4 | **20px** |",
    "| SERVICE | 3 | **列 clamp(28px,4vw,56px) / 行 clamp(48px,6vw,72px)** |\n| FAQ | 3 | **18px** |\n| 実績・パートナー | 4 | **18px** |")

# §4-1 色の追加
rep("  --color-placeholder: #EAEAEA;  /* 画像プレースホルダ */",
    "  --color-placeholder: #EAEAEA;  /* 画像プレースホルダ */\n  --color-border:      #E4E4E1;  /* 罫線 */\n  --color-placeholder-text: #B5B5B2; /* 入力欄プレースホルダ文字 */")

# §4-2 レイアウト
rep("""@theme {
  --pad-x:      35px;   /* PC 左右パディング */
  --pad-x-sp:   19px;   /* SP 左右パディング */

  --gap-service: 62px;
  --gap-card:    20px;

  --radius-card:  12px;
  --radius-form:  20px;
  --radius-input:  8px;
}""", """@theme {
  --spacing-pad-x:     32px;   /* PC 左右パディング */
  --spacing-pad-x-sp:  20px;   /* SP 左右パディング */
  --spacing-header-h:  64px;
  --spacing-section-t: clamp(80px, 10vw, 132px);   /* セクション上 */
  --spacing-section-b: clamp(92px, 11vw, 144px);   /* セクション下 */
  --spacing-fv-gap:    clamp(110px, 11vw, 170px);  /* ヒーロー直後の間隔 */

  --spacing-gap-service-row: clamp(48px, 6vw, 72px);
  --spacing-gap-service-col: clamp(28px, 4vw, 56px);
  --spacing-gap-card:  18px;   /* FAQ / 実績・パートナー */
  --spacing-gap-cols:  64px;   /* VISION / CONTACT の 2 カラム間 */

  --radius-card:    8px;   /* FAQ / パートナー */
  --radius-visual: 10px;   /* SERVICE ビジュアル */
  --radius-form:   18px;
  --radius-input:   6px;
}""")

# §4-3 タイポグラフィ
rep("""@theme {
  --text-display:    38px;  /* セクション見出し PC */
  --text-display-sp: 27px;  /* セクション見出し SP */
  --text-sub:        11px;  /* 見出し下の和文 */
  --text-body:       15px;
  --text-body-sp:    14px;
  --text-caption:    13px;
}""", """@theme {
  --text-display:    clamp(27px, 4.8vw, 46px);  /* セクション見出し PC。700 / 字間 -0.045em */
  --text-display-sp: min(13vw, 60px);           /* セクション見出し SP（PC より大きい） */
  --text-sub:        14px;  /* 見出し下の和文。500 / SP 13px */
  --text-body:       14px;  /* lh 1.8。VISION 本文は lh 2 */
  --text-body-sp:    13px;
  --text-caption:    12px;  /* カード説明・注記・フッター */
  --text-card-title: 20px;  /* SERVICE カード h3。SP 16px */
}""")
rep("- 英字：可変ウェイトのグロテスク系（Helvetica Now / Inter Tight 等）。見出しは 800〜900。",
    "- 英字：Inter Tight（`next/font/google` でセルフホスト）。見出しは 700、字間 −0.045em。")

# §6 ブレークポイント
rep("sp:      〜767px\ntablet:  768px 〜 1023px\npc:      1024px 〜",
    "sp:      〜600px      （Tailwind: max-sp:）\ntablet:  601px 〜 960px（max-pc:）\npc:      961px 〜      （pc:）\nヘッダーのハンバーガー切替は 720px（max-nav:）。Tailwind 既定の sm/md/lg は無効化している。")
rep("| SERVICE | 3列グリッド（gap 62px） | **横スワイプカルーセル**（Swiper / カード幅70% / 次カードpeek / ドット表示） |",
    "| SERVICE | 3列グリッド（列 gap 56px） | **横スワイプカルーセル**（CSS scroll-snap / カード幅80% / gap 14px / 次カードpeek / ドット表示） |")
rep("| 実績・パートナー | 4列グリッド | 2列グリッド |",
    "| 実績・パートナー | 4列グリッド（gap 18px） | **横スワイプカルーセル**（SERVICE と同じ部品） |")
rep("| 追従CTA | 非表示 | 画面下部に固定表示 |",
    "| 追従CTA | 非表示 | **右下固定の円形バッジ 80px**（回転テキスト。CONTACT が見えたら消える） |")
rep("FAQは `<details>/<summary>` で実装し、PCでは CSS で常時 `open` 相当の見た目にします。JSでの出し分けは避けてください（CLSの原因になります）。",
    "FAQは `<details>/<summary>` を閉じた状態で SSR し、PCでは CSS の `::details-content` で常時展開の見た目にします（未対応ブラウザはクリックで開ける）。JSでの出し分けは避けてください（CLSの原因になります）。")

# §7 参考サイトで確認した演出
rep("### 実装順序\n\n**アニメーションは全ページのマークアップが完成してから、最後にまとめて実装します。**",
    "### 参考サイトで確認した演出（フェーズ③の spec で採否を確定）\n\nイントロ幕 / マーキーのセル pop + ドラッグ / 見出しの 1 文字ずつ立ち上がり / VISION の手書きストローク描画と段落フェード / SERVICE の blur 出現 + バッジ pop / WORKS のホバーでサムネ散布・名前ロール・カスタムカーソル / PARTNERS・FAQ の stagger / ヘッダーナビのロール / CTA の液体ホバー / Lenis。\n\n### 実装順序\n\n**アニメーションは全ページのマークアップが完成してから、最後にまとめて実装します。**")

# §9 SVG
rep("- **`next/image` は使わない。** `components/ui/Picture.tsx` を使う（§2参照）。\n- `<img>` の直書きも禁止。",
    "- **`next/image` は使わない。** `components/ui/Picture.tsx` を使う（§2参照）。\n- `<img>` の直書きも禁止。SVG は `Picture` に `width` / `height` を渡す（manifest に載らないため必須）。")

p.write_text(s, encoding="utf-8")
print("CLAUDE.md updated")
```

- [ ] **Step 2: `docs/architecture.md` の冒頭に廃止注記を足す**

先頭行 `# ディレクトリ構成・コンポーネント設計` の直後に挿入:

```markdown

> **2026-08-31 注記:** 本書の ISR / Vercel / `/api/revalidate` / Upstash に関する記述は廃止。
> 現行の構成は CLAUDE.md（Cloudflare Workers + 静的エクスポート）と
> `docs/superpowers/specs/2026-08-31-home-apply-lp-design.md` を正とする。
> ディレクトリ構成は `src/` 配下（§1）のみ有効で、`api/` は存在しない。
```

- [ ] **Step 3: `README.md` を現状に合わせる**

```python
import pathlib
p = pathlib.Path("README.md")
s = p.read_text(encoding="utf-8")
def rep(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)
rep("| `/` | HOME（creator.dipsy.com/apply 型 LP：マーキー / VISION / SERVICE / WORKS / PARTNERS / NEWS / FAQ / CONTACT） | faq, news |",
    "| `/` | HOME（creator.dipsy.com/apply 型 LP：マーキー / VISION / SERVICE / WORKS / PARTNERS / NEWS・NOTICE / FAQ / CONTACT） | faq, news, notice |")
rep("| `/service/` `/service/<slug>/` | 8事業（`lib/services.ts` で静的管理） | — |",
    "| `/service/` `/service/<slug>/` | 8サービス（`src/lib/services.ts` で静的管理）※フェーズ②で移植 | — |")
rep("microCMS の API は **news / notice / members / faq / jobs** の 5 つ（Hobby 上限）。WORKS は `lib/works.ts`。\n環境変数が無い場合は `content/sample.ts` のサンプルデータでビルドされます。",
    "microCMS の API は **news / notice / members / faq / jobs** の 5 つ（Hobby 上限）。WORKS / PARTNERS は `src/lib/works.ts` `src/lib/partners.ts`。\n環境変数が無い場合は `src/content/sample.ts` のサンプルデータでビルドされます。\n\n下層ページ（COMPANY / SERVICE / NEWS / NOTICE / RECRUIT / CONTACT / PRIVACY）はフェーズ②で `src/` に移植します。それまで 404 です。")
rep("2. `wrangler secret put RESEND_API_KEY / TURNSTILE_SECRET_KEY / MICROCMS_WEBHOOK_SECRET / GITHUB_TOKEN`",
    "2. `wrangler secret put RESEND_API_KEY / TURNSTILE_SECRET_KEY / MICROCMS_WEBHOOK_SECRET / GITHUB_DISPATCH_TOKEN`（任意で `SLACK_WEBHOOK_URL`）")
rep("`app/globals.css` の `:root` に集約。ブランドカラーは `--accent` 1 箇所を変更。\n参照サイト踏襲: モノクロ + 単一アクセント / full-bleed 35px（SP 20px）/ SERVICE 62px・FAQ 20px の個別ガター /\nSP で SERVICE はカルーセル・FAQ はアコーディオン・PARTNERS は非表示 / SP 下部固定 CTA。",
    "`src/styles/tokens.css` の `@theme` に集約（creator.dipsy.com/apply の実測値）。ブランドカラーは `--color-marker` / `--color-required`。\nフルブリード 32px（SP 20px）/ SERVICE 列 56px・FAQ 18px の個別ガター / SP で SERVICE・PARTNERS は scroll-snap カルーセル、FAQ はアコーディオン / SP 右下に回転バッジ CTA。")
rep("- `lib/site.ts`（住所・代表者・設立など）\n- `lib/services.ts` 本文、`lib/works.ts`、`app/page.tsx` の PARTNERS\n- `public/images/`（works/01-06.jpg、ogp.png、logo.png）\n- `app/privacy/page.tsx` の文言（法務確認）",
    "- `src/lib/site.ts`（住所・電話・SNS）\n- `src/lib/services.ts` `src/lib/works.ts` `src/lib/partners.ts`、`src/content/sample.ts`\n- `src/components/sections/VisionBlock.tsx` の本文と `public/images/company/*.svg`（手書き見出しはデザイナー入稿の SVG に差し替え）\n- `public/images/`（`scripts/gen-sample-assets.mjs` で生成した仮画像。差し替え後 `npm run images`）")
p.write_text(s, encoding="utf-8")
print("README.md updated")
```

- [ ] **Step 4: 差分を目視してコミット**

```bash
git diff --stat
git diff CLAUDE.md | head -120
git add -A
git commit -m "docs: CLAUDE.md を実測トークン・Next 16・scroll-snap に更新し、architecture.md に廃止注記を追加"
```

---

### Task 18: 最終検証と dev サーバー起動（完了基準 §10-3）

**Files:** なし（検証のみ。結果は最終報告に書く）

- [ ] **Step 1: クリーン環境でのビルド**

```bash
rm -rf node_modules out .next
npm ci
npm run build
grep -c '<section' out/index.html    # 8（Hero / VISION / SERVICE / WORKS / PARTNERS / NEWS / FAQ / CONTACT）
```

- [ ] **Step 2: 型・Lint・テスト**

```bash
npm run typecheck && npm run lint && npm test
```

Expected: すべて成功。`npm test` は `tests 18 / fail 0` 前後（pinned 5 + date 2 + jsonld 2 + marquee 3 + worker 6）。

- [ ] **Step 3: PC / SP / reduced-motion のスクリーンショット**

`shot-local.mjs` に `reducedMotion: 'reduce'` のコンテキストを 1 つ足して撮り直し、Read で確認する:
- PC 1440: ヒーローが 1 画面、VISION 2 カラム、SERVICE 3 列、WORKS 行リスト、PARTNERS 4 列、NEWS / NOTICE 2 カラム、FAQ 3 列展開、CONTACT 2 カラム
- SP 390: ハンバーガー、カルーセル + ドット、FAQ 閉じた 1 列、縦積み CONTACT、右下バッジ。メニュー展開画像。
- reduced-motion: マーキーが静止し先頭セルが見える、バッジが回転しない（2 枚撮って差分なし）

- [ ] **Step 4: キーボード操作**

Playwright で `page.keyboard.press('Tab')` を 12 回繰り返し、`document.activeElement` の `textContent` / `aria-label` を出力して、スキップリンク → ロゴ → ナビ 4 件 → CTA → （本文）の順にフォーカスが移ること、フォーカスリング（黒 2px）が見えることをスクリーンショットで確認する。

- [ ] **Step 5: フォーム疎通（Worker 経由）**

```bash
npm run preview &     # build → wrangler dev（http://localhost:8787）
sleep 10
curl -s -X POST http://localhost:8787/api/contact -H 'origin: http://localhost:8787' -H 'content-type: application/json' \
  -d '{"company":"","name":"テスト","email":"test@example.com","tel":"","category":"web","message":"テスト送信です。10文字以上。","consent":true,"website":"","turnstileToken":"local"}'
# RESEND_API_KEY 未設定 → {"ok":false,"error":"メール送信に失敗しました…"} (502) が正しい。.dev.vars を用意すれば 200。
kill %1
```

- [ ] **Step 6: Lighthouse（モバイル）**

```bash
npx serve out -l 3999 &
sleep 3
CHROME_PATH=/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome npx lighthouse http://localhost:3999/ \
  --preset=mobile --quiet --chrome-flags="--headless --no-sandbox" --output=json --output-path=/tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad/lh.json
node -e "const r=require('/tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad/lh.json').categories; console.log(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Math.round(v.score*100)])))"
kill %1
```

Expected: `performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, seo = 100`。未達なら原因（LCP 画像 / 未使用 CSS / コントラスト等）を特定して直し、再計測する。

- [ ] **Step 7: dev サーバーを起動したままにして報告する**

```bash
npm run dev > /tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad/dev.log 2>&1 &
```

最終報告に含めること:
- URL `http://localhost:3000/`（Windows 側ブラウザから開ける）
- 見どころ: 幅 600px / 720px / 960px で切り替わる挙動、SP のカルーセル・FAQ・右下バッジ、ハンバーガーメニュー
- Lighthouse の 4 スコア、`npm test` の件数
- iOS Safari で確認してほしい項目（100svh の高さ、慣性スクロール、固定バッジ、フォーム入力時のズーム）
- 下層ページは 404 のまま（フェーズ②）

- [ ] **Step 8: ブランチの扱いを確認する**

`superpowers:finishing-a-development-branch` に従い、`feat/home-apply-lp` を `main` にマージするか PR にするかをユーザーに確認する。

---

## Self-Review

**Spec coverage**

| spec | task |
|---|---|
| §4-1 依存復元 / Swiper・SDK 削除 | Task 1 |
| §4-2 ディレクトリ / tsconfig / 衛生（Untitled, Zone.Identifier） | Task 1 |
| §4-3 画像パイプライン / Picture / サンプル素材 | Task 2 |
| §4-4 フォント | Task 3 |
| §5-1 tokens.css | Task 3 |
| §5-2 CLAUDE.md / architecture.md | Task 17 |
| §6 layout/（SkipLink Header MobileNav NoticeBanner StickyCta Footer） | Task 6 |
| §6 ui/（SectionHeading Button Marker Field Picture CarouselDots JsonLd） | Task 2, 4, 9 |
| §6 motion/Marquee | Task 7 |
| §6 sections/（Hero VisionBlock ServiceGrid WorksList PartnerGrid NewsStrip FaqList StepFlow ContactSection ContactForm） | Task 7–14 |
| §7 データ層 | Task 5 |
| §8 フォーム契約 / 環境変数名 | Task 14, 15 |
| §9 SEO / A11y | Task 3（metadata 既定）, 6（skip link, landmarks）, 13（FAQPage）, 16 |
| §10 テスト / 検証 / 完了基準 | Task 5, 7, 15（unit）, 18（clean build, screenshots, keyboard, Lighthouse, dev server） |
| §11 フェーズ②③申し送り | Task 10（data-pat, thumbs）, 17（§7 追記） |

**Placeholder scan:** 「TBD」「後で」「適切に」「同様に」の類は無し。すべてのコード step にコードを載せた。

**Type consistency:**
- `Picture` props（Task 2）は Task 6–11 で `src / alt / sizes / className / imgClassName / priority`、SVG は `width / height` で呼んでいる。
- `duplicate` / `MarqueeRow` / `MarqueeCell`（Task 7）の名前は `Marquee.tsx` と `Hero.tsx` で一致。
- `getNews / getNotice / getFaq / getPinnedNotice / first / NEWS_CATEGORY_LABELS`（Task 5）を Task 6, 12, 13 が同名で使用。`formatDate` は `@/lib/date`。
- `handleContact(req, env, ctx, deps: { fetchFn })`（Task 15）とテストの `fakeFetch()` の戻り `{ calls, fetchFn }` が一致。
- `Env` のキー（Task 15）は `wrangler.toml` `[vars]`・`.dev.vars.example`・`rebuild.ts` と一致。
- `CarouselDots({ trackId, count, label })` は Task 9 / 11 で同じ形。`id="service-track"` / `id="partner-track"` が `<ul>` に付いている。
- `ContactSection` の `id="contact"` を `StickyCta`（Task 6）の IntersectionObserver が参照する。
