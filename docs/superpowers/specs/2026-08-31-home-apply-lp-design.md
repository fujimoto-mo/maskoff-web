# HOME（apply 型 LP）設計 — フェーズ①：基盤 + HOME マークアップ

- 日付: 2026-08-31
- ステータス: 承認済み（実装計画待ち）
- 対象: `/`（HOME）と全ページ共通シェル、ビルド基盤
- 対象外: 下層ページの移植（フェーズ②）、GSAP/Lenis アニメーション（フェーズ③）

---

## 1. 目的とスコープ

`https://creator.dipsy.com/apply` のセクション構成・レイアウト・PC/SP 挙動を踏襲した HOME を、
CLAUDE.md 準拠（Next.js 16 静的エクスポート / Tailwind v4 / Cloudflare Workers）で `src/` に新規実装する。
画像・文言はすべてサンプル（差し替え前提）。

### フェーズ分割

| フェーズ | 内容 | spec |
|---|---|---|
| ① | 基盤（deps / ディレクトリ / トークン / 画像パイプライン）+ 共通シェル + HOME 全セクションのマークアップと CSS 挙動 | 本書 |
| ② | 下層 7 ページ（COMPANY / SERVICE / NEWS / NOTICE / RECRUIT / CONTACT / PRIVACY）を `src/` に移植 | 別途 |
| ③ | アニメーション（GSAP + ScrollTrigger / Lenis）を全ページ一括で実装 | 別途 |

①完了〜②完了の間は下層 URL が 404 になる。本番は現行 STUDIO サイトが配信中のため許容する。

---

## 2. 参考サイト調査サマリ

### 2-1. 技術

Next.js App Router（Turbopack、Vercel）+ Tailwind v4（フォームのみ）+ 独自 CSS + Google Fonts Noto Sans JP。
見出し・本文とも `Helvetica Neue`（Windows では Arial に落ちる）。

### 2-2. 実測値（1440px / 390px）

| 項目 | 実測 |
|---|---|
| 左右パディング `.wrap` | 32px / 20px |
| ヘッダー高 | 64px |
| セクション上下 | `clamp(80px,10vw,132px)` / `clamp(92px,11vw,144px)` |
| FV と VISION の間 `.fv-gap` | `clamp(110px,11vw,170px)` |
| 見出し EN `.sec-en` | `clamp(27px,4.8vw,46px)` 600 字間 −0.045em lh1 / SP `min(13vw,60px)` |
| 見出し JA `.sec-ja` | 14px 500 #6B6B68 字間 .05em mt 6px / SP 13px |
| 本文 | 14px lh1.8（VISION 本文 lh2 max-w 560px）/ SP 13px |
| マーキーセル | `clamp(148px,20vw,256px)` 正方形、gap `clamp(20px,2.8vw,32px)`、行 6 セル×2 / SP `max(160px,(100svh−176px)/3)` gap 20px |
| VISION grid | `1fr 1fr` gap 64px、≤820 で 1 列 gap 76px |
| SERVICE grid | 3 列 gap `clamp(48px,6vw,72px) clamp(28px,4vw,56px)`、mt `clamp(56px,7vw,88px)`、≤960 2 列、≤600 scroll-snap 80% gap 14px |
| SERVICE カード | ビジュアル正方形 #F9F9F9 r10、バッジ 86px 黒丸（SP 74px）、h3 20px 700（SP 16px）、説明 13.5px（SP 11.5px） |
| CREATORS 行 | grid `88px minmax(220px,auto) 1fr` gap 30px、padding 28px 32px、名前 `clamp(22px,2.2vw,30px)` 700、肩書 12.5px、紹介 13px 幅 `max(520px,52vw)` / ≤820: 60px アバター、名前 19px、紹介 11.5px、gap 64px |
| CREATORS サムネ | 240 / 184 / 152 / 168 / 126px 正方形 r4、行の周囲に pat-p1 / pat-p2 の 2 配置を交互 |
| SPONSORING grid | 4 列 gap 18px、画像 21:13 r8、タグ 10px 黒 55% blur、アイコン 44px、h3 18px 700、p 12px / ≤960 2 列、≤600 scroll-snap 80% |
| FAQ grid | 3 列 gap 18px、カード #F9F9F9 r8 p 24px 22px、Q 17px、h3 16px 700（SP 14.5px）、p 12px、small 12px muted / ≤600 1 列 gap 12px アコーディオン |
| OPEN CALL grid | `1fr 1fr` gap 64px、≤900 1 列 gap 48px |
| フォームカード | 白 r18 p 48px 34px 影 `0 0 120px rgba(0,0,0,.04)` / SP p 38px 20px 影 `0 0 96px rgba(0,0,0,.07)` |
| 入力欄 | bg #F5F5F4 r6 p 16px 15px 14px、focus 1.5px #0A0A0A、placeholder #B5B5B2、SP 16px |
| 送信ボタン | 黒 r8 p 18px 34px 16px 700、disabled opacity .35 |
| ヘッダー CTA | 黒ピル r999 p 10px 22px 13px 500、左に白点 8px |
| SP メニュー | 白 92% + blur 10px、リンク `min(11.5vw,54px)` 600 字間 −.04em gap 18px |
| 追従 CTA（≤720） | 右下固定 80px 黒丸、回転テキストリング 18s、矢印 |
| フッター | 12px #6B6B68、p 32px 0 28px |
| 色 | ink #0A0A0A / ink2 #444 / sub #6B6B68 / paper #FFF / mist #F9F9F9 / line #E4E4E1 / マーカー #26FF00 50% / 必須 #EC3B32 |
| MQ | 600 / 720 / 820 / 900 / 960 |

### 2-3. セクション対応

| dipsy | MasKOFF HOME | データ |
|---|---|---|
| Header + SP overlay | Header / MobileNav | `lib/site.ts` |
| — | NoticeBanner（isPinned NOTICE） | `notice` |
| FV 3 行マーキー | Hero | `public/images/hero/*.png` |
| VISION | VisionBlock | 静的 + SVG |
| SERVICE 6 カード | ServiceGrid（先頭 6 件） | `lib/services.ts`（8 件） |
| OFFICIAL CREATORS | WorksList | `lib/works.ts`（6 件） |
| SPONSORING | PartnerGrid | `lib/partners.ts`（4 件） |
| — | NewsStrip（NEWS / NOTICE 最新 3 件） | `news` `notice` |
| FAQ | FaqList | `faq` |
| OPEN CALL | ContactSection（StepFlow + ContactForm） | zod + `/api/contact` |
| Footer | Footer | `lib/site.ts` |
| 回転バッジ | StickyCta | — |

---

## 3. 決定事項（ユーザー確認済み）

1. ベースは `src/` に CLAUDE.md 準拠で新規実装。root の `app/` `components/` `lib/` `content/` `Untitled` は削除（履歴 `86a0a3b` を移植時に参照）。
2. トークンは dipsy 実測値に合わせて CLAUDE.md と `tokens.css` を更新。ブランド色（`--color-marker #2E891E` / `--color-required #EF3B59`）は維持。
3. CREATORS 相当セクションは **WORKS（制作・支援事例）**。
4. 3 フェーズ分割（本書は①）。
5. `next/font/google` で Inter Tight + Noto Sans JP をセルフホスト。
6. SP カルーセルは **CSS scroll-snap + ドット**（Swiper 不使用、依存から外す）。
7. ヘッダーは全ページ共通ナビ（COMPANY / SERVICE / NEWS / RECRUIT）+ CTA `/contact/`。
8. FAQ は `<details>` を閉じて SSR、PC は `::details-content` で常時展開。
9. worker は `src/lib/schema/contact.ts` の zod スキーマを import して検証（手書き二重管理をやめる）。
10. 環境変数名は CLAUDE.md §13 に統一。
11. ユニットテストは `node:test`（依存追加なし）。Lighthouse は `npx lighthouse` を一時実行。

---

## 4. 技術基盤

### 4-1. 依存関係（`package.json`）

`86a0a3b^`（CLAUDE.md 世代）を基準に復元し、`npm install` で lock を再生成する。

- dependencies: `next@^16.3.3` `react@^19.2` `react-dom@^19.2` `zod@^4` `gsap@^3.15`（③用）`lenis@^1.3`（③用）
- devDependencies: `tailwindcss@^4` `@tailwindcss/postcss@^4` `sharp@^0.35` `typescript@^5` `@types/node` `@types/react` `@types/react-dom` `eslint@^9` `eslint-config-next@16.3.3` `prettier` `prettier-plugin-tailwindcss` `wrangler@^4` `@cloudflare/workers-types`
- 外すもの: `swiper` `microcms-js-sdk`（生 fetch で足りる）
- scripts: `dev` / `prebuild: node scripts/optimize-images.mjs` / `build: next build` / `lint: eslint` / `typecheck: tsc --noEmit` / `test: node --test "src/**/*.test.ts" "worker/**/*.test.ts"` / `preview` / `deploy`

Next.js 16 の留意点（同梱 docs `node_modules/next/dist/docs/` で確認済み）: Turbopack 既定、`params` は Promise、`next lint` 廃止（ESLint CLI）、Node ≥20.9、`output: "export"` は従来どおり。

### 4-2. ディレクトリ

```
src/
├ app/
│  ├ layout.tsx            Header / Footer / StickyCta / Organization JSON-LD / next/font
│  ├ page.tsx              HOME
│  ├ globals.css           @import "tailwindcss"; @import "../styles/tokens.css"; 共通スタイル
│  ├ not-found.tsx
│  ├ sitemap.ts  robots.ts
│  └ contact/thanks/page.tsx   最小の完了ページ（noindex）
├ components/
│  ├ layout/   Header, MobileNav("use client"), Footer, StickyCta("use client"), NoticeBanner, SkipLink
│  ├ ui/       SectionHeading, Button, Marker, Field, Picture, CarouselDots("use client")
│  ├ motion/   Marquee（①は CSS keyframes のみ。③で GSAP 化）
│  └ sections/ Hero, VisionBlock, ServiceGrid, WorksList, PartnerGrid, NewsStrip, FaqList, StepFlow, ContactSection, ContactForm("use client")
├ content/sample.ts        microCMS 未接続時のサンプル
├ lib/
│  ├ site.ts               社名・URL・住所・SNS・NAV
│  ├ services.ts works.ts partners.ts   静的データ（サンプル）
│  ├ microcms.ts           型付き fetch + フォールバック + pinnedNotice()
│  ├ jsonld.ts             Organization / FAQPage ビルダー
│  ├ images/manifest.json  optimize-images.mjs の出力（gitignore）
│  └ schema/contact.ts     zod（既存）
├ styles/tokens.css
└ types/microcms.ts
```

`tsconfig.json`: `"@/*": ["./src/*"]`、`exclude` に `worker` `out` `scripts`。`worker/tsconfig.json` は `../src/lib/schema/**` を `include` に追加。

### 4-3. 画像パイプライン

- `scripts/optimize-images.mjs`: `public/images/**/*.{png,jpg}` → `public/images/optimized/**/*.{avif,webp}` + **`src/lib/images/manifest.json`**（`{ [src]: { width, height, avif, webp } }`）。透過 PNG はアルファ保持。`public/images/optimized/` と manifest は gitignore、`prebuild` で生成。
- `ui/Picture.tsx`: props `{ src, alt, sizes, className?, priority?, imgClassName? }`。manifest 未登録の `src` は **ビルド時エラー**（`throw`）にして `<img>` フォールバックを作らない。`width` / `height` を常に出力。`priority` で `loading="eager"` + `fetchPriority="high"`。
- サンプル素材生成 `scripts/gen-sample-assets.mjs`（sharp、初回のみ手動実行、成果物はコミット）:
  - `hero/hero-01..15.png` 透過・幾何シルエット（サイズ不揃い 600〜900px）
  - `service/svc-01..08.png` 正方形 800px
  - `works/logo-01..06.png` 正方形 400px、`works/w01-1..5.png` … 各 5 枚 600px
  - `partners/p01..04.png` 21:13（1050×650）、`partners/icon-01..04.png` 176px
  - `company/vision-handwriting.svg`（ストロークパス、`alt` 用文言をコメント）、`company/vision-diagram.svg`

### 4-4. フォント

`src/app/layout.tsx` で `next/font/google`:
- `Inter_Tight({ subsets:["latin"], weight:["500","700","800"], variable:"--font-inter-tight", display:"swap" })`
- `Noto_Sans_JP({ subsets:["latin"], weight:["400","500","700"], variable:"--font-noto", display:"swap", preload:false })`
`tokens.css` の `--font-display` / `--font-body` はこれらの変数を参照。

---

## 5. デザイントークン

### 5-1. `src/styles/tokens.css`（`@theme`）

```css
@theme {
  /* 色 */
  --color-bg: #ffffff;          --color-bg-dark: #0a0a0a;  --color-bg-mid: #b3b3b3;
  --color-surface: #f9f9f9;     --color-surface-alt: #f5f5f4;  --color-placeholder: #eaeaea;
  --color-fg: #0a0a0a;          --color-fg-body: #444444;  --color-fg-muted: #6b6b68;
  --color-fg-invert: #ffffff;   --color-border: #e4e4e1;   --color-placeholder-text: #b5b5b2;
  --color-marker: #2e891e;      --color-required: #ef3b59; --color-disabled: #a9a9a9;

  /* レイアウト */
  --spacing-pad-x: 32px;        --spacing-pad-x-sp: 20px;
  --spacing-header-h: 64px;
  --spacing-section-t: clamp(80px, 10vw, 132px);
  --spacing-section-b: clamp(92px, 11vw, 144px);
  --spacing-fv-gap: clamp(110px, 11vw, 170px);
  --spacing-head-mb: 40px;      --spacing-head-mb-sp: 32px;
  --spacing-gap-service-row: clamp(48px, 6vw, 72px);
  --spacing-gap-service-col: clamp(28px, 4vw, 56px);
  --spacing-gap-card: 18px;     --spacing-gap-cols: 64px;
  --spacing-mq-cell: clamp(148px, 20vw, 256px);
  --spacing-mq-gap: clamp(20px, 2.8vw, 32px);

  /* 角丸 */
  --radius-card: 8px;  --radius-visual: 10px;  --radius-form: 18px;  --radius-input: 6px;  --radius-pill: 999px;

  /* タイポグラフィ */
  --font-display: var(--font-inter-tight), "Helvetica Neue", Arial, sans-serif;
  --font-body: var(--font-inter-tight), var(--font-noto), "Helvetica Neue", Arial, sans-serif;
  --text-display: clamp(27px, 4.8vw, 46px);
  --text-display--line-height: 1;  --text-display--letter-spacing: -0.045em;  --text-display--font-weight: 700;
  --text-display-sp: min(13vw, 60px);
  --text-sub: 14px;      --text-sub--line-height: 1.2;  --text-sub--letter-spacing: 0.05em;  --text-sub--font-weight: 500;
  --text-sub-sp: 13px;
  --text-body: 14px;     --text-body--line-height: 1.8;
  --text-body-sp: 13px;  --text-body-sp--line-height: 1.8;
  --text-caption: 12px;  --text-caption--line-height: 1.75;
  --text-card-title: 20px;  --text-card-title-sp: 16px;

  /* ブレークポイント */
  --breakpoint-sp: 600px;  --breakpoint-nav: 720px;  --breakpoint-md: 820px;  --breakpoint-form: 900px;  --breakpoint-pc: 961px;

  /* モーション */
  --ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);  --ease-sym: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 300ms;  --duration-base: 550ms;  --duration-slow: 900ms;  --duration-marker: 850ms;
}
```

マーカー描画（`.marker`）: `background-image: linear-gradient(transparent 40%, color-mix(in srgb, var(--color-marker) 50%, transparent) 40% 94%, transparent 94%)`、`background-size: 0% 100%` → `.is-active` で `100% 100%`。①では `is-active` を初期付与（③で ScrollTrigger 制御に切替）。

### 5-2. CLAUDE.md の変更一覧（実装タスクとして行う）

| 箇所 | 変更 |
|---|---|
| §2 技術スタック | `Next.js 15` → `Next.js 16`。`Swiper` 削除。`microCMS` は生 fetch。`manifest.json` パスは現行どおり `src/lib/images/manifest.json` |
| §2-7 | 「validate() と zod を同じ条件に保つ」→「worker は `src/lib/schema/contact.ts` を import して検証する。手書きの検証を追加しない」 |
| §3-1 | PC 35px / SP 19px → **32px / 20px** |
| §3-2 | SERVICE 62px → **列 clamp(28px,4vw,56px)・行 clamp(48px,6vw,72px)**、FAQ / 実績パートナー 20px → **18px** |
| §4-1 | `--color-border: #E4E4E1`、`--color-placeholder-text: #B5B5B2` を追加 |
| §4-2 / §4-3 | 5-1 の値に置換 |
| §6 | `sp 〜600 / tablet 601〜960 / pc 961〜`、ヘッダーは 720 で切替。SERVICE: 「CSS scroll-snap / 幅 80% / gap 14px / ドット」。実績・パートナー: SP は横スワイプ。追従 CTA: 「右下固定の円形バッジ 80px」 |
| §7 | 「③で確定」の注記と dipsy で確認した演出（見出し文字立ち上がり、SERVICE blur 出現 + バッジ pop、WORKS ホバー散布、CTA 液体ホバー、手書きストローク描画、イントロ幕）を候補として追記 |
| §13 | 変更なし（worker 側をこれに合わせる） |
| `docs/architecture.md` | 冒頭に「本書の ISR / Vercel / /api/revalidate 記述は廃止。現行は CLAUDE.md と specs/ を正とする」を追記 |

---

## 6. コンポーネント設計

すべて default export、1 ファイル 1 コンポーネント、JSDoc に呼び出し例。Server Component 既定。

### layout/

- **Header**（Server）: `<header>` sticky、`padding-inline: var(--spacing-pad-x)`（SP 20px）、高さ `--spacing-header-h`。ロゴ `<a href="/">`（`public/images/logo.png` → ワードマーク SVG は②で差し替え。①は Inter Tight 800 テキスト「MasKOFF」）。`<nav aria-label="メイン">` に `NAV` 4 件（≤720 で非表示）+ CTA（`ui/Button` pill）。右端に `MobileNav`。
- **MobileNav**（client）: ボタン `aria-expanded` `aria-controls="mobile-menu"`、`<div id="mobile-menu" role="dialog" aria-modal>`。開くと `document.documentElement` に `data-menu-open` を付けてスクロールロック、Esc で閉じる、初期フォーカスを最初のリンクへ。リンク: NAV 4 件 + NOTICE + PRIVACY（小）+ CTA 全幅 + INSTAGRAM ↗ / X ↗。
- **NoticeBanner**（Server, async）: `pinnedNotice()` が `null` なら何も描画しない。`level==="urgent"` で文字色 `--color-required`。リンク先 `/notice/[slug]/`。
- **StickyCta**（client）: `usePathname()`。`/contact` 配下は `null`。`href` は `/` なら `#contact`、他は `/contact/`。`IntersectionObserver` で `#contact` が可視のとき `data-hidden`。SVG: 円 + `<textPath>`「CONTACT US · お問い合わせ · 」+ 矢印。`@keyframes spin 18s` は `prefers-reduced-motion` で停止。`display:none` at ≥721。
- **Footer**（Server）: 上段 社名 / 住所（12px muted）、下段 `.ft-bar` flex space-between: リンク群（会社概要 `/company/`、お知らせ `/notice/`、プライバシーポリシー `/privacy-policy/`）｜ `© 株式会社MasKOFF`。≤600 で縦積み・リンク 2 列・下余白 64px。
- **SkipLink**: 「本文へスキップ」→ `#main`。

### ui/

- **SectionHeading** `{ en, ja, as?: "h1"|"h2", id?, invert?, className? }`: `<div class="sec-head">` に `<h2 id class="sec-en">` + `<p class="sec-ja">`。`en` 内の `\n` は `<br class="sp-br">`（SP のみ改行）。セクションは `aria-labelledby={id}` で参照する。
- **Button** `{ href | onClick, variant: "pill"|"block"|"line", size?, children }`: pill = 黒 r999、block = 黒 r8 全幅（フォーム送信）、line = 枠線。`<a>` / `<button>` を自動選択。
- **Marker** `{ children }`: `<span class="marker is-active">`。
- **Field** `{ label, name, required?, error?, hint?, children }`: label + 必須「*」+ 子（input/select/textarea）+ `aria-describedby` のエラー文。
- **Picture**: §4-3。
- **CarouselDots**（client） `{ trackId, count }`: `#trackId` の子要素を `IntersectionObserver`（threshold .6）で監視し現在位置をドットに反映。ドットは `<button aria-label="n枚目">` で `scrollIntoView({inline:"center"})`。≥601 では `display:none`。

### motion/

- **Marquee** `{ rows: MarqueeRow[] }`、`MarqueeRow = { cells: MarqueeCell[]; reverse?: boolean; duration?: number }`、`MarqueeCell = { type:"image"; src; alt?; fit?: number } | { type:"text"; lines: string[] } | { type:"logo" }`。各行 `cells` を 2 回描画（`aria-hidden` は 2 周目）。CSS: `.mq-row { width:max-content; display:flex; gap:var(--spacing-mq-gap); animation: drift var(--d,60s) linear infinite }`、`.rev { animation-name: drift-rev }`。`prefers-reduced-motion` で `animation:none` + 1 周目のみ表示（`overflow:hidden` で自然に切れる）。純粋関数 `duplicate(cells)` を切り出しテスト対象にする。

### sections/

- **Hero**: `<section aria-labelledby="hero-title">` `<h1 id class="sr-only">株式会社MasKOFF — TAKE THE MASK OFF｜（サンプル）</h1>` + `Marquee`。`min-height: calc(100svh - var(--spacing-header-h))`（≥601）、`padding: clamp(30px,4vw,50px) 0 clamp(38px,5.2vw,64px)`。行 1: img×3, text, img×2 / 行 2: img×3, logo, img×2（reverse）/ 行 3: img×2, text, img×3。先頭行の最初 3 枚を `priority`。`sizes="(max-width:600px) 45vw, 20vw"`。直後に `<div class="fv-gap">`。
- **VisionBlock**: 見出し + `.vision-grid`。左: `<img src="/images/company/vision-handwriting.svg" alt="…" width height>`（SVG は manifest 対象外なので `<img>` 直書きを **この 1 箇所のみ許可**、CLAUDE.md §9 に注記）+ 段落（`<Marker>` 3 箇所）。右: 図 SVG（同上）。
- **ServiceGrid** `{ services, limit?=6, variant:"grid" }`: `<ul id="service-track" class="svf-grid">`、`<li class="svf">` → `<a href="/service/[slug]/">` 内に `.svf-visual`（`Picture` cover + `.svf-badge`）+ `<h3>` + `<p>`。≤600 で `display:flex; overflow-x:auto; scroll-snap-type:x mandatory; margin-inline:-20px; padding-inline:20px; scrollbar-width:none`、`.svf { flex:0 0 80%; scroll-snap-align:center }`。下に `CarouselDots` と「事業一覧を見る」。
- **WorksList** `{ works }`: `<ul>` 全幅、`<li class="work-row" data-pat="p1|p2">`: `.avatar`（Picture 88px 丸）/ `.id`（`<h3>` 名前 + `<p>` 種別）/ `.bio`。サムネ `<ul class="work-thumbs" hidden>`（③で使用、①は `hidden` のまま DOM に持たせず **データのみ** `works.ts` に定義。manifest 登録のため画像は `public/images/works/` に置く）。
- **PartnerGrid** `{ partners }`: `<ul id="partner-track" class="sp-grid">`、`<li class="sp-item">`: `.sp-img`（Picture cover + `.sp-tag` + `.sp-icon`）+ `<h3>` + `<p>`。SP は ServiceGrid と同じ scroll-snap + `CarouselDots`。
- **NewsStrip** `{ news, notice }`: 2 カラム（≤820 縦積み）。各列 `SectionHeading`（NEWS / NOTICE）+ `<ol>` 3 件（`<time>` / カテゴリ / タイトル、行 `border-bottom`）+ `Button line`「すべて見る」。
- **FaqList** `{ items }`: `<ul class="faq-grid">` → `<li class="faq-card"><details><summary><h3><span class="q">Q</span>質問</h3></summary><p>回答</p><small>注記</small></details></li>`。CSS: `≥601: details summary { pointer-events:none; list-style:none } details::details-content { display:block; content-visibility:visible; height:auto }`。`≤600: summary::after` に「＋」、`details[open] summary::after { rotate:45deg }`。
- **StepFlow** `{ title, steps:{title,text}[] }`: `<h4>[ ご相談の流れ ]</h4><ol>`、`li::before` に番号（26px 黒丸）、`li::after` に 1px 縦線。
- **ContactSection**: `<section id="contact">` `.apply-grid`: 左 `SectionHeading(CONTACT / お問い合わせ)` + リード + `StepFlow`、右 `.form-card` に `ContactForm`。
- **ContactForm**（client）: `useState` でフィールド値・エラー・送信状態。`contactSchema.safeParse` でクライアント検証（`z.flattenError`）→ `fetch("/api/contact", { method:"POST", headers:{"content-type":"application/json"}, body })`。Turnstile は `NEXT_PUBLIC_TURNSTILE_SITE_KEY` がある時のみ `explicit` render。成功で `router.push("/contact/thanks/")`。ハニーポット `website` は `position:absolute; left:-9999px` + `tabIndex=-1` + `autoComplete="off"` + `aria-hidden`。

### globals.css の共通クラス

`.wrap`（padding-inline のみ、max-width 禁止）、`.section`（上下 padding）、`.sr-only`、`.marker`、`:focus-visible`、`[data-menu-open] body { overflow:hidden }`、`@media (prefers-reduced-motion: reduce)` の一括停止。

---

## 7. データ層

### 7-1. `src/types/microcms.ts`

`docs/microcms-schemas/*.json` に一致させる。

```ts
type Base = { id: string; createdAt: string; updatedAt: string; publishedAt: string; revisedAt: string };
export type News   = Base & { title; slug; category: "press"|"works"|"media"|"event"; publishedDate; thumbnail?: MicroImage; excerpt?; body };
export type Notice = Base & { title; slug; level: "normal"|"important"|"urgent"; isPinned?: boolean; publishedDate; expiresAt?; body };
export type Faq    = Base & { question; answer; note?; category?: "service"|"price"|"flow"|"recruit"; order: number };
export type Member = Base & { name; slug; role; avatar: MicroImage; bio; markerPhrases?; worksImages?: MicroImage[]; instagram?; externalUrl?; order };
export type Job    = Base & { … jobs.json どおり … };
```

### 7-2. `src/lib/microcms.ts`

- `ENABLED = Boolean(MICROCMS_SERVICE_DOMAIN && MICROCMS_API_KEY)`。無効時は `content/sample.ts` を返す。
- `getList<T>(endpoint, query)`: `fetch` + `X-MICROCMS-API-KEY`、`limit=100`、失敗は `throw`（ビルドを止める）。
- `news()`（`orders=-publishedDate`）、`notice()`、`faq()`（`orders=order`）、`members()`、`jobs()`（`filters=isOpen[equals]true`）。
- `pinnedNotice(now = new Date())`: `isPinned && (!expiresAt || expiresAt > now)` の最新 1 件。**純粋関数 `selectPinned(list, now)` を分離**してテスト。
- `formatDate(iso) → "2026.08.31"`。

### 7-3. 静的データ

- `lib/site.ts`: `SITE`（name, nameEn, url, description, tagline, address, tel, email, sns）、`NAV`（COMPANY / SERVICE / NEWS / RECRUIT）、`CATEGORY_LABELS`（news category → 表示名）。
- `lib/services.ts`: root の 8 件を移植（`slug, verb, title, lead, image, body, points, flow`）。`image` を追加。
- `lib/works.ts`: `{ id, name, kind, text, logo, thumbs: string[](5), url? }` 6 件。
- `lib/partners.ts`: `{ id, tag, name, text, image, icon }` 4 件。
- `content/sample.ts`: news 4 / notice 2（1 件 `isPinned`）/ faq 6 / members 2 / jobs 3。**文言はすべて仮**と明記。

---

## 8. フォーム契約

### 8-1. リクエスト

`POST /api/contact`、`content-type: application/json`

```json
{ "company":"", "name":"", "email":"", "tel":"", "category":"web|apparel|artist|recruit|other",
  "message":"", "consent":true, "website":"", "turnstileToken":"" }
```

### 8-2. `worker/contact.ts` の処理順

1. `Origin` が `env.SITE_URL` か `http://localhost` で始まらなければ 403
2. KV `RATE_LIMIT` `contact:<ip>` が 5 以上なら 429（TTL 3600）
3. `website` が空でなければ `{ ok:true }` 200（黙って捨てる）
4. `contactSchema.safeParse(body)` 失敗 → 400 `{ ok:false, errors: { field: message } }`
5. Turnstile 検証（`TURNSTILE_SECRET_KEY` 空ならスキップ）失敗 → 400
6. Resend で管理者宛（`reply_to` = 送信者）+ 自動返信。失敗 → 502
7. `SLACK_WEBHOOK_URL` があれば `ctx.waitUntil` で通知（失敗は無視）
8. 200 `{ ok:true }`

### 8-3. 環境変数（CLAUDE.md §13）

- `wrangler.toml [vars]`: `SITE_URL` `CONTACT_FROM_EMAIL` `CONTACT_TO_EMAIL` `GITHUB_REPO`
- Secrets: `RESEND_API_KEY` `TURNSTILE_SECRET_KEY` `MICROCMS_WEBHOOK_SECRET` `GITHUB_DISPATCH_TOKEN` `SLACK_WEBHOOK_URL`
- `worker/index.ts` の `Env` と `rebuild.ts`、`.dev.vars.example` を改名に追従。

---

## 9. SEO / アクセシビリティ

- `layout.tsx` `metadata`: `metadataBase: new URL(SITE.url)`、`title: { default, template: "%s | 株式会社MasKOFF" }`、`description`、`openGraph { type:"website", siteName, locale:"ja_JP", images:["/images/ogp.png"] }`、`twitter { card:"summary_large_image" }`、`robots { index:true, follow:true }`。
- `page.tsx` `metadata`: 固有 title / description、`alternates.canonical: "/"`。
- JSON-LD: `lib/jsonld.ts` の `organization(site)`（`PostalAddress`, `sameAs`）を layout に、`faqPage(items)` を HOME に。`<script type="application/ld+json">` は `JsonLd` ui 部品で出力。
- `sitemap.ts`: `/`（②で全ルート追加）。`robots.ts`: allow all、sitemap URL。`contact/thanks` は `robots: { index:false }`。
- A11y: `SkipLink`、`<main id="main">`、各 section `aria-labelledby`、マーキー `aria-hidden`、ドット `aria-label`、フォーム `aria-invalid` / `aria-describedby` / `role="alert"`、`:focus-visible` 2px。
- reduced-motion: マーキー・回転バッジ停止、ホバー拡大なし、マーカーは常時 100%。

---

## 10. テスト・検証・完了基準

### 10-1. 自動

| 種別 | 対象 |
|---|---|
| `npm run typecheck` / `npm run lint` | 全体 |
| `npm run build` | `prebuild` で画像最適化 → `next build`（`out/`） |
| `npm test`（node:test） | `schema/contact.test.ts`（必須・長さ・enum・consent・honeypot）、`microcms.test.ts`（`selectPinned` の期限・未設定・複数件、フォールバック）、`jsonld.test.ts`、`marquee.test.ts`（`duplicate`）、`worker/contact.test.ts`（403 / 429 / honeypot 200 / 400 / 200 を fetch・KV のフェイクで） |

### 10-2. 手動（実装担当が実施し結果を報告）

- `next dev` を playwright-core で 1440px / 390px 撮影（ヒーロー、各セクション、SP メニュー開、FAQ 開閉、カルーセル）。dipsy と目視比較。
- `wrangler dev` に curl で 200 / 400 / 429 / 403。
- `rm -rf node_modules && npm ci && npm run build` のクリーンビルド。
- `npx lighthouse http://localhost:3000/ --preset=mobile`（`npx serve out` 配信）で §11 閾値。
- キーボード操作、`prefers-reduced-motion` エミュレーション。

### 10-3. 完了基準

1. クリーン環境で `npm ci && npm run build` が成功し、`out/index.html` に 8 セクションが含まれる
2. PC/SP スクリーンショットが §6 の仕様どおり
3. キーボードのみで全導線を辿れ、reduced-motion で全停止
4. `wrangler dev` 経由の送信で `/contact/thanks/` に到達し、異常系が表示される
5. CLAUDE.md・`tokens.css`・`docs/architecture.md` が §5-2 のとおり更新済み
6. `npm test` 成功、Lighthouse モバイル Performance ≥90 / Accessibility ≥95 / Best Practices ≥95 / SEO 100（数値を報告）
7. iOS Safari 実機確認は依頼者に引き継ぐ（確認項目: 100svh、慣性スクロール、fixed バッジ、フォーム入力時のズーム）

---

## 11. フェーズ②③への申し送り

- ②: 下層 7 ページ。root の `86a0a3b:app/**` を参照して `src/app/` に移植。`PageHead` / `Breadcrumb`（BreadcrumbList JSON-LD）/ `Pagination` / `Tag` を ui/ に追加。NEWS サムネは microCMS から直接配信せずビルド時に取得して `public/` へ（§2-4）。RECRUIT 詳細に `JobPosting`。`sitemap.ts` 全ルート。`public/_redirects`。
- ③: イントロ幕、マーキーのセル pop + ドラッグ、見出し文字立ち上がり、VISION 黒背景遷移（`ScrollBgSection`）+ 手書きストローク描画 + 段落フェード + マーカー描画、SERVICE blur 出現 + バッジ pop、WORKS ホバー散布（`Collage`）+ 名前ロール（`RollText`）+ カスタムカーソル、PARTNERS / FAQ の stagger、ヘッダーナビのロール、CTA 液体ホバー、Lenis。すべて `prefers-reduced-motion` で無効化。

---

## 12. リスク

| リスク | 対応 |
|---|---|
| `::details-content` 未対応ブラウザで PC の FAQ が閉じて見える | クリックで開けるため機能は損なわれない。CLS なし |
| ①〜②の間、下層 URL が 404 | 本番は STUDIO 継続。ヘッダーリンクは存在する前提で実装 |
| Lighthouse はローカル値 | 本番 CDN で再計測（フェーズ②完了時） |
| `next/font` はビルド時にネットワーク必須 | GitHub Actions は可。オフラインビルドが必要になれば `public/fonts` にセルフホストへ切替 |
