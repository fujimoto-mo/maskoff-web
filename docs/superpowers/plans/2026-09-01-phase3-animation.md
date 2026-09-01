# フェーズ③ アニメーション Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** creator.dipsy.com/apply の全演出（VISION の背景反転・手書き線・行点灯・マーカー・相関図、見出しの文字立ち上がり、イントロ幕、マーキーの pop とドラッグ、SERVICE/stagger の出現、WORKS のホバー散布、ナビ・CTA のホバー、カスタムカーソル）を依存ライブラリなしで HOME に実装する。

**Architecture:** ページに 1 つの `RevealObserver`（IntersectionObserver）が `[data-reveal]` 要素を `in` に書き換え、演出は CSS が行う。スクロール連動の連続値は `ScrollTheme` の rAF 補間だけ。時間軸の演出（線描画・マーカー・慣性）は Web Animations API と rAF。client 部品はすべて葉ノードで、Server Component が出力した DOM に属性を付けて動かす。JS 無効・reduced-motion では常に最終状態。

**Tech Stack:** Next.js 16 static export / React 19 / Tailwind v4 / IntersectionObserver / ResizeObserver / MutationObserver / Web Animations API / node:test（Node 24 のネイティブ TS 実行）

**Spec:** `docs/superpowers/specs/2026-09-01-phase3-animation-design.md`

## Global Constraints

- 依存ライブラリを追加しない。`gsap` / `lenis` は Task 1 で `package.json` から外す。
- `"use client"` は `motion/{ScrollTheme,RevealObserver,Handwriting,MarkerLayer,IntroVeil,MarqueeDrag,CustomCursor}.tsx` と既存 4 つ（MobileNav / StickyCta / CarouselDots / ContactForm）だけ。
- テスト対象の葉モジュール `motion/*.ts` は内部 import を持たない。テストの相対 import は `.ts` 拡張子付き、型は `import type`。`enum` 禁止。
- `data-reveal` 契約（spec §2-3）: 初期値 `head | para | line | write | diagram | blur | up`、`in` になったら元の値を `data-reveal-kind` に退避して `data-reveal="in"`。一度 `in` にしたら戻さない。
- イベント: `kv:launch`（イントロ幕終了。`RevealObserver` はこれを待つ）、`vision:written`（手書き完了。PC の VISION 段落はこれを待つ）。
- 初期の `opacity:0` 等の隠し状態は **`html.js` 配下だけ**に適用する（`<body>` 先頭の 1 行スクリプトが `js` を付ける）。
- `@media (prefers-reduced-motion: reduce)` で全演出の最終状態を CSS で強制し、JS 側も監視・補間・幕をスキップする。
- 色は `tokens.css` の `@theme` 変数のみ。暗色パレットは `--color-dark-*`。有彩色は `--color-marker` / `--color-required` のみ（CTA 塗り・SP メニュー帯・マーカーはすべて `--color-marker`）。
- コンテナに `max-width` / `mx-auto` を使わない。モバイルでセクションを非表示にしない。スクロールジャック禁止。`will-change` はマーキー行と `#cur` のみ。
- ブレークポイント: `max-sp:`（≤600）/ `max-nav:`（≤720）/ `max-tab:`（≤820）/ `pc:`（≥961）。JS の判定は spec どおり `(max-width: 640px)`（VISION 行）/ `(max-width: 820px)`（WORKS）/ `(hover: hover) and (pointer: fine)`（カーソル・ホバー）。
- 文言・画像はサンプル。`// SAMPLE:` を付ける。
- コミットは日本語 `type: 要約`、Co-Authored-By なし。各 Task 末尾で必ずコミット。ブランチ `feature/make`。作業ディレクトリ `/root/maskoff-web/maskoff-web`。
- 各 Task の確認は `npm run typecheck && npm run lint && npm test && npm run build` を通し、表示系は scratchpad の Playwright（`shot-local.mjs`、フルページ撮影前に全スクロール）で PC 1440 / SP 390 を撮って READ で確認する。dev サーバーは確認後に kill（ポート 3000 が使用中なら先に kill）。

---

## File Structure

| パス | 責務 | Task |
|---|---|---|
| `src/app/layout.tsx` | `html.js` スクリプト、`RevealObserver` / `CustomCursor` の配置 | 1, 12 |
| `src/styles/tokens.css` | 暗色パレット・duration・ease トークン | 1 |
| `src/app/globals.css` | 演出 CSS（`@layer components`）を Task ごとに追記 | 1〜12 |
| `src/components/motion/reveal-delay.ts` `.test.ts` | `revealDelay(n)` / `cellPopDelay()` | 1 |
| `src/components/motion/RevealObserver.tsx` | 監視役（`kv:launch` 待ち、para/line 切替、WORKS の active 行） | 1, 10 |
| `src/components/motion/split-chars.ts` `.test.ts` / `SplitChars.tsx` | 見出しの文字分割 | 2 |
| `src/components/ui/SectionHeading.tsx` | `data-reveal="head"` + 文字分割 | 2 |
| `src/components/motion/scroll-theme-math.ts` `.test.ts` / `ScrollTheme.tsx` | 背景補間 | 3 |
| `src/content/vision-copy.ts` / `src/components/sections/VisionBlock.tsx` | 行構造の本文 | 4 |
| `src/content/vision-handwriting.ts` / `motion/handwriting-timing.ts` `.test.ts` / `motion/Handwriting.tsx` | 手書き線 | 5 |
| `src/components/motion/marker-rects.ts` `.test.ts` / `MarkerLayer.tsx` | 蛍光ペン線 | 6 |
| `src/components/motion/VisionDiagram.tsx` | 相関図（Server） | 7 |
| `src/components/motion/marquee-physics.ts` `.test.ts` / `MarqueeDrag.tsx` / `IntroVeil.tsx` / `Marquee.tsx` / `sections/Hero.tsx` / `app/page.tsx` | 幕・マーキー | 8 |
| `sections/{ServiceGrid,PartnerGrid,FaqList,NewsStrip,ContactSection}.tsx` | `data-reveal` 付与 | 9 |
| `sections/WorksList.tsx` | サムネ・名前ロール・配置パターン・SP アクティブ | 10 |
| `ui/Button.tsx` / `layout/{Header,MobileNav,StickyCta}.tsx` | ナビロール・液体 CTA・メニュー帯・バッジ hover | 11 |
| `src/components/motion/CustomCursor.tsx` | カーソル | 12 |
| `CLAUDE.md` / `README.md` | 文書 | 13 |
| — | 最終検証・dev サーバー | 14 |

---

### Task 1: 基盤（`html.js`・トークン・`RevealObserver`・依存除去）

**Files:**
- Modify: `src/app/layout.tsx` `src/styles/tokens.css` `src/app/globals.css` `package.json`
- Create: `src/components/motion/reveal-delay.ts` `src/components/motion/reveal-delay.test.ts` `src/components/motion/RevealObserver.tsx`

**Interfaces:**
- Produces: `revealDelay(index: number): number`（ms）、`cellPopDelay(distancePx: number, cellWidthPx: number): number`（ms）
- Produces: `RevealObserver`（layout に 1 つ）。`[data-reveal]` を `in` に書き換え、`data-reveal-kind` に元の値を退避。`para` が `in` になるとき配下の `[data-reveal="line"]` も `in` にする。`html[data-intro]` があれば `kv:launch` を待つ。`para` は `vision:written` を待つ（SP ≤640 では `para` を監視せず `line` を監視）。
- Produces: CSS トークン `--color-dark-bg / --color-dark-fg / --color-dark-fg-body / --color-dark-fg-muted / --color-dark-surface / --color-dark-border`、`--duration-reveal-fast: 550ms` `--duration-reveal: 800ms` `--duration-reveal-slow: 900ms` `--duration-write: 1600ms` `--duration-marker-draw: 850ms` `--delay-reveal-step: 80ms`、`--ease-pop` `--ease-boing` `--ease-mk`
- Produces: `html.js` クラス（`<body>` 先頭のインラインスクリプト）

- [ ] **Step 1: `reveal-delay.test.ts` を書く**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { revealDelay, cellPopDelay } from "./reveal-delay.ts";

test("revealDelay は index × 80ms", () => {
  assert.equal(revealDelay(0), 0);
  assert.equal(revealDelay(3), 240);
});

test("cellPopDelay は中央からの距離をセル幅で割って 35ms 刻み", () => {
  assert.equal(cellPopDelay(0, 200), 0);
  assert.equal(cellPopDelay(200, 200), 35);
  assert.equal(cellPopDelay(-500, 200), 88); // 距離は絶対値、四捨五入
});

test("cellPopDelay はセル幅 0 で 0", () => {
  assert.equal(cellPopDelay(300, 0), 0);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test` → `Cannot find module '.../reveal-delay.ts'`

- [ ] **Step 3: `reveal-delay.ts`（葉モジュール）**

```ts
/** stagger 出現の遅延。index 番目は index × 80ms（spec §2-3） */
export function revealDelay(index: number): number {
  return Math.max(0, index) * 80;
}

/** マーキーのセル pop の遅延。画面中央からの距離（px）をセル幅で割り 35ms/セル */
export function cellPopDelay(distancePx: number, cellWidthPx: number): number {
  if (cellWidthPx <= 0) return 0;
  return Math.round((Math.abs(distancePx) / cellWidthPx) * 35);
}
```

- [ ] **Step 4: `npm test` → 29/29（既存 26 + 3）**

- [ ] **Step 5: `tokens.css` の `@theme` にトークンを追加**（`--color-disabled` の行の直後と、`/* --- モーション --- */` ブロックの末尾）

```css
  /* --- 暗色パレット（VISION の背景反転先。spec §4-1）------------------ */
  --color-dark-bg: #0a0a0a;
  --color-dark-fg: #f2f2f0;
  --color-dark-fg-body: #c6c6c3;
  --color-dark-fg-muted: #9a9a97;
  --color-dark-surface: #151514;
  --color-dark-border: #2c2c2a;
```

```css
  --duration-reveal-fast: 550ms;
  --duration-reveal: 800ms;
  --duration-reveal-slow: 900ms;
  --duration-write: 1600ms;
  --duration-marker-draw: 850ms;
  --delay-reveal-step: 80ms;
  --ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-boing: cubic-bezier(0.3, 0.6, 0.4, 1);
  --ease-mk: cubic-bezier(0.6, 0, 0.2, 1);
```

- [ ] **Step 6: `layout.tsx` に `html.js` スクリプトと `RevealObserver` を置く**

import を追加:

```tsx
import RevealObserver from "@/components/motion/RevealObserver";
```

`<body>` の先頭（`<JsonLd …/>` の前）に:

```tsx
        {/* JS が動く環境だけ演出の初期状態（opacity:0 等）を適用する。JS 無効・クローラは常に可視 */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
```

`<StickyCta />` の直後に `<RevealObserver />`。

- [ ] **Step 7: `RevealObserver.tsx`**

```tsx
"use client";
import { useEffect } from "react";

type Kind = "head" | "para" | "line" | "diagram" | "blur" | "up";
const OPTIONS: Record<Kind, IntersectionObserverInit> = {
  head: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  para: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  line: { rootMargin: "0px 0px -25% 0px", threshold: 0 },
  diagram: { rootMargin: "0px 0px -20% 0px", threshold: 0.3 },
  blur: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  up: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
};

/** 要素を「出現済み」にする。元の種別は data-reveal-kind に退避。段落は配下の行も一緒に */
export function markRevealed(el: HTMLElement): void {
  const kind = el.dataset.reveal;
  if (!kind || kind === "in") return;
  el.dataset.revealKind = kind;
  el.dataset.reveal = "in";
  if (kind === "para") el.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach(markRevealed);
}

/**
 * ページに 1 つ。[data-reveal] を IntersectionObserver で監視し、入ったら data-reveal="in" にする。
 * - html[data-intro] があれば kv:launch を待ってから監視を始める
 * - para は vision:written 以降にしか in にしない（PC）。SP(≤640) では para を監視せず line を監視する
 * - write は Handwriting が自前で扱う
 * - reduced-motion なら全部即 in
 * @example <RevealObserver />（layout.tsx）
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = matchMedia("(max-width: 640px)").matches;
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el.dataset.reveal !== "in");

    if (reduce) {
      pending().forEach(markRevealed);
      return;
    }

    const observers: IntersectionObserver[] = [];
    // 手書き（data-reveal="write"）が無いページでは待たない
    let written = !document.querySelector('[data-reveal="write"]');
    const waitingParas = new Set<HTMLElement>();
    const onWritten = () => {
      written = true;
      waitingParas.forEach(markRevealed);
      waitingParas.clear();
    };
    document.addEventListener("vision:written", onWritten);

    const start = () => {
      const groups = new Map<Kind, HTMLElement[]>();
      for (const el of pending()) {
        const kind = el.dataset.reveal as Kind | "write";
        if (kind === "write") continue;
        if (kind === "line" && !sp) continue;
        if (kind === "para" && sp) continue;
        if (!(kind in OPTIONS)) continue;
        const list = groups.get(kind) ?? [];
        list.push(el);
        groups.set(kind, list);
      }
      for (const [kind, els] of groups) {
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io.unobserve(el);
            if (kind === "para" && !written) {
              waitingParas.add(el);
              continue;
            }
            markRevealed(el);
          }
        }, OPTIONS[kind]);
        els.forEach((el) => io.observe(el));
        observers.push(io);
      }
    };

    if (root.hasAttribute("data-intro")) document.addEventListener("kv:launch", start, { once: true });
    else start();

    return () => {
      observers.forEach((io) => io.disconnect());
      document.removeEventListener("vision:written", onWritten);
      document.removeEventListener("kv:launch", start);
    };
  }, []);
  return null;
}
```

- [ ] **Step 8: `globals.css` に演出の土台ブロックを追記**（`@keyframes spin` の直後、FAQ ブロックの前）

```css
/* ============================================================
   演出（フェーズ③）。初期の隠し状態は html.js 配下だけ。
   reduced-motion では末尾のブロックで最終状態を強制する。
   ============================================================ */
@layer components {
  /* 汎用 up: fade + 上昇。FAQ カードは 16px */
  html.js [data-reveal="up"] {
    opacity: 0;
    transform: translateY(18px);
  }
  html.js .faq-card[data-reveal="up"] {
    transform: translateY(16px);
  }
  [data-reveal-kind="up"] {
    opacity: 1;
    transform: none;
    transition:
      opacity var(--duration-reveal-fast) ease var(--rd, 0s),
      transform var(--duration-reveal-fast) var(--ease-out-quart) var(--rd, 0s);
  }
  .faq-card[data-reveal-kind="up"] {
    transition-duration: var(--duration-reveal-fast), var(--duration-reveal);
  }
}
```

- [ ] **Step 9: `package.json` から `gsap` と `lenis` を外し lock を更新**

```bash
npm uninstall gsap lenis
grep -c -E '"gsap"|"lenis"' package.json || echo "removed"
```

- [ ] **Step 10: 確認とコミット**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o "classList.add('js')" out/index.html | head -1
git add -A
git commit -m "feat: 演出の基盤（html.js・トークン・RevealObserver）を追加し gsap/lenis を依存から外す"
```

---

### Task 2: 見出しの文字立ち上がり（`SplitChars` + `SectionHeading`）

**Files:**
- Create: `src/components/motion/split-chars.ts` `src/components/motion/split-chars.test.ts` `src/components/motion/SplitChars.tsx`
- Modify: `src/components/ui/SectionHeading.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: `splitChars(text: string): Token[]`、`Token = { kind: "char"; ch: string; index: number } | { kind: "space" } | { kind: "br" }`
- Produces: `SplitChars({ text })`（Server）— `.ch-clip > .ch` の span 列。`br` は `<br className="hidden max-sp:inline" />`
- Produces: `SectionHeading` のラッパーに `data-reveal="head"`、見出しに `aria-label={en}`、和文 `<p>` に `sec-ja` クラス

- [ ] **Step 1: `split-chars.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitChars } from "./split-chars.ts";

test("文字ごとに連番の index を振る", () => {
  assert.deepEqual(splitChars("FAQ"), [
    { kind: "char", ch: "F", index: 0 },
    { kind: "char", ch: "A", index: 1 },
    { kind: "char", ch: "Q", index: 2 },
  ]);
});

test("空白は space トークン、index は進めない", () => {
  const t = splitChars("OPEN CALL");
  assert.deepEqual(t[4], { kind: "space" });
  assert.deepEqual(t[5], { kind: "char", ch: "C", index: 4 });
});

test("改行は br トークン", () => {
  const t = splitChars("A\nB");
  assert.deepEqual(t, [
    { kind: "char", ch: "A", index: 0 },
    { kind: "br" },
    { kind: "char", ch: "B", index: 1 },
  ]);
});

test("サロゲートペアを分割しない", () => {
  assert.deepEqual(splitChars("𠮷"), [{ kind: "char", ch: "𠮷", index: 0 }]);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test` → `Cannot find module '.../split-chars.ts'`

- [ ] **Step 3: `split-chars.ts`（葉モジュール）**

```ts
export type Token = { kind: "char"; ch: string; index: number } | { kind: "space" } | { kind: "br" };

/** 見出し英字を 1 文字ずつのトークンにする。index は文字だけで連番（アニメの遅延計算用） */
export function splitChars(text: string): Token[] {
  const out: Token[] = [];
  let index = 0;
  for (const ch of Array.from(text)) {
    if (ch === "\n") out.push({ kind: "br" });
    else if (ch === " ") out.push({ kind: "space" });
    else out.push({ kind: "char", ch, index: index++ });
  }
  return out;
}
```

- [ ] **Step 4: `npm test` → 33/33**

- [ ] **Step 5: `SplitChars.tsx`（Server）**

```tsx
import type { CSSProperties } from "react";
import { splitChars } from "@/components/motion/split-chars";

/**
 * 見出し英字を .ch-clip > .ch に分割する（skew 立ち上がり用）。読み上げは親の aria-label に任せ、span は aria-hidden。
 * @example <h2 aria-label="OPEN CALL"><SplitChars text="OPEN CALL" /></h2>
 */
export default function SplitChars({ text }: { text: string }) {
  return (
    <>
      {splitChars(text).map((t, i) => {
        if (t.kind === "br") return <br key={i} className="hidden max-sp:inline" />;
        if (t.kind === "space") return <span key={i} aria-hidden className="ch-space"> </span>;
        return (
          <span key={i} aria-hidden className="ch-clip">
            <span className="ch" style={{ "--ci": t.index } as CSSProperties}>
              {t.ch}
            </span>
          </span>
        );
      })}
    </>
  );
}
```

- [ ] **Step 6: `SectionHeading.tsx` を置き換える**

```tsx
import SplitChars from "@/components/motion/SplitChars";
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
 * 英字は 1 文字ずつ分割され、RevealObserver が data-reveal="in" にすると skew 立ち上がりで出現する。
 * @example <SectionHeading en="SERVICE" ja="事業内容" id="service-title" />
 */
export default function SectionHeading({ en, ja, as = "h2", id, invert = false, className }: Props) {
  const Tag = as;
  return (
    <div data-reveal="head" className={cn("mb-head-mb max-sp:mb-head-mb-sp", className)}>
      <Tag id={id} aria-label={en} className={cn("-ml-[0.045em] font-display text-display max-sp:text-display-sp", invert ? "text-fg-invert" : "text-fg")}>
        <SplitChars text={en} />
      </Tag>
      <p className={cn("sec-ja mt-1.5 ml-[3px] text-sub max-sp:text-sub-sp", invert ? "text-fg-invert/70" : "text-fg-muted")}>{ja}</p>
    </div>
  );
}
```

- [ ] **Step 7: `globals.css` の演出ブロック（Task 1 の `@layer components { … }` 内）に追記**

```css
  /* 見出し: 1 文字ずつ skew 立ち上がり（spec §4-2） */
  .ch-clip {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
    white-space: pre;
    line-height: 1;
    padding: 0.07em 0.08em 0.03em;
    margin: -0.07em -0.08em -0.03em;
  }
  .ch-space {
    display: inline-block;
    white-space: pre;
  }
  .ch {
    display: inline-block;
    white-space: pre;
  }
  html.js [data-reveal="head"] .ch {
    transform: translateY(115%);
  }
  [data-reveal-kind="head"] .ch {
    animation: sec-en-skew-rise 0.68s var(--ease-out-quart) calc(50ms + var(--ci, 0) * 26ms) both;
  }
  html.js [data-reveal="head"] .sec-ja {
    opacity: 0;
    transform: translateY(12px);
  }
  [data-reveal-kind="head"] .sec-ja {
    opacity: 1;
    transform: none;
    transition:
      opacity var(--duration-reveal-fast) ease 0.28s,
      transform var(--duration-reveal-fast) var(--ease-out-quart) 0.28s;
  }
```

`@keyframes spin` の直後（`@layer components` の外）に:

```css
@keyframes sec-en-skew-rise {
  0% { transform: translateY(118%) skewY(6deg) scaleY(1.05); }
  62% { transform: translateY(-2.5%) skewY(-1.6deg) scaleY(1); }
  100% { transform: none; }
}
```

- [ ] **Step 8: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'aria-label="SERVICE"' out/index.html | wc -l   # 1
grep -o 'class="ch"' out/index.html | wc -l               # 60 以上（全見出しの文字数合計）
```

`shot-local.mjs` で PC を撮り、SERVICE 見出しが表示され（スクロール後に `in`）、初期表示のヒーロー直下では見出しが隠れていることを確認。`page.evaluate(() => document.querySelector('#service [data-reveal]')?.dataset.reveal)` がスクロール前 `head`、スクロール後 `in`。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: 見出しの 1 文字ずつ skew 立ち上がりを追加"
```

---

### Task 3: 背景の連続補間（`ScrollTheme`）

**Files:**
- Create: `src/components/motion/scroll-theme-math.ts` `src/components/motion/scroll-theme-math.test.ts` `src/components/motion/ScrollTheme.tsx`
- Modify: `src/components/sections/VisionBlock.tsx`（`<ScrollTheme />` を section 末尾に置く）`src/app/globals.css`

**Interfaces:**
- Produces: `progress(top: number, bottom: number, vh: number): number`、`mix(a: Rgb, b: Rgb, t: number): string`（`"rgb(r, g, b)"`）、`hexToRgb(hex: string): Rgb`、`isOn(t: number): boolean`、`THEME_VARS`（`["bg","fg","fg-body","fg-muted","surface","border","fg-invert"]`）
- Produces: `ScrollTheme({ target?: string })`（既定 `"#vision"`）。`<html>` に `--color-*` をインライン設定し、`t > 0.5` で `data-on-vision`
- Consumes: Task 1 の `--color-dark-*`

- [ ] **Step 1: `scroll-theme-math.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { progress, mix, hexToRgb, isOn } from "./scroll-theme-math.ts";

const vh = 900;

test("上端が画面の 45% より下なら 0", () => {
  assert.equal(progress(400, 1500, vh), 0);
});

test("上端が 100px なら 0.8 以上", () => {
  assert.ok(progress(100, 1200, vh) >= 0.8);
});

test("下端が 300px なら 0.4〜0.6、210px なら 0.2 以下（戻り）", () => {
  const mid = progress(-800, 300, vh);
  assert.ok(mid >= 0.4 && mid <= 0.6, String(mid));
  assert.ok(progress(-900, 210, vh) <= 0.2);
});

test("0〜1 にクランプ", () => {
  assert.equal(progress(-2000, 3000, vh), 1);
  assert.equal(progress(2000, 3000, vh), 0);
});

test("mix は sRGB 線形補間", () => {
  assert.equal(mix([255, 255, 255], [10, 10, 10], 0.5), "rgb(133, 133, 133)");
  assert.equal(mix([255, 255, 255], [10, 10, 10], 0), "rgb(255, 255, 255)");
});

test("hexToRgb", () => {
  assert.deepEqual(hexToRgb("#f2f2f0"), [242, 242, 240]);
  assert.deepEqual(hexToRgb("#FFF"), [255, 255, 255]);
});

test("isOn は 0.5 を超えたら true", () => {
  assert.equal(isOn(0.5), false);
  assert.equal(isOn(0.51), true);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test`

- [ ] **Step 3: `scroll-theme-math.ts`（葉モジュール）**

```ts
export type Rgb = [number, number, number];

/** 補間する変数名（--color-<name>）。fg-invert の暗側は dark-bg を使う */
export const THEME_VARS = ["bg", "fg", "fg-body", "fg-muted", "surface", "border", "fg-invert"] as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * VISION の矩形から反転の進行度 0〜1 を返す（spec §4-1）。
 * 上端が画面の 45% に来たら始まり 5% で 1。下端が 45% を切り始めたら戻り 20% で 0。
 */
export function progress(top: number, bottom: number, vh: number): number {
  const tIn = clamp01((0.45 * vh - top) / (0.4 * vh));
  const tOut = clamp01((bottom - 0.2 * vh) / (0.25 * vh));
  return Math.min(tIn, tOut);
}

export function mix(a: Rgb, b: Rgb, t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function isOn(t: number): boolean {
  return t > 0.5;
}
```

- [ ] **Step 4: `npm test` → 40/40**

- [ ] **Step 5: `ScrollTheme.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { hexToRgb, isOn, mix, progress, THEME_VARS, type Rgb } from "@/components/motion/scroll-theme-math";

/**
 * target の位置に応じて <html> の --color-* を白系→黒系に補間する（ページ全体が反転する）。
 * scroll/resize → rAF で 1 回だけ計算。target が画面の ±1 画面外なら何もしない。
 * reduced-motion では補間せず 0.5 で瞬時に切り替える。
 * @example <ScrollTheme />（VisionBlock の section 内）
 */
export default function ScrollTheme({ target = "#vision" }: { target?: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cs = getComputedStyle(root);
    const light: Record<string, Rgb> = {};
    const dark: Record<string, Rgb> = {};
    for (const v of THEME_VARS) {
      light[v] = hexToRgb(cs.getPropertyValue(`--color-${v}`) || "#ffffff");
      dark[v] = hexToRgb(cs.getPropertyValue(`--color-dark-${v === "fg-invert" ? "bg" : v}`) || "#0a0a0a");
    }
    let raf = 0;
    let applied = false;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > 2 * vh) {
        if (applied) clear();
        return;
      }
      let t = progress(r.top, r.bottom, vh);
      if (reduce) t = isOn(t) ? 1 : 0;
      if (t === 0) {
        if (applied) clear();
        return;
      }
      applied = true;
      for (const v of THEME_VARS) root.style.setProperty(`--color-${v}`, mix(light[v], dark[v], t));
      root.toggleAttribute("data-on-vision", isOn(t));
    };
    const clear = () => {
      applied = false;
      for (const v of THEME_VARS) root.style.removeProperty(`--color-${v}`);
      root.removeAttribute("data-on-vision");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, [target]);
  return null;
}
```

- [ ] **Step 6: `VisionBlock.tsx` に組み込む**（Task 4 で全面書き換えるので、ここでは section の閉じタグ直前に `<ScrollTheme />` を追加し import するだけ）

```tsx
import ScrollTheme from "@/components/motion/ScrollTheme";
```

- [ ] **Step 7: `globals.css` の演出ブロックに反転時の特例を追記**

```css
  /* 反転中（data-on-vision）: 色は変数で自動追従。ヘッダー背景は透過にして本文の反転色を見せる */
  html[data-on-vision] header {
    background: transparent;
  }
```

- [ ] **Step 8: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Playwright（PC 1440）で `#vision` の上端を 500 / 300 / 100 / −200px に置き（`window.scrollTo(0, top + offset)`、各 300ms 待ち）、`getComputedStyle(document.documentElement).getPropertyValue('--color-bg')` と `document.documentElement.hasAttribute('data-on-vision')` を出力。500 → `#ffffff`（または空）、100 → `rgb(4x,4x,4x)` 付近で `data-on-vision` true。VISION 内で撮ったスクショはヘッダーのロゴ・ナビが白、背景が黒。下端 210px 付近で白に戻ること。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: VISION の背景を白から黒へスクロール連動で補間する ScrollTheme を追加"
```

---

### Task 4: VISION 本文の行構造（PC 段落フェード / SP 1 行ずつ点灯）

**Files:**
- Create: `src/content/vision-copy.ts`
- Modify: `src/components/sections/VisionBlock.tsx`（全面書き換え）`src/app/globals.css`

**Interfaces:**
- Produces: `Segment = string | { marker: string }`、`VisionParagraph = Segment[][]`、`VISION_COPY: VisionParagraph[]`
- Produces: DOM 契約 — `.marker-block[data-marker-block]` > `p[data-reveal="para"]` > `span.vln` > `span.vlt[data-reveal="line"][style="--li:n"]` > テキスト / `span.marker-target`。Task 6 の `MarkerLayer` が `.marker-target` を計測する
- Consumes: `RevealObserver`（Task 1）、`ScrollTheme`（Task 3）

- [ ] **Step 1: `src/content/vision-copy.ts`**

```ts
// SAMPLE: VISION 本文。段落 = 行（文）の配列、行 = セグメントの配列。マーカーは 1 セクション 3 箇所まで。
export type Segment = string | { marker: string };
export type VisionParagraph = Segment[][];

export const VISION_COPY: VisionParagraph[] = [
  [
    ["「MASK OFF」には、仮面を外す、素の自分という意味があります。"],
    ["誰かに合わせるために被った仮面は、いつのまにか自分の輪郭を曖昧にしていく。"],
  ],
  [
    ["私たちはファッションブランドの企画から始まった会社です。"],
    ["服は、着る人の「素」を隠すためではなく、", { marker: "引き出すためにある" }, "。"],
    ["その考え方は、アーティストの活動支援にも、ホームページ制作にも通じています。"],
  ],
  [
    ["領域は違っても、やっていることは同じです。"],
    ["人や企業が本来持っている個性を見つけ、形にして、届ける。"],
    [{ marker: "進化したこの時代で、新たな個性をさらけ出す" }, "。"],
  ],
  [
    ["MasKOFFは、そのための仕組みと仲間をつくる会社です。"],
    [{ marker: "素の自分で立てる場所" }, "が、ここから増えていくことを願って。"],
  ],
];
```

- [ ] **Step 2: `VisionBlock.tsx` を置き換える**（手書き・相関図はこの時点ではまだ `Picture`。Task 5 / 7 で差し替える）

```tsx
import type { CSSProperties } from "react";
import ScrollTheme from "@/components/motion/ScrollTheme";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { VISION_COPY } from "@/content/vision-copy";

/**
 * VISION。本文は行構造で出力し、RevealObserver が PC では段落単位・SP では行単位で in にする。
 * 背景反転は ScrollTheme、手書き線は Handwriting、マーカーは MarkerLayer、相関図は VisionDiagram。
 */
export default function VisionBlock() {
  return (
    <section id="vision" aria-labelledby="vision-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="VISION" ja="私たちの想い" id="vision-title" />
        <div className="grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-[76px]">
          <div className="marker-block relative" data-marker-block>
            <Picture src="/images/company/vision-handwriting.svg" alt="仮面を外して、素の自分で。" width={640} height={160} className="relative z-[1] mb-10 block w-full max-w-[560px]" imgClassName="h-auto w-full" />
            <div className="relative z-[1] space-y-[22px] text-body leading-[2] text-fg max-sp:text-body-sp [&>p]:max-w-[560px]">
              {VISION_COPY.map((paragraph, pi) => (
                <p key={pi} data-reveal="para">
                  {paragraph.map((line, li) => (
                    <span key={li} className="vln">
                      <span className="vlt" data-reveal="line" style={{ "--li": li } as CSSProperties}>
                        {line.map((seg, si) =>
                          typeof seg === "string" ? (
                            seg
                          ) : (
                            <span key={si} className="marker-target">
                              {seg.marker}
                            </span>
                          ),
                        )}
                      </span>
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
          <div className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
            <Picture src="/images/company/vision-diagram.svg" alt="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" width={540} height={420} className="block w-full" imgClassName="h-auto w-full" />
          </div>
        </div>
      </div>
      <ScrollTheme />
    </section>
  );
}
```

- [ ] **Step 3: `globals.css` の演出ブロックに VISION の行 CSS を追記**

```css
  /* VISION 本文: PC は文ごとに 1 行、SP(≤640) は流し込み。行は in で順にフェード（spec §4-4） */
  .vln {
    display: block;
  }
  html.js .vlt {
    display: block;
    opacity: 0;
  }
  .vlt[data-reveal-kind="line"] {
    opacity: 1;
    transition: opacity var(--duration-reveal) ease calc(50ms + var(--li, 0) * 70ms);
  }
  @media (width < 641px) {
    .vln,
    html.js .vlt {
      display: inline;
    }
    .vlt[data-reveal-kind="line"] {
      transition: opacity 0.5s ease 0s;
    }
  }
```

- [ ] **Step 4: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'data-reveal="line"' out/index.html | wc -l   # 10（行数）
grep -o 'class="marker-target"' out/index.html | wc -l  # 3
```

Playwright:
- PC 1440: VISION までスクロールして 1.5s 後、`document.querySelectorAll('.vlt[data-reveal="in"]').length` が 10（段落 in で配下も in）。スクショで本文が読める。
- SP 390: VISION 上端から 0 / 300 / 600 / 900px と進め、各位置で `.vlt[data-reveal="in"]` の数を記録 → 単調増加、最初の位置では全 10 行未満。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: VISION 本文を行構造にして PC 段落フェード / SP 行点灯に対応"
```

---

### Task 5: 手書き見出しの線描画（`Handwriting`）

**Files:**
- Create: `src/content/vision-handwriting.ts` `src/components/motion/handwriting-timing.ts` `src/components/motion/handwriting-timing.test.ts` `src/components/motion/Handwriting.tsx`
- Modify: `src/components/sections/VisionBlock.tsx` `src/app/globals.css`
- Delete: `public/images/company/vision-handwriting.svg`

**Interfaces:**
- Produces: `strokeSchedule(lengths: number[], total?: number, gap?: number, min?: number): { delay: number; duration: number }[]`
- Produces: `HANDWRITING = { viewBox, label, strokes: { d: string; width?: number }[] }`
- Produces: `Handwriting()`（client）。`<svg data-reveal="write" role="img" aria-label>`。描画完了で `document` に `vision:written` を発火

- [ ] **Step 1: `handwriting-timing.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { strokeSchedule } from "./handwriting-timing.ts";

test("長さに比例して合計 total に配分し、線の間に gap を置く", () => {
  const s = strokeSchedule([100, 300], 1600, 40, 80);
  assert.deepEqual(s, [
    { delay: 0, duration: 400 },
    { delay: 440, duration: 1200 },
  ]);
});

test("極端に短い線は min を保証する", () => {
  const s = strokeSchedule([1, 999], 1000, 0, 80);
  assert.equal(s[0].duration, 80);
  assert.equal(s[1].delay, 80);
});

test("空配列は空", () => {
  assert.deepEqual(strokeSchedule([]), []);
});

test("既定値は total 1600 / gap 40 / min 80", () => {
  const s = strokeSchedule([50, 50]);
  assert.deepEqual(s, [
    { delay: 0, duration: 800 },
    { delay: 840, duration: 800 },
  ]);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test`

- [ ] **Step 3: `handwriting-timing.ts`（葉モジュール）**

```ts
export type StrokeTiming = { delay: number; duration: number };

/** 各線の描画時間を長さ比で配分（合計 total ms、最短 min ms、線間 gap ms）。遅延は累積 */
export function strokeSchedule(lengths: number[], total = 1600, gap = 40, min = 80): StrokeTiming[] {
  const sum = lengths.reduce((a, b) => a + b, 0);
  const out: StrokeTiming[] = [];
  let delay = 0;
  for (const len of lengths) {
    const duration = Math.max(min, sum > 0 ? Math.round((total * len) / sum) : min);
    out.push({ delay, duration });
    delay += duration + gap;
  }
  return out;
}
```

- [ ] **Step 4: `npm test` → 44/44**

- [ ] **Step 5: `src/content/vision-handwriting.ts`**（現行 SVG の subpath を書き順どおりに分割）

```ts
// SAMPLE: 手書き見出しのストローク。デザイナー入稿の SVG から <path d> を書き順どおりに写す（pathLength=1 で描画するので座標系は自由）。
export const HANDWRITING = {
  viewBox: "0 0 640 160",
  label: "仮面を外して、素の自分で。",
  strokes: [
    { d: "M28 40c22-18 48-16 62 4s-6 52-30 60 18 18 44 4" },
    { d: "M120 34c30 4 60 4 88 0" },
    { d: "M132 60c22 30 40 44 70 58" },
    { d: "M210 30c10 40 6 80 0 100" },
    { d: "M250 44c22-16 48-14 60 8s-8 46-34 52" },
    { d: "M330 36c20 0 44 2 66 6" },
    { d: "M338 62c20 28 32 44 62 62" },
    { d: "M410 40c18-10 44-10 58 4s-2 42-28 52" },
    { d: "M480 30c8 40 4 80 0 104" },
    { d: "M512 56c18-8 40-6 52 8s-2 40-26 46" },
    { d: "M580 60c14 20 22 40 26 62" },
    { d: "M60 130c14 2 30 2 46 0", width: 5 },
  ] as { d: string; width?: number }[],
};
```

- [ ] **Step 6: `Handwriting.tsx`（client）**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { strokeSchedule } from "@/components/motion/handwriting-timing";
import { HANDWRITING } from "@/content/vision-handwriting";

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const dispatchWritten = () => document.dispatchEvent(new CustomEvent("vision:written"));

/**
 * 手書き見出し。画面下 25% に入ったら各線を書き順どおりに描く（stroke-dashoffset 1→0）。
 * 完了で vision:written を発火し、PC の本文フェードとマーカーがこれを待つ。
 * @example <Handwriting />
 */
export default function Handwriting() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".write-stroke"));
    const finish = () => {
      svg.dataset.revealKind = "write";
      svg.dataset.reveal = "in";
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paths.forEach((p) => p.style.setProperty("stroke-dashoffset", "0"));
      finish();
      dispatchWritten();
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done) return;
        done = true;
        io.disconnect();
        finish();
        const timings = strokeSchedule(paths.map((p) => p.getTotalLength()));
        const anims = paths.map((p, i) =>
          p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: timings[i].duration, delay: timings[i].delay, easing: EASE, fill: "forwards" }),
        );
        Promise.all(anims.map((a) => a.finished)).then(dispatchWritten, dispatchWritten);
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      data-reveal="write"
      role="img"
      aria-label={HANDWRITING.label}
      viewBox={HANDWRITING.viewBox}
      className="relative z-[1] mb-10 block h-auto w-full max-w-[560px] overflow-visible text-fg"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {HANDWRITING.strokes.map((s, i) => (
        <path key={i} className="write-stroke" d={s.d} pathLength={1} strokeWidth={s.width} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 7: `VisionBlock.tsx` の手書き `Picture` を `<Handwriting />` に差し替え**（import を `Handwriting` に変更。`Picture` の import は相関図でまだ使う）

- [ ] **Step 8: `globals.css` の演出ブロックに追記**

```css
  /* 手書き線: JS 環境では未描画から始める（Handwriting が animate する） */
  html.js .write-stroke {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
```

- [ ] **Step 9: SVG ファイルを削除して確認**

```bash
git rm -q public/images/company/vision-handwriting.svg
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'class="write-stroke"' out/index.html | wc -l   # 12
grep -c 'vision-handwriting.svg' out/index.html          # 0
```

Playwright（PC）: `document.addEventListener('vision:written', () => window.__written = true)` を仕込んでから VISION へスクロール、2.5s 後に `window.__written === true` と全 `.write-stroke` の `getComputedStyle(...).strokeDashoffset` が `0px`、その直後に `.vlt[data-reveal="in"]` が 10。スクショで線が描かれている。

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "feat: 手書き見出しを書き順どおりに描画する Handwriting を追加"
```

---

### Task 6: 蛍光ペン風マーカー（`MarkerLayer`）

**Files:**
- Create: `src/components/motion/marker-rects.ts` `src/components/motion/marker-rects.test.ts` `src/components/motion/MarkerLayer.tsx`
- Modify: `src/components/sections/VisionBlock.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: `Box = { left; top; width; height }`、`mergeLineRects(rects: readonly Box[], block: Box, lineHeight: number, emPx: number): Box[]`
- Produces: `MarkerLayer()`（client）。`.marker-block[data-marker-block]` の先頭に置く。`.marker-block__layer` を自身で描画し、`.marker-target` ごとに `span.marker-line[data-target][data-line]` を生成
- Consumes: Task 4 の DOM 契約（`.vlt[data-reveal]`、`--li`）、`vision:written`（Task 5）

- [ ] **Step 1: `marker-rects.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeLineRects } from "./marker-rects.ts";

const block = { left: 100, top: 1000, width: 560, height: 800 };

test("1 矩形: block 相対、高さ 0.78 倍・Y 0.16 倍・左右 0.18em の拡張", () => {
  const r = mergeLineRects([{ left: 150, top: 1200, width: 200, height: 28 }], block, 28, 14);
  assert.deepEqual(r, [{ left: 50 - 2.52, top: 200 + 4.48, width: 200 + 5.04, height: 21.84 }]);
});

test("同じ行の複数矩形は 1 本に統合", () => {
  const r = mergeLineRects(
    [
      { left: 150, top: 1200, width: 100, height: 28 },
      { left: 250, top: 1201, width: 120, height: 28 },
    ],
    block,
    28,
    14,
  );
  assert.equal(r.length, 1);
  assert.equal(r[0].width, 220 + 5.04);
});

test("行が違えば分ける（top 差が lineHeight/2 超）", () => {
  const r = mergeLineRects(
    [
      { left: 150, top: 1200, width: 100, height: 28 },
      { left: 100, top: 1228, width: 300, height: 28 },
    ],
    block,
    28,
    14,
  );
  assert.equal(r.length, 2);
  assert.ok(r[0].top < r[1].top);
});

test("幅 0 の矩形は無視", () => {
  assert.deepEqual(mergeLineRects([{ left: 0, top: 0, width: 0, height: 28 }], block, 28, 14), []);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test`

- [ ] **Step 3: `marker-rects.ts`（葉モジュール）**

```ts
export type Box = { left: number; top: number; width: number; height: number };

/**
 * getClientRects() の矩形群を行ごとに 1 本に統合し、蛍光ペンの矩形（block 相対）にする。
 * 高さは行高 × 0.78、Y は行高 × 0.16 下げ、左右に 0.18em ずつはみ出す（spec §3-5）。
 */
export function mergeLineRects(rects: readonly Box[], block: Box, lineHeight: number, emPx: number): Box[] {
  const sorted = rects.filter((r) => r.width > 0).slice().sort((a, b) => a.top - b.top || a.left - b.left);
  const groups: Box[][] = [];
  for (const r of sorted) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(r.top - g[0].top) <= lineHeight * 0.5) g.push(r);
    else groups.push([r]);
  }
  const padX = 0.18 * emPx;
  return groups.map((g) => {
    const left = Math.min(...g.map((r) => r.left));
    const right = Math.max(...g.map((r) => r.left + r.width));
    const top = Math.min(...g.map((r) => r.top));
    return {
      left: left - block.left - padX,
      top: top - block.top + lineHeight * 0.16,
      width: right - left + padX * 2,
      height: lineHeight * 0.78,
    };
  });
}
```

- [ ] **Step 4: `npm test` → 48/48**

- [ ] **Step 5: `MarkerLayer.tsx`（client）**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { mergeLineRects } from "@/components/motion/marker-rects";

const ROTATIONS = [-0.7, 0.35, -0.4];
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const DRAW_MS = 850;
const LINE_STAGGER_MS = 150;
const SP_DELAY_MS = 520;
const PC_EXTRA_MS = 300;

/**
 * .marker-block 内の .marker-target を計測し、背後の層に蛍光ペンの線を置いて左から右へ描く。
 * トリガーは行（.vlt）が data-reveal="in" になった後: SP は 520ms 後、PC は 50ms + 行index × 70ms + 300ms 後。
 * リサイズと vision:written で再計測する。
 * @example <div className="marker-block relative" data-marker-block><MarkerLayer />…</div>
 */
export default function MarkerLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const block = layer?.closest<HTMLElement>("[data-marker-block]");
    if (!layer || !block) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = matchMedia("(max-width: 640px)").matches;
    const targets = Array.from(block.querySelectorAll<HTMLElement>(".marker-target"));
    const drawn = new Set<number>();
    const timers = new Set<number>();

    const build = () => {
      layer.replaceChildren();
      const b = block.getBoundingClientRect();
      targets.forEach((t, i) => {
        const cs = getComputedStyle(t);
        const em = parseFloat(cs.fontSize) || 14;
        const lh = parseFloat(cs.lineHeight) || em * 2;
        mergeLineRects(Array.from(t.getClientRects()), b, lh, em).forEach((box, k) => {
          const line = document.createElement("span");
          line.className = "marker-line";
          line.dataset.target = String(i);
          line.dataset.line = String(k);
          line.style.left = `${box.left}px`;
          line.style.top = `${box.top}px`;
          line.style.width = `${box.width}px`;
          line.style.height = `${box.height}px`;
          line.style.transform = `rotate(${ROTATIONS[(i + k) % ROTATIONS.length]}deg) scaleY(1.04)`;
          if (drawn.has(i)) line.style.clipPath = "inset(0px)";
          layer.appendChild(line);
        });
      });
    };

    const draw = (i: number) => {
      if (drawn.has(i)) return;
      drawn.add(i);
      layer.querySelectorAll<HTMLElement>(`.marker-line[data-target="${i}"]`).forEach((line, k) => {
        if (reduce) {
          line.style.clipPath = "inset(0px)";
          return;
        }
        line.animate([{ clipPath: "inset(0px 100% 0px 0px)" }, { clipPath: "inset(0px 0px 0px 0px)" }], { duration: DRAW_MS, delay: k * LINE_STAGGER_MS, easing: EASE, fill: "forwards" });
      });
    };

    const scheduleFor = (lineEl: HTMLElement) => {
      const li = Number(lineEl.style.getPropertyValue("--li") || 0);
      const delay = reduce ? 0 : sp ? SP_DELAY_MS : 50 + li * 70 + PC_EXTRA_MS;
      targets.forEach((t, i) => {
        if (!lineEl.contains(t)) return;
        const id = window.setTimeout(() => draw(i), delay);
        timers.add(id);
      });
    };

    build();
    // すでに in の行（reduced-motion や遅いマウント）はすぐ描く
    block.querySelectorAll<HTMLElement>('.vlt[data-reveal="in"]').forEach(scheduleFor);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target as HTMLElement;
        if (el.classList.contains("vlt") && el.dataset.reveal === "in") scheduleFor(el);
      }
    });
    mo.observe(block, { attributes: true, attributeFilter: ["data-reveal"], subtree: true });

    let raf = 0;
    const rebuild = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        build();
      });
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(block);
    document.addEventListener("vision:written", rebuild);

    return () => {
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener("vision:written", rebuild);
      timers.forEach((id) => window.clearTimeout(id));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={layerRef} aria-hidden className="marker-block__layer pointer-events-none absolute inset-0 z-0" />;
}
```

- [ ] **Step 6: `VisionBlock.tsx` の `.marker-block` の先頭に `<MarkerLayer />` を追加**（import `MarkerLayer from "@/components/motion/MarkerLayer"`）

- [ ] **Step 7: `globals.css` の演出ブロックに追記**

```css
  /* 蛍光ペン: 別レイヤーの線を clip-path で左→右に描く（spec §3-5）。反転中は不透明の緑 + 黒文字 */
  .marker-line {
    position: absolute;
    border-radius: 2px;
    background: color-mix(in srgb, var(--color-marker) 50%, transparent);
    transform-origin: left center;
    clip-path: inset(0px 100% 0px 0px);
    -webkit-clip-path: inset(0px 100% 0px 0px);
  }
  html[data-on-vision] .marker-line {
    background: var(--color-marker);
  }
  .marker-target {
    position: relative;
  }
  html[data-on-vision] .marker-target {
    color: var(--color-bg-dark);
  }
```

- [ ] **Step 8: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Playwright:
- PC 1440: VISION へスクロールし 3s 待って `document.querySelectorAll('.marker-line').length`（3 対象の視覚行数 = 3〜4）と各 `getComputedStyle(el).clipPath` が `inset(0px)`。`html[data-on-vision]` 時に `.marker-target` の `color` が `rgb(10, 10, 10)`。スクショで緑の帯がテキスト背後に見える。
- SP 390: マーカーのある行が `in` になってから 0.6s 以内に `.marker-line` の `clipPath` が変化し始める。
- 幅を 390 → 768 に `setViewportSize` して 300ms 後、`.marker-line` の `left/width` が更新されている（値が変わる）。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: VISION の蛍光ペン風マーカー（MarkerLayer）を追加"
```

---

### Task 7: 相関図の出現（`VisionDiagram`）

**Files:**
- Create: `src/components/motion/VisionDiagram.tsx`
- Modify: `src/components/sections/VisionBlock.tsx` `src/app/globals.css`
- Delete: `public/images/company/vision-diagram.svg`

**Interfaces:**
- Produces: `VisionDiagram()`（Server）。ラッパー `div[data-reveal="diagram"]`、`svg.vd` 内に `.vd-ring`（点線、回転）、`.vd-ringmask`（マスク用の実線、`pathLength=1`）、`.vd-node[style=--ni]`×5、`.vd-cap`

- [ ] **Step 1: `VisionDiagram.tsx`（Server）**

```tsx
import type { CSSProperties } from "react";

// SAMPLE: 事業の関係図。文言は仮
const NODES = [
  { x: 270, y: 60, r: 56, label: "BRAND" },
  { x: 120, y: 330, r: 56, label: "ARTIST" },
  { x: 420, y: 330, r: 56, label: "CLIENT" },
  { x: 228, y: 220, r: 48, label: "WEB" },
  { x: 312, y: 220, r: 48, label: "EC" },
];

/**
 * 相関図。data-reveal="diagram" が in になると、点線リングがマスクで描かれ、ノードがぼかしから出現する。
 * 色はすべて変数参照なので黒反転に追従する。
 * @example <VisionDiagram />
 */
export default function VisionDiagram() {
  return (
    <div data-reveal="diagram" className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
      <svg viewBox="0 0 540 420" role="img" aria-label="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" className="vd block h-auto w-full font-display font-bold text-fg">
        <defs>
          <mask id="vd-mask">
            <circle className="vd-ringmask" cx="270" cy="210" r="150" fill="none" stroke="#fff" strokeWidth="6" pathLength={1} />
          </mask>
        </defs>
        <circle className="vd-ring" cx="270" cy="210" r="150" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" mask="url(#vd-mask)" />
        {NODES.map((n, i) => (
          <g key={n.label} className="vd-node" style={{ "--ni": i } as CSSProperties}>
            <circle cx={n.x} cy={n.y} r={n.r} className="fill-surface stroke-border" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fill="currentColor">
              {n.label}
            </text>
          </g>
        ))}
        <text className="vd-cap" x="270" y="400" textAnchor="middle" fontSize="17" letterSpacing="-0.5" fill="currentColor">
          TAKE THE MASK OFF
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: `VisionBlock.tsx` の相関図 `Picture` とそのラッパー div を `<VisionDiagram />` に置き換え**（`Picture` の import を削除、`VisionDiagram` を import）

- [ ] **Step 3: `globals.css` に追記**（演出ブロック内 + keyframes）

```css
  /* 相関図（spec §4-5）: リングはマスクで描画、ノードはぼかしから出現、点線は常時回転 */
  .vd-ring {
    transform-box: fill-box;
    transform-origin: 50% 50%;
    animation: vd-spin 80s linear infinite;
  }
  html.js [data-reveal="diagram"] .vd-ringmask {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
  }
  .vd-ringmask {
    stroke-dasharray: 1;
  }
  [data-reveal-kind="diagram"] .vd-ringmask {
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1.5s var(--ease-sym) 0.9s;
  }
  .vd-node {
    transform-box: fill-box;
    transform-origin: 50% 50%;
  }
  html.js [data-reveal="diagram"] .vd-node {
    opacity: 0;
    filter: blur(12px);
    transform: scale(0.25);
  }
  [data-reveal-kind="diagram"] .vd-node {
    opacity: 1;
    filter: none;
    transform: none;
    transition:
      opacity 0.6s ease calc(0.38s + var(--ni, 0) * 0.12s),
      transform 0.85s var(--ease-out-quart) calc(0.38s + var(--ni, 0) * 0.12s),
      filter 0.95s ease calc(0.38s + var(--ni, 0) * 0.12s);
  }
  html.js [data-reveal="diagram"] .vd-cap {
    opacity: 0;
  }
  [data-reveal-kind="diagram"] .vd-cap {
    opacity: 1;
    transition: opacity 0.8s ease 0.8s;
  }
```

```css
@keyframes vd-spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 4: SVG ファイルを削除して確認**

```bash
git rm -q public/images/company/vision-diagram.svg
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'class="vd-node"' out/index.html | wc -l   # 5
grep -c 'vision-diagram.svg' out/index.html         # 0
```

Playwright（PC / SP）: 相関図までスクロールして 3.5s 後、`.vd-ringmask` の `strokeDashoffset` が `0px`、全 `.vd-node` の `opacity` が `1`、`.vd-ring` の `animationName` が `vd-spin`。スクショで円 5 つと点線リングが見える。reduced-motion コンテキストでは即座に最終状態。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: 相関図をインライン SVG 化して出現アニメーションを追加"
```

---

### Task 8: イントロ幕とマーキーの JS 駆動（`IntroVeil` / `MarqueeDrag`）

**Files:**
- Create: `src/components/motion/marquee-physics.ts` `src/components/motion/marquee-physics.test.ts` `src/components/motion/MarqueeDrag.tsx` `src/components/motion/IntroVeil.tsx`
- Modify: `src/components/motion/Marquee.tsx`（全面書き換え）`src/components/sections/Hero.tsx` `src/app/page.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: `RowState = { x: number; v: number; v0: number; half: number }`、`wrap(x, half)`（`(-half, 0]` に正規化）、`advance(s, dt)`、`clampFling(v)`、`MAX_FLING = 900`、`TAU = 0.4`
- Produces: DOM 契約 — `[data-marquee]` > `[data-row][data-reverse?][data-duration]` > `.mq-track`（flex 行）> `[data-cell]`（ロゴセルは `[data-lead]`）。`MarqueeDrag` が `data-js` / `data-go` / `data-dragging` を `[data-marquee]` に付け、各セルに `--ed`、`[data-lead]` に `data-boing`
- Produces: `IntroVeil()`（client）。表示中は `html[data-intro]`。終了時に `kv:launch`。`RevealObserver`（Task 1）と `MarqueeDrag` はこれを待つ
- Consumes: `cellPopDelay`（Task 1）

- [ ] **Step 1: `marquee-physics.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { wrap, advance, clampFling, MAX_FLING } from "./marquee-physics.ts";

test("wrap は x を (-half, 0] に正規化する", () => {
  assert.equal(wrap(0, 1000), 0);
  assert.equal(wrap(-1000, 1000), 0);
  assert.equal(wrap(-1200, 1000), -200);
  assert.equal(wrap(300, 1000), -700);
  assert.equal(wrap(5, 0), 0);
});

test("advance は速度を v0 へ減衰させながら x を進める", () => {
  let s = { x: 0, v: 900, v0: -100, half: 1000 };
  for (let i = 0; i < 180; i++) s = advance(s, 1 / 60); // 3 秒
  assert.ok(Math.abs(s.v - s.v0) < 1, String(s.v));
  assert.ok(s.x <= 0 && s.x > -1000);
});

test("v0 のまま等速なら dt × v0 だけ進む", () => {
  const s = advance({ x: 0, v: -100, v0: -100, half: 1000 }, 0.5);
  assert.equal(Math.round(s.x), -50);
});

test("clampFling は ±MAX_FLING に収める", () => {
  assert.equal(clampFling(5000), MAX_FLING);
  assert.equal(clampFling(-5000), -MAX_FLING);
  assert.equal(clampFling(120), 120);
});
```

- [ ] **Step 2: 失敗を確認** — `npm test`

- [ ] **Step 3: `marquee-physics.ts`（葉モジュール）**

```ts
export type RowState = { x: number; v: number; v0: number; half: number };

/** 指を離したときの慣性の上限（px/s） */
export const MAX_FLING = 900;
/** 基準速度へ戻る時定数（秒）。約 3τ = 1.2s で収束 */
export const TAU = 0.4;

/** 1 周分（half）で剰余を取り (-half, 0] に収める */
export function wrap(x: number, half: number): number {
  if (half <= 0) return 0;
  const m = ((x % half) + half) % half; // [0, half)
  return m === 0 ? 0 : m - half;
}

/** dt 秒進める。速度は v0 へ指数減衰 */
export function advance(s: RowState, dt: number): RowState {
  const v = s.v + (s.v0 - s.v) * (1 - Math.exp(-dt / TAU));
  return { ...s, v, x: wrap(s.x + v * dt, s.half) };
}

export function clampFling(v: number): number {
  return Math.max(-MAX_FLING, Math.min(MAX_FLING, v));
}
```

- [ ] **Step 4: `npm test` → 52/52**

- [ ] **Step 5: `Marquee.tsx` を置き換える**（データ属性を追加。優先度ロジックは現行どおり）

```tsx
import type { CSSProperties } from "react";
import { duplicate, type MarqueeCell, type MarqueeRow } from "@/components/motion/marquee-cells";
import Picture from "@/components/ui/Picture";
import { cn } from "@/lib/cn";

type Props = {
  rows: MarqueeRow[];
  /** 各行の初期表示セルの先頭から何枚を eager / fetchPriority=high にするか（LCP 対策） */
  eagerCount?: number;
};

function Cell({ cell, priority }: { cell: MarqueeCell; priority: boolean }) {
  if (cell.type === "image") {
    return <Picture src={cell.src} alt={cell.alt ?? ""} sizes="(max-width: 600px) 45vw, 20vw" priority={priority} className="block size-full" imgClassName="size-full object-contain" />;
  }
  if (cell.type === "logo") {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="flex size-[62%] items-center justify-center rounded-[22%] bg-fg font-display text-[min(3.4vw,28px)] font-extrabold tracking-[-.04em] text-fg-invert">MasKOFF</div>
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
 * JS が動くと MarqueeDrag が data-js を付けて rAF 駆動に切り替え、セルを中央から順に pop させる。
 * prefers-reduced-motion では globals.css の一括停止で静止画になる。
 * @example <Marquee rows={[{ cells: [img, img, { type: "text", lines: ["TAKE THE", "MASK", "OFF"] }] }]} />
 */
export default function Marquee({ rows, eagerCount = 3 }: Props) {
  return (
    <div data-marquee className="flex flex-col gap-mq-gap overflow-hidden max-sp:gap-5">
      {rows.map((row, r) => {
        const start = row.reverse ? row.cells.length : 0;
        return (
          <div key={r} data-row data-reverse={row.reverse ? "" : undefined} data-duration={row.duration ?? 60} className="overflow-hidden">
            <div
              className={cn("mq-track flex w-max gap-mq-gap max-sp:gap-5", row.reverse ? "animate-[drift-rev_var(--d)_linear_infinite]" : "animate-[drift_var(--d)_linear_infinite]")}
              style={{ "--d": `${row.duration ?? 60}s` } as CSSProperties}
            >
              {duplicate(row.cells).map((cell, i) => {
                const clone = i >= row.cells.length;
                const priority = i >= start && i < start + eagerCount && cell.type === "image";
                return (
                  <div key={i} data-cell data-lead={cell.type === "logo" && !clone ? "" : undefined} aria-hidden={clone || undefined} className="size-mq-cell flex-none max-sp:size-[max(160px,calc((100svh-176px)/3))]">
                    <Cell cell={cell} priority={priority} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: `MarqueeDrag.tsx`（client）**

```tsx
"use client";
import { useEffect } from "react";
import { advance, clampFling, wrap, type RowState } from "@/components/motion/marquee-physics";
import { cellPopDelay } from "@/components/motion/reveal-delay";

type Row = { track: HTMLElement; state: RowState };

/**
 * マーキーを JS 駆動にする: ロゴセルを中央に揃え、kv:launch でセルを pop させて rAF で流し、ドラッグで動かせる。
 * reduced-motion では何もしない（CSS 側で静止）。
 * @example <Marquee rows={ROWS} /><MarqueeDrag />
 */
export default function MarqueeDrag() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>("[data-marquee]");
    if (!root) return;
    const controller = new AbortController();
    const { signal } = controller;

    const rows: Row[] = Array.from(root.querySelectorAll<HTMLElement>("[data-row]")).map((rowEl) => {
      const track = rowEl.querySelector<HTMLElement>(".mq-track")!;
      const half = track.scrollWidth / 2;
      const duration = Number(rowEl.dataset.duration || 60);
      const v0 = (rowEl.hasAttribute("data-reverse") ? 1 : -1) * (half / duration);
      return { track, state: { x: rowEl.hasAttribute("data-reverse") ? -half : 0, v: v0, v0, half } };
    });
    const apply = () => rows.forEach((r) => (r.track.style.transform = `translate3d(${r.state.x}px, 0, 0)`));

    // ロゴセルを画面中央へ。セル pop の遅延は中央からの距離で決める
    const lead = root.querySelector<HTMLElement>("[data-lead]");
    const leadRow = rows.find((r) => r.track.contains(lead));
    const center = root.clientWidth / 2;
    if (lead && leadRow) leadRow.state.x = wrap(center - (lead.offsetLeft + lead.offsetWidth / 2), leadRow.state.half);
    rows.forEach((r) => {
      const cells = Array.from(r.track.querySelectorAll<HTMLElement>("[data-cell]"));
      const w = cells[0]?.offsetWidth || 1;
      cells.forEach((c) => c.style.setProperty("--ed", `${cellPopDelay(c.offsetLeft + c.offsetWidth / 2 + r.state.x - center, w)}ms`));
    });
    root.setAttribute("data-js", "");
    apply();

    // rAF ループ。画面外・非表示タブでは止める
    let raf = 0;
    let last = 0;
    let visible = true;
    let dragging = false;
    const loop = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!dragging) rows.forEach((r) => (r.state = advance(r.state, dt)));
      apply();
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const run = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(
      (e) => {
        visible = e[0].isIntersecting;
        if (visible) run();
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", () => !document.hidden && run(), { signal });

    // ドラッグ: 全行を指に追従させ、離したら慣性 → 基準速度へ
    let lastX = 0;
    let lastT = 0;
    let vInst = 0;
    root.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        dragging = true;
        lastX = e.clientX;
        lastT = performance.now();
        vInst = 0;
        root.setAttribute("data-dragging", "");
        root.setPointerCapture(e.pointerId);
      },
      { signal },
    );
    root.addEventListener(
      "pointermove",
      (e) => {
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max(1, now - lastT) / 1000;
        vInst = dx / dt;
        lastX = e.clientX;
        lastT = now;
        rows.forEach((r) => (r.state = { ...r.state, x: wrap(r.state.x + dx, r.state.half) }));
        apply();
      },
      { signal, passive: true },
    );
    const release = () => {
      if (!dragging) return;
      dragging = false;
      root.removeAttribute("data-dragging");
      const fling = clampFling(vInst);
      rows.forEach((r) => (r.state = { ...r.state, v: fling }));
      run();
    };
    root.addEventListener("pointerup", release, { signal });
    root.addEventListener("pointercancel", release, { signal });

    const launch = () => {
      root.setAttribute("data-go", "");
      run();
    };
    if (document.documentElement.hasAttribute("data-intro")) document.addEventListener("kv:launch", launch, { once: true, signal });
    else launch();

    return () => {
      controller.abort();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      root.removeAttribute("data-js");
      root.removeAttribute("data-go");
      rows.forEach((r) => r.track.style.removeProperty("transform"));
    };
  }, []);
  return null;
}
```

- [ ] **Step 7: `IntroVeil.tsx`（client。SSR でも幕を出す — `html.js` でないときは CSS で非表示）**

```tsx
"use client";
import { useLayoutEffect, useState, type CSSProperties } from "react";

const SHOW_MS_PC = 980;
const SHOW_MS_SP = 1310;

/**
 * 初回表示の黒幕。マーキーのロゴセルの位置にワードマークを重ね、980ms（SP 1310ms）で消えて kv:launch を発火する。
 * reduced-motion / saveData ではスキップ（kv:launch は即発火）。表示中は html[data-intro]。
 * @example <IntroVeil />（page.tsx の先頭）
 */
export default function IntroVeil() {
  const [phase, setPhase] = useState<"show" | "done" | "gone">("show");
  const [logoStyle, setLogoStyle] = useState<CSSProperties>();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const skip = matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (skip) {
      setPhase("gone");
      queueMicrotask(() => document.dispatchEvent(new CustomEvent("kv:launch")));
      return;
    }
    root.setAttribute("data-intro", "");
    const lead = document.querySelector<HTMLElement>("[data-lead]");
    if (lead) {
      const r = lead.getBoundingClientRect();
      setLogoStyle({ left: r.left + r.width / 2, top: r.top + r.height / 2, width: r.width * 0.62, height: r.width * 0.62 });
    }
    const ms = matchMedia("(max-width: 640px)").matches ? SHOW_MS_SP : SHOW_MS_PC;
    const t1 = window.setTimeout(() => {
      setPhase("done");
      lead?.setAttribute("data-boing", "");
      root.removeAttribute("data-intro");
      document.dispatchEvent(new CustomEvent("kv:launch"));
    }, ms);
    const t2 = window.setTimeout(() => setPhase("gone"), ms + 200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      root.removeAttribute("data-intro");
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className="intro-veil fixed inset-0 z-[100] bg-bg-dark" data-phase={phase} aria-hidden>
      <span
        className="veil-logo absolute left-1/2 top-1/2 flex size-[140px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22%] bg-fg font-display text-[28px] font-extrabold tracking-[-.04em] text-fg-invert"
        style={logoStyle}
      >
        MasKOFF
      </span>
    </div>
  );
}
```

- [ ] **Step 8: `Hero.tsx` と `page.tsx` に組み込む**

`Hero.tsx`: `import MarqueeDrag from "@/components/motion/MarqueeDrag";` を追加し、`<Marquee rows={ROWS} />` の直後（同じ `aria-hidden` の div 内）に `<MarqueeDrag />`。
`page.tsx`: `import IntroVeil from "@/components/motion/IntroVeil";` を追加し、`<NoticeBanner />` の前に `<IntroVeil />`。

- [ ] **Step 9: `globals.css` に追記**（演出ブロック + keyframes）

```css
  /* マーキー: JS 駆動時は CSS アニメを止め、セルを中央から順に pop（spec §4-6/4-7） */
  [data-marquee] {
    cursor: grab;
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
  }
  [data-marquee][data-dragging] {
    cursor: grabbing;
  }
  [data-marquee][data-js] .mq-track {
    animation: none;
    will-change: transform;
  }
  [data-marquee][data-js] [data-cell] {
    opacity: 0;
  }
  [data-marquee][data-js] [data-lead] {
    opacity: 1;
  }
  [data-marquee][data-go] [data-cell] {
    opacity: 1;
    animation: cell-pop 0.45s var(--ease-pop) var(--ed, 0s) backwards;
  }
  [data-marquee][data-go] [data-lead] {
    animation: none;
  }
  [data-marquee][data-go] [data-lead][data-boing] {
    transform-origin: 50% 50%;
    animation: lead-boing 0.52s var(--ease-boing) both;
  }
  /* イントロ幕 */
  html:not(.js) .intro-veil {
    display: none;
  }
  .intro-veil[data-phase="done"] {
    opacity: 0;
    transition: opacity 0.12s ease;
    pointer-events: none;
  }
  .veil-logo {
    transition: transform 0.18s ease-in;
  }
```

```css
@keyframes cell-pop {
  0% { opacity: 0; transform: scale(0.55); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes lead-boing {
  0% { transform: scale(0.97, 0.91); }
  44% { transform: scale(1.045); }
  74% { transform: scale(0.988); }
  100% { transform: none; }
}
```

- [ ] **Step 10: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'data-lead' out/index.html | wc -l         # 1
grep -o 'class="intro-veil' out/index.html | wc -l  # 1
```

Playwright（PC 1440）:
1. 読み込み直後 0.3s のスクショ: 黒幕とワードマーク。`document.documentElement.hasAttribute('data-intro')` true、`#service [data-reveal]` の値が `head`（幕中は未発火）。
2. 1.5s 後: 幕が消え（`.intro-veil` が無い）、`[data-marquee]` に `data-js` と `data-go`、`[data-lead]` に `data-boing`。セルが見えるスクショ。
3. `mouse.move(720, 300); mouse.down(); mouse.move(420, 300, { steps: 10 }); mouse.up()` → 直後の `.mq-track` の `transform` が変わっていること、2.5s 後にも動き続けている（2 回の `transform` 取得値が異なる）。
4. SP 390（`hasTouch`）: `touchscreen.tap` のあと `mouse.wheel(0, 600)` で縦スクロールが効く。
5. reduced-motion コンテキスト: `.intro-veil` は非表示、`[data-marquee]` に `data-js` が無く、セルは静止。
6. LCP 確認: `npx serve out -l 3999` + Lighthouse で LCP が Task 7 時点から 0.5s 以上悪化していない（悪化していれば `SHOW_MS_PC` を 700 に下げて再計測し、報告する）。

- [ ] **Step 11: コミット**

```bash
git add -A
git commit -m "feat: イントロ幕とマーキーの JS 駆動（セル pop・ドラッグ慣性）を追加"
```

---

### Task 9: SERVICE の blur 出現＋バッジ pop、PARTNERS / FAQ / NEWS / CONTACT の stagger

**Files:**
- Modify: `src/components/sections/ServiceGrid.tsx` `src/components/sections/PartnerGrid.tsx` `src/components/sections/FaqList.tsx` `src/components/sections/NewsStrip.tsx` `src/components/sections/ContactSection.tsx` `src/app/globals.css`

**Interfaces:**
- Consumes: `revealDelay(index)`（Task 1）、`data-reveal="blur" | "up"` の CSS（Task 1 の `up`、本 Task の `blur`）
- Produces: SERVICE カード `li[data-reveal="blur"][style=--rd]` とバッジ `.svf-badge`、他セクションの `[data-reveal="up"][style=--rd]`

- [ ] **Step 1: `ServiceGrid.tsx` のカードに属性を付ける**

`import { revealDelay } from "@/components/motion/reveal-delay";` と `import type { CSSProperties } from "react";` を追加し、

```tsx
        <ul id="service-track" className="mt-[clamp(56px,7vw,88px)] grid grid-cols-3 gap-x-gap-service-col gap-y-gap-service-row [perspective:1200px] max-pc:grid-cols-2 max-sp:carousel">
          {items.map((s, i) => (
            <li key={s.slug} data-reveal="blur" style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}>
```

バッジの `<span aria-hidden className="absolute top-[10%] …">` に `svf-badge` クラスを先頭に追加する。

- [ ] **Step 2: `PartnerGrid.tsx`・`FaqList.tsx`・`NewsStrip.tsx`・`ContactSection.tsx`**

`PartnerGrid`: `<li key={p.id} className="group" data-reveal="up" style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}>`（`map((p, i)`）。
`FaqList`: `<li key={f.id} className="faq-card rounded-card bg-surface px-[22px] py-6" data-reveal="up" style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}>`（`map((f, i)`）。
`NewsStrip`: `Row` に `index: number` を追加し `<li className="border-b border-border" data-reveal="up" style={{ "--rd": `${revealDelay(index)}ms` } as CSSProperties}>`。呼び出し側で `map((n, i) => <Row … index={i} />)`。
`ContactSection`: リード `<p data-reveal="up" style={{ "--rd": "0ms" } as CSSProperties} …>`、`<StepFlow …/>` を `<div data-reveal="up" style={{ "--rd": "80ms" } as CSSProperties}>` で包む、フォームカードの div に `data-reveal="up" style={{ "--rd": "160ms" } as CSSProperties}`。
各ファイルに `revealDelay` と `CSSProperties` の import を追加（ContactSection は `CSSProperties` のみ）。

- [ ] **Step 3: `globals.css` に追記**（演出ブロック + keyframes）

```css
  /* SERVICE: blur + 奥からの出現、バッジは遅れて pop（spec §4-8）。≤820 は blur なし、≤600 は fade+14px */
  html.js [data-reveal="blur"] {
    opacity: 0;
    filter: blur(14px);
    transform: translateZ(-420px);
  }
  [data-reveal-kind="blur"] {
    opacity: 1;
    filter: none;
    transform: none;
    transition:
      transform var(--duration-reveal-slow) var(--ease-out-quart) var(--rd, 0s),
      opacity var(--duration-reveal-fast) ease var(--rd, 0s),
      filter var(--duration-reveal-slow) ease calc(var(--rd, 0s) + 0.1s);
  }
  @media (width < 821px) {
    html.js [data-reveal="blur"] {
      filter: none;
      transform: none;
    }
  }
  @media (width < 601px) {
    html.js [data-reveal="blur"] {
      transform: translateY(14px);
    }
  }
  html.js [data-reveal="blur"] .svf-badge {
    opacity: 0;
  }
  [data-reveal-kind="blur"] .svf-badge {
    opacity: 1;
    animation: badge-pop 0.55s var(--ease-out-quart) calc(var(--rd, 0s) * 3 + 0.3s) backwards;
  }
```

```css
@keyframes badge-pop {
  0% { opacity: 0; transform: scale(0.4); }
  100% { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 4: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'data-reveal="blur"' out/index.html | wc -l   # 6
grep -o 'data-reveal="up"' out/index.html | wc -l     # 4 + 6 + 6 + 3 = 19
grep -o 'class="svf-badge' out/index.html | wc -l      # 6
```

Playwright（PC 1440）: SERVICE 手前で `.svf`（`#service li`）の `opacity` が 0・`filter` が `blur(14px)`、スクロール後 1.5s で 1・`none`、バッジ `opacity` 1。PARTNERS / FAQ / NEWS / CONTACT も同様に `in` 後 `opacity` 1。SP 390: SERVICE カードが fade + 14px 上昇で出る（`filter` は常に `none`）。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: SERVICE の blur 出現と各セクションの stagger 出現を追加"
```

---

### Task 10: WORKS のホバー散布・名前ロール・SP アクティブ行

**Files:**
- Modify: `src/components/sections/WorksList.tsx`（全面書き換え）`src/components/motion/RevealObserver.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: DOM 契約 — `ul.work-list#work-list` > `li.work-row[data-pat="p0|p1|p2"][data-activate][data-url?]` > `.work-av`（ロゴ）/ `.work-nm`（`.nm-a` + `.nm-b`）/ 概要 / `ul.work-thumbs` > `li.work-sc[data-size="L|M|S|M2|S2"]`
- Produces: `RevealObserver` の `initActiveRows()` — ≤820 で画面中央の `[data-activate]` 行に `data-active`、親に `data-live`、行タップで中央スクロール / active ならリンク
- Consumes: `WORKS[].thumbs`（5 枚）

- [ ] **Step 1: `WorksList.tsx` を置き換える**

```tsx
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { WORKS, type Work } from "@/lib/works";

const SIZES = ["L", "M", "S", "M2", "S2"] as const;

/**
 * 全幅の行リスト。PC はホバーでサムネ 5 枚が散布し他行が薄くなる。≤820 は画面中央の行がアクティブ（RevealObserver）。
 * @example <WorksList />
 */
export default function WorksList({ works = WORKS }: { works?: readonly Work[] }) {
  return (
    <section id="works" aria-labelledby="works-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="WORKS" ja="制作・支援事例" id="works-title" className="max-tab:mb-[240px]" />
      </div>
      <ul id="work-list" className="work-list max-tab:wrap max-tab:flex max-tab:flex-col max-tab:gap-16">
        {works.map((w, i) => (
          <li
            key={w.id}
            data-pat={`p${i % 3}`}
            data-activate
            data-url={w.url}
            className="work-row relative grid grid-cols-[88px_minmax(220px,auto)_1fr] items-center gap-x-[30px] px-pad-x py-7 max-tab:grid-cols-[60px_1fr] max-tab:gap-x-3.5 max-tab:px-0.5 max-tab:py-1"
          >
            <Picture src={w.logo} alt="" sizes="88px" className="work-av block size-[88px] overflow-hidden rounded-full max-tab:size-[60px]" imgClassName="size-full object-cover" />
            <div className="min-w-0">
              <h3 className="font-display text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.15] tracking-[.005em] text-fg max-tab:text-[19px] max-tab:leading-[1.1]">
                {w.url ? (
                  <a href={w.url} target="_blank" rel="noopener" className="work-nm">
                    <span className="nm-a">{w.name}</span>
                    <span className="nm-b" aria-hidden>{w.name}</span>
                  </a>
                ) : (
                  <span className="work-nm">
                    <span className="nm-a">{w.name}</span>
                    <span className="nm-b" aria-hidden>{w.name}</span>
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-[12.5px] font-medium tracking-[.02em] text-fg-muted max-tab:text-[11px] max-tab:font-semibold">{w.kind}</p>
            </div>
            <p className="w-[max(520px,52vw)] max-w-full justify-self-end text-[13px] leading-[1.85] text-fg-body max-tab:col-span-full max-tab:mt-3 max-tab:w-auto max-tab:text-[11.5px] max-tab:leading-[1.8]">
              {w.text}
            </p>
            <ul className="work-thumbs" aria-hidden>
              {w.thumbs.slice(0, 5).map((src, k) => (
                <li key={src} className="work-sc" data-size={SIZES[k]}>
                  <Picture src={src} alt="" sizes="240px" className="block size-full" imgClassName="size-full rounded-[4px] object-cover" />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: `RevealObserver.tsx` に `initActiveRows` を追加**

ファイル末尾に:

```ts
/** ≤820: 画面中央の [data-activate] 行を data-active にし、親に data-live を付ける。タップで中央へ / active ならリンク */
export function initActiveRows(): () => void {
  if (!matchMedia("(max-width: 820px)").matches) return () => {};
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-activate]"));
  if (rows.length === 0) return () => {};
  const list = rows[0].parentElement;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        rows.forEach((r) => r.removeAttribute("data-active"));
        (e.target as HTMLElement).setAttribute("data-active", "");
        list?.setAttribute("data-live", "");
      }
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
  );
  rows.forEach((r) => io.observe(r));
  const onClick = (ev: Event) => {
    const row = (ev.target as HTMLElement).closest<HTMLElement>("[data-activate]");
    if (!row || (ev.target as HTMLElement).closest("a")) return;
    if (!row.hasAttribute("data-active")) row.scrollIntoView({ block: "center", behavior: "smooth" });
    else if (row.dataset.url) window.open(row.dataset.url, "_blank", "noopener");
  };
  list?.addEventListener("click", onClick);
  return () => {
    io.disconnect();
    list?.removeEventListener("click", onClick);
  };
}
```

`RevealObserver` の `useEffect` の先頭（`reduce` 判定の前）に `const stopActive = initActiveRows();` を置き、reduce の早期 return と最後の cleanup の両方で `stopActive()` を呼ぶ。

- [ ] **Step 3: `globals.css` に追記**（演出ブロック + keyframes）

```css
  /* WORKS（spec §4-10）: PC はホバーでサムネ散布、SP は中央の行がアクティブ */
  .work-nm {
    position: relative;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .work-nm .nm-a,
  .work-nm .nm-b {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: transform var(--duration-reveal-fast) var(--ease-sym);
  }
  .work-nm .nm-b {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
  }
  .work-thumbs {
    display: contents;
  }
  .work-sc {
    position: absolute;
    z-index: 7;
    aspect-ratio: 1;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(26px) scale(0.94);
    transition:
      opacity var(--duration-fast) ease,
      transform var(--duration-reveal-slow) var(--ease-out-quart);
  }
  .work-sc[data-size="L"] { width: 240px; }
  .work-sc[data-size="M"] { width: 184px; z-index: 6; }
  .work-sc[data-size="S"] { width: 152px; z-index: 8; }
  .work-sc[data-size="M2"] { width: 168px; z-index: 6; }
  .work-sc[data-size="S2"] { width: 126px; z-index: 8; }
  .work-row[data-pat="p1"] .work-sc[data-size="L"] { bottom: calc(100% + 8px); right: 5%; }
  .work-row[data-pat="p1"] .work-sc[data-size="M"] { top: calc(100% + 12px); left: 24%; }
  .work-row[data-pat="p1"] .work-sc[data-size="S"] { bottom: calc(100% + 40px); left: 12%; }
  .work-row[data-pat="p1"] .work-sc[data-size="M2"] { top: calc(100% + 34px); right: 20%; }
  .work-row[data-pat="p1"] .work-sc[data-size="S2"] { bottom: calc(100% + 14px); left: 40%; }
  .work-row[data-pat="p2"] .work-sc[data-size="L"] { bottom: calc(100% + 8px); left: 14%; }
  .work-row[data-pat="p2"] .work-sc[data-size="M"] { top: calc(100% + 12px); right: 7%; }
  .work-row[data-pat="p2"] .work-sc[data-size="S"] { bottom: calc(100% + 40px); right: 27%; }
  .work-row[data-pat="p2"] .work-sc[data-size="M2"] { top: calc(100% + 30px); left: 36%; }
  .work-row[data-pat="p2"] .work-sc[data-size="S2"] { bottom: calc(100% + 16px); right: 5%; }
  .work-row[data-pat="p0"] .work-sc[data-size="L"] { top: calc(100% + 6px); right: 24%; }
  .work-row[data-pat="p0"] .work-sc[data-size="M"] { bottom: calc(100% + 16px); left: 12%; }
  .work-row[data-pat="p0"] .work-sc[data-size="S"] { bottom: calc(100% + 42px); right: 5%; }
  .work-row[data-pat="p0"] .work-sc[data-size="M2"] { top: calc(100% + 26px); left: 14%; }
  .work-row[data-pat="p0"] .work-sc[data-size="S2"] { bottom: calc(100% + 10px); left: 46%; }
  @media (hover: hover) and (pointer: fine) {
    .work-row {
      transition: opacity var(--duration-fast) ease;
    }
    .work-list:hover .work-row {
      opacity: 0.05;
    }
    .work-list:hover .work-row:hover {
      opacity: 1;
    }
    .work-row:hover .work-sc {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .work-row:hover .work-sc[data-size="M"] { transition-delay: 70ms; animation: crl-breath 5.2s ease-in-out 1s infinite alternate; }
    .work-row:hover .work-sc[data-size="S"] { transition-delay: 130ms; animation: crl-breath 3.8s ease-in-out 0.9s infinite alternate; }
    .work-row:hover .work-sc[data-size="L"] { animation: crl-breath 4.5s ease-in-out 0.8s infinite alternate; }
    .work-row:hover .work-sc[data-size="M2"] { transition-delay: 100ms; animation: crl-breath 4.9s ease-in-out 1.1s infinite alternate; }
    .work-row:hover .work-sc[data-size="S2"] { transition-delay: 160ms; animation: crl-breath 4.1s ease-in-out 0.95s infinite alternate; }
    .work-row:hover .work-av img {
      transform: scale(1.07);
    }
    .work-av img {
      transition: transform var(--duration-base) var(--ease-out-quart);
    }
    .work-row:hover .nm-a,
    .work-row:hover .nm-b {
      transform: translateY(-100%);
    }
  }
  @media (width < 821px) {
    .work-row {
      transition: opacity 0.45s ease;
    }
    .work-list[data-live] .work-row {
      opacity: 0.05;
    }
    .work-list[data-live] .work-row[data-active] {
      opacity: 1;
    }
    .work-row[data-active] .work-sc {
      opacity: 1;
      transform: none;
    }
    .work-row[data-active] .work-sc[data-size="S2"] { transition-delay: 60ms; }
    .work-row[data-active] .work-sc[data-size="M"] { transition-delay: 90ms; }
    .work-row[data-active] .work-sc[data-size="S"] { transition-delay: 130ms; }
    .work-row[data-active] .work-sc[data-size="M2"] { transition-delay: 170ms; }
    .work-sc[data-size="L"] { inset: auto -4% calc(100% + 14px) auto; width: min(34vw, 136px); }
    .work-sc[data-size="S2"] { inset: auto auto calc(100% + 128px) 2%; width: min(18vw, 72px); }
    .work-sc[data-size="M"] { inset: calc(100% + 22px) auto auto -4%; width: min(31vw, 124px); }
    .work-sc[data-size="S"] { inset: auto auto calc(100% + 70px) 30%; width: min(24vw, 96px); }
    .work-sc[data-size="M2"] { inset: calc(100% + 74px) 2% auto auto; width: min(28vw, 112px); }
    .work-nm .nm-a,
    .work-nm .nm-b {
      transition: none;
      transform: none !important;
    }
  }
```

```css
@keyframes crl-breath {
  0% { translate: 0 0; }
  100% { translate: 0 -4px; }
}
```

- [ ] **Step 4: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'class="work-sc"' out/index.html | wc -l   # 30
grep -o 'data-pat="p' out/index.html | wc -l         # 6
```

Playwright:
- PC 1440: WORKS までスクロール、2 行目を `hover()` → 1.2s 後に `.work-row:nth-child(2) .work-sc` 5 枚の `opacity` が 1、他行の `opacity` が 0.05、`.nm-a` の `transform` が `matrix(1,0,0,1,0,-H)`。スクショ。
- SP 390（`hasTouch`）: WORKS の 3 行目が画面中央に来るようスクロール → `[data-active]` が 1 行だけ、`#work-list[data-live]` あり、その行の `.work-sc` が表示。別の行を `tap` → その行が中央へスクロールして active になる。
- reduced-motion: hover で `animation-name` が `none`。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: WORKS のホバー散布・名前ロールと SP のアクティブ行を追加"
```

---

### Task 11: ヘッダーナビのロール・CTA の液体ホバー・SP メニューの帯・追従バッジ hover

**Files:**
- Modify: `src/components/ui/Button.tsx`（全面書き換え）`src/components/layout/Header.tsx` `src/components/layout/MobileNav.tsx` `src/components/layout/StickyCta.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: `Button` に `variant="liquid"`（`.cta-liquid` > `.cl-fill` + `.cl-txt` > `.cl-lab.cl-cur` / `.cl-lab.cl-nxt` + `.cl-arw`）
- Produces: ナビリンク `a.nav-roll[data-text]` > `span.rl-t`
- Produces: SP メニューリンク内の `span.mk`、タップで `data-hit` → 450ms 後に遷移
- Produces: `StickyCta` の `<a class="sticky-cta">` と回転 svg の `sticky-ring` クラス

- [ ] **Step 1: `Button.tsx` を置き換える**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "pill" | "block" | "line" | "liquid";
type Props = {
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  /** 左に白点（pill 用。liquid は常に持つ） */
  dot?: boolean;
  children: ReactNode;
};

const BASE = "inline-flex items-center justify-center gap-2 font-bold tracking-[.02em] transition-opacity hover:opacity-[.88] disabled:cursor-not-allowed disabled:opacity-35";
const VARIANTS: Record<Variant, string> = {
  pill: "rounded-pill bg-fg px-[22px] py-2.5 text-[13px] text-fg-invert",
  block: "w-full rounded-btn bg-fg px-[34px] py-[18px] text-[16px] text-fg-invert max-tab:text-[14px]",
  line: "rounded-pill border border-fg px-[22px] py-2.5 text-[13px] text-fg",
  liquid: "cta-liquid relative overflow-hidden rounded-pill bg-fg py-2.5 pl-[18px] pr-[34px] text-[13px] text-fg-invert hover:opacity-100",
};

/**
 * @example <Button href="/contact/" dot>お問い合わせ</Button>
 * @example <Button href="/contact/" variant="liquid">お問い合わせ</Button>  ← ヘッダー CTA（hover で白点が広がって緑に）
 * @example <Button type="submit" variant="block" disabled={busy}>送信する</Button>
 */
export default function Button({ href, type = "button", variant = "pill", disabled, className, dot = false, children }: Props) {
  const cls = cn(BASE, VARIANTS[variant], className);
  const inner =
    variant === "liquid" ? (
      <>
        <span aria-hidden className="cl-fill" />
        <span className="cl-txt">
          <span className="cl-lab cl-cur">{children}</span>
          <span className="cl-lab cl-nxt" aria-hidden>
            {children}
          </span>
        </span>
        <svg aria-hidden className="cl-arw" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
          <path d="M3 13 13 3M6 3h7v7" />
        </svg>
      </>
    ) : (
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

- [ ] **Step 2: `Header.tsx` のナビとCTA**

ナビの `Link` を:

```tsx
          <Link key={n.href} href={n.href} data-text={n.label} className="nav-roll text-nav text-fg">
            <span className="rl-t">{n.label}</span>
          </Link>
```

CTA を `<Button href="/contact/" variant="liquid">お問い合わせ</Button>` に（`dot` は外す）。

- [ ] **Step 3: `MobileNav.tsx` のリンクに帯とタップ演出**

`import { useRouter } from "next/navigation";` を追加し、コンポーネント冒頭で `const router = useRouter();`。NAV の `Link` を次に置き換える（`ref` / `key` / `href` はそのまま）:

```tsx
            <Link
              key={n.href}
              ref={i === 0 ? firstLink : undefined}
              href={n.href}
              onClick={(e) => {
                if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
                  setOpen(false);
                  return;
                }
                e.preventDefault();
                e.currentTarget.setAttribute("data-hit", "");
                window.setTimeout(() => {
                  setOpen(false);
                  router.push(n.href);
                }, 450);
              }}
              className="relative z-0 font-display text-[min(11.5vw,54px)] font-semibold leading-[1.05] tracking-[-.04em] text-fg"
            >
              {n.label}
              <span aria-hidden className="mk" />
            </Link>
```

- [ ] **Step 4: `StickyCta.tsx` にクラスを足す**

`<a …className={cn("fixed …` の先頭に `"sticky-cta "` を加え、回転する 2 つ目の `<svg …animate-[spin_18s_linear_infinite]>` のクラスに `sticky-ring` を追加する。

- [ ] **Step 5: `globals.css` に追記**（演出ブロック + keyframes）

```css
  /* ヘッダーナビのロール（spec §4-11） */
  .nav-roll {
    position: relative;
    display: inline-block;
    overflow: hidden;
    line-height: 1.5;
  }
  .nav-roll .rl-t {
    display: block;
    transition: transform var(--duration-fast) var(--ease-sym);
  }
  .nav-roll::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    color: var(--color-fg-muted);
    transform: translateY(100%);
    transition: transform 0.35s var(--ease-sym);
  }
  @media (hover: hover) {
    .nav-roll:hover .rl-t {
      transform: translateY(-100%);
    }
    .nav-roll:hover::after {
      transform: translateY(0);
    }
  }
  /* CTA の液体ホバー */
  .cta-liquid {
    transition: background-color 0.18s;
  }
  .cl-fill {
    position: absolute;
    top: calc(50% - 4px);
    left: 18px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-fg-invert);
    transform-origin: 50% 50%;
    transition: transform 0.6s var(--ease-out-quart);
    pointer-events: none;
  }
  .cl-txt {
    position: relative;
    z-index: 1;
    display: inline-flex;
    margin-left: 16px;
    overflow: hidden;
    transition: transform 0.5s var(--ease-out-quart);
  }
  .cl-lab {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    transition: transform 0.55s var(--ease-out-quart);
  }
  .cl-nxt {
    position: absolute;
    inset: 0;
    justify-content: center;
    transform: translateY(120%);
  }
  .cl-arw {
    position: absolute;
    top: 50%;
    right: 13px;
    width: 15px;
    height: 15px;
    opacity: 0;
    transform: translate(7px, -50%);
    transition:
      opacity 0.3s 0.14s,
      transform 0.45s var(--ease-out-quart) 0.14s;
  }
  @media (hover: hover) {
    .cta-liquid:hover {
      background-color: var(--color-marker);
      transition: background-color 0.12s 0.3s;
    }
    .cta-liquid:hover .cl-fill {
      background: var(--color-marker);
      transform: scale(56);
    }
    .cta-liquid:hover .cl-cur {
      transform: translateY(-120%);
    }
    .cta-liquid:hover .cl-nxt {
      transform: translateY(0);
    }
    .cta-liquid:hover .cl-txt {
      transform: translateX(-15px);
    }
    .cta-liquid:hover .cl-arw {
      opacity: 1;
      transform: translate(0, -50%);
    }
  }
  @media (hover: none) {
    .cta-liquid {
      transition: transform 0.25s;
    }
    .cta-liquid:active {
      transform: scale(0.97);
    }
  }
  /* SP メニューのリンク帯 */
  .mk {
    position: absolute;
    left: -3%;
    bottom: 7%;
    z-index: -1;
    width: 106%;
    height: 36%;
    background: var(--color-marker);
    transform: scaleX(0);
    transform-origin: left center;
  }
  a[data-hit] .mk {
    animation: sp-mk-swipe 0.45s var(--ease-mk) both;
  }
  /* 追従バッジ */
  .sticky-cta:hover {
    transform: scale(1.04);
  }
  .sticky-cta:hover .sticky-ring {
    animation-play-state: paused;
  }
```

```css
@keyframes sp-mk-swipe {
  to { transform: scaleX(1); }
}
```

- [ ] **Step 6: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'class="nav-roll' out/index.html | wc -l   # 4
grep -o 'cta-liquid' out/index.html | wc -l        # 1 以上
grep -o 'class="mk"' out/index.html | wc -l         # 4
```

Playwright（PC 1440）: `hover('.cta-liquid')` 0.8s 後に `.cl-fill` の `transform` が `matrix(56, …)`、`.cta-liquid` の `background-color` が `rgb(46, 137, 30)`、クリップ 340×64 のスクショ。`hover('.nav-roll')` で `.rl-t` の `transform` に `-` の translateY。SP 390: メニューを開いて COMPANY をタップ → `a[data-hit]` が付き、0.6s 後に `/company/` へ遷移（404 でよい）。追従バッジ hover で `transform` が `scale(1.04)`。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: ナビのロール・CTA の液体ホバー・SP メニューの帯・追従バッジの hover を追加"
```

---

### Task 12: カスタムカーソル（`CustomCursor`）

**Files:**
- Create: `src/components/motion/CustomCursor.tsx`
- Modify: `src/app/layout.tsx` `src/app/globals.css`

**Interfaces:**
- Produces: `CustomCursor()`（client、layout に 1 つ）。`#cur.cur` > `.cur-t`。`.work-row` / `#service-track > li` 上で `data-on`

- [ ] **Step 1: `CustomCursor.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";

const HOVER_TARGETS = ".work-row, #service-track > li";

/**
 * ポインタに追従する円カーソル。(hover:hover) and (pointer:fine) の環境だけ動き、WORKS の行と SERVICE カード上で開く。
 * @example <CustomCursor />（layout.tsx）
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onOver = (e: PointerEvent) => el.toggleAttribute("data-on", !!(e.target as Element).closest(HOVER_TARGETS));
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} id="cur" aria-hidden className="cur">
      <span className="cur-t">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <path d="M3 13 13 3M6 3h7v7" />
        </svg>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: `layout.tsx` の `<RevealObserver />` の直後に `<CustomCursor />`**（import を追加）

- [ ] **Step 3: `globals.css` に追記**

```css
  /* カスタムカーソル（spec §4-12） */
  .cur {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 80;
    pointer-events: none;
    will-change: transform;
  }
  .cur-t {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border: 1.5px solid var(--color-fg);
    border-radius: 50%;
    color: var(--color-fg);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity 0.22s,
      transform 0.3s var(--ease-out-quart);
  }
  .cur[data-on] .cur-t {
    opacity: 1;
    transform: scale(1);
  }
  .cur-t svg {
    width: 26px;
    height: 26px;
  }
  @media not ((hover: hover) and (pointer: fine)) {
    .cur {
      display: none;
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .work-row,
    .work-row *,
    #service-track > li,
    #service-track > li * {
      cursor: none;
    }
  }
```

- [ ] **Step 4: 確認**

```bash
npm run typecheck && npm run lint && npm test && npm run build
grep -o 'id="cur"' out/index.html | wc -l   # 1
```

Playwright（PC 1440、`hasTouch: false`）: `mouse.move` で `#cur` の `transform` が追従、`.work-row` 上で `#cur[data-on]`、外れると無し、`getComputedStyle(row).cursor` が `none`。`hasTouch: true` の SP コンテキストでは `#cur` の `display` が `none`。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "feat: WORKS / SERVICE 上のカスタムカーソルを追加"
```

---

### Task 13: ドキュメント更新（CLAUDE.md §2 / §4-3 / §7、README）

**Files:**
- Modify: `CLAUDE.md` `README.md`

- [ ] **Step 1: 置換スクリプトを scratchpad に保存して実行**（`assert` が落ちたら該当箇所を手で直し、その `rep` をコメントアウトして再実行。結果を報告する）

```python
import pathlib
p = pathlib.Path("CLAUDE.md")
s = p.read_text(encoding="utf-8")
def rep(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)

rep("GSAP + ScrollTrigger / Lenis（アニメーションはフェーズ③でまとめて実装）",
    "アニメーションは依存ゼロ（IntersectionObserver + rAF + Web Animations API）。GSAP はピン留めやスクラブのタイムラインが必要になった時点で導入する。Lenis は参考サイトも不使用のため導入しない")

rep("- **手書き風の大見出し**（COMPANY用）は Web フォントで再現不可。**SVGまたはWebPで入稿**します。テキストで代替しないこと。`alt` 属性に必ず同じ文言を入れてSEO・スクリーンリーダー対応。",
    "- **手書き風の大見出し**（VISION / COMPANY用）は Web フォントで再現不可。**SVG で入稿**し、`<path d>` を書き順どおりに `src/content/vision-handwriting.ts` へ写す（`Handwriting` が `pathLength=1` で線描画する）。テキストで代替しないこと。`aria-label` に必ず同じ文言を入れてSEO・スクリーンリーダー対応。")

rep("GSAP + ScrollTrigger を使用。**必ず `prefers-reduced-motion` を尊重すること。**",
    "依存ライブラリなし（IntersectionObserver + rAF + Web Animations API + CSS）。**必ず `prefers-reduced-motion` を尊重すること。** 初期の隠し状態は `html.js` 配下だけに適用し、JS 無効・クローラは常に可視にする。詳細は `docs/superpowers/specs/2026-09-01-phase3-animation-design.md`。")

rep("""| 演出 | 対象 | 実装 |
|---|---|---|
| 横マーキー | HOMEヒーロー | 3行、行ごとに速度差。透過PNGを不規則サイズで配置。シームレスループのため配列を2倍に複製 |
| スクロールリビール | 各セクション本文 | fade + translateY(24px)。stagger 0.08s |
| マーカー描画 | COMPANY本文のキーフレーズ | `background-size: 0% 100%` → `100% 100%`。左から右へ0.4s |
| コラージュ出現 | 実績・メンバー一覧 | 各行に紐づく画像が不規則位置からfade+scale。行ごとに順次発火 |
| 背景色遷移 | セクション境界 | ScrollTrigger で `--color-bg-dark` → `--color-bg` を補間 |
| ホバーロール | メンバー名・ナビ | 同一テキストを2つ重ね、`overflow:hidden` + `translateY` で入れ替え |""",
"""| 演出 | 対象 | 実装 |
|---|---|---|
| イントロ幕 | HOME 初回表示 | 黒幕 + ワードマークをマーキーのロゴセルに重ね、980ms（SP 1310ms）で消して `kv:launch` |
| 横マーキー | HOMEヒーロー | 3行、行ごとに速度差。JS 駆動（rAF）でセルを中央から pop、ドラッグ慣性。配列を2倍に複製 |
| 見出しの文字立ち上がり | 全 SectionHeading | 1 文字ずつ `.ch` に分割し skew 立ち上がり（0.68s、26ms/文字） |
| 背景色遷移 | VISION | `ScrollTheme` が rAF でセクション位置から `<html>` の `--color-*` を白→黒へ補間。0.5 超で `data-on-vision` |
| 手書き線描画 | VISION | `Handwriting` が `stroke-dashoffset 1→0` を書き順どおり（合計 1.6s） |
| 行フェード | VISION 本文 | PC は段落単位で行が順に、SP(≤640) は 1 行ずつ画面下 75% で点灯 |
| マーカー描画 | VISION 本文 | `MarkerLayer` が文字位置を計測し背後の線を `clip-path` で左→右（0.85s）。他セクションは `background-size` 方式 |
| 相関図 | VISION | リングをマスクで描画、ノードはぼかしから出現、点線は 80s で回転 |
| スクロールリビール | SERVICE / PARTNERS / FAQ / NEWS / CONTACT | `data-reveal="blur"`（SERVICE、奥から blur 解除）/ `"up"`（fade + 18px）。stagger 80ms |
| ホバー散布 | WORKS | 行ホバーでサムネ 5 枚が 3 パターンの配置で出現、他行は薄く。SP は画面中央の行がアクティブ |
| ホバーロール | WORKS の名前・ナビ | 同一テキストを2つ重ね、`overflow:hidden` + `translateY` で入れ替え |
| CTA の液体ホバー | ヘッダー CTA | 白点が `scale(56)` で広がり `--color-marker` に塗り替わる |
| カスタムカーソル | WORKS / SERVICE | `(hover:hover) and (pointer:fine)` のみ。円カーソルが追従し対象上で開く |""")

rep("**アニメーションは全ページのマークアップが完成してから、最後にまとめて実装します。**\n先に入れるとレイアウト変更のたびに発火位置の取り直しが発生します。",
    "**アニメーションはページのマークアップが完成してから実装します。**\n先に入れるとレイアウト変更のたびに発火位置の取り直しが発生します。フェーズ③は HOME のマークアップ完成後に HOME から着手し、下層ページはフェーズ②の移植後に同じ部品（`data-reveal` 契約）を適用します。")

p.write_text(s, encoding="utf-8")
print("CLAUDE.md updated")
```

- [ ] **Step 2: README に「演出」の節を追加**（`## 差し替えが必要なサンプル` の直前に挿入）

```markdown
## 演出（アニメーション）

依存ライブラリなし。`src/components/motion/` の 7 つの client 部品（`RevealObserver` / `ScrollTheme` / `Handwriting` / `MarkerLayer` / `IntroVeil` / `MarqueeDrag` / `CustomCursor`）と `globals.css` の CSS で動きます。

- 出現系は要素に `data-reveal="head|para|line|diagram|blur|up"` を付け、`RevealObserver` が画面に入ったとき `data-reveal="in"` に書き換えます（元の値は `data-reveal-kind`）。演出は CSS。
- 初期の隠し状態は `html.js` 配下だけ。JS 無効・クローラは常に可視です。
- `prefers-reduced-motion: reduce` では全演出が最終状態で静止し、イントロ幕も出ません。
- 手書き見出しは `src/content/vision-handwriting.ts` に SVG の `<path d>` を書き順どおりに写します。

```

- [ ] **Step 3: 確認とコミット**

```bash
grep -c 'ScrollTrigger' CLAUDE.md          # 0
grep -c 'kv:launch' CLAUDE.md               # 1
grep -c '## 演出' README.md                  # 1
git diff --stat                              # CLAUDE.md と README.md のみ
git add -A
git commit -m "docs: CLAUDE.md §2/§4-3/§7 と README を依存ゼロの演出方針に更新"
```

---

### Task 14: 最終検証

**Files:** なし（検証のみ）

- [ ] **Step 1: 全ゲート**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: テスト約 52 件、build green。`out/index.html` に `data-reveal=` が 40 以上。

- [ ] **Step 2: Playwright 検証（scratchpad、コミットしない）** — spec §8 の 14 項目を 1 スクリプトにまとめ、`npm run dev` に対して実行し、結果を JSON とスクショで残す。少なくとも次を数値で報告:

1. 背景補間: `#vision` 上端 500 / 300 / 100 / −200px と下端 400 / 250 / 150px の `--color-bg` と `data-on-vision`
2. 見出し: SERVICE `.ch` の `transform`（前後）、`aria-label`
3. 手書き: 2s 後の `stroke-dashoffset`、`vision:written` 受信
4. SP 行点灯: 0 / 300 / 600 / 900px での `.vlt[data-reveal="in"]` 数
5. マーカー: `.marker-line` 本数、`clip-path`、反転時の文字色、リサイズ後の再配置
6. 相関図: `vd-ringmask` offset、ノード opacity
7. 幕: 0.3s / 1.5s のスクショ、`kv:launch` 前後の `.ch`
8. マーキー: ドラッグ前後の `transform`、2.5s 後も変化、SP で縦スクロール可
9. SERVICE / stagger: opacity・filter・transform の前後
10. WORKS: PC hover のサムネ opacity・他行 0.05、SP の `data-active`
11. CTA / ナビ: `.cl-fill` scale、背景色、`.rl-t` transform
12. カーソル: `#cur[data-on]`、`cursor: none`、SP で非表示
13. reduced-motion: 全要素の最終状態、幕なし、2s 差の 2 枚が一致、背景の瞬時切替
14. キーボード: Tab でヘッダー → 本文の順、見出しの `aria-label`

- [ ] **Step 3: Lighthouse（同条件比較）**

```bash
npx serve out -l 3999 &
sleep 3
CHROME_PATH=/root/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome npx lighthouse http://localhost:3999/ --quiet --chrome-flags="--headless --no-sandbox" --output=json --output-path=/tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad/lh3.json
node -e "const d=require('/tmp/claude-0/-root-maskoff-web-maskoff-web/1ae076a8-c9ed-4410-9bf9-54f89ae58f17/scratchpad/lh3.json'); console.log(Object.fromEntries(Object.entries(d.categories).map(([k,v])=>[k,Math.round(v.score*100)])), 'benchmarkIndex', Math.round(d.environment.benchmarkIndex), 'LCP', d.audits['largest-contentful-paint'].displayValue, 'TBT', d.audits['total-blocking-time'].displayValue, 'JS', Math.round(d.audits['network-requests'].details.items.filter(r=>r.resourceType==='Script').reduce((a,r)=>a+(r.transferSize||0),0)/1024)+'KB')"
kill %1
```

Expected: Accessibility 100・CLS 0 維持、初期 JS 転送がフェーズ① 完了時（142KB）から **+8KB 以内**、Performance は `benchmarkIndex` が同程度なら悪化なし。LCP がフェーズ①（4.4s）から 0.5s 以上悪化していれば幕の時間を 700ms に下げて再計測。

- [ ] **Step 4: 残プロセスと git**

```bash
ss -ltnp | grep -E ':3000|:3999|:8787' || echo "ports free"
git status --short | wc -l   # 0
```

- [ ] **Step 5: 報告**

コントローラが `npm run dev` を起動したままにし、`http://localhost:3000/` と見どころ（初回の幕とマーキー、VISION の反転・スワイプ点灯・マーカー、WORKS のホバー、CTA）を案内する。iOS Safari 実機（慣性スクロール中の補間、`100svh`、`pointer` イベント）は引き継ぎ項目。

---

## Self-Review

**Spec coverage**

| spec | task |
|---|---|
| §2-1 原則（1 監視役 / rAF / WAAPI / html.js / reduced-motion） | Task 1（html.js・RevealObserver・reduced-motion 早期 return）、各 Task の CSS |
| §2-2 client 部品 7 つ | ScrollTheme 3 / RevealObserver 1 / Handwriting 5 / MarkerLayer 6 / IntroVeil 8 / MarqueeDrag 8 / CustomCursor 12 |
| §2-3 `data-reveal` 契約 | Task 1（OPTIONS / markRevealed）、2 / 4 / 7 / 9 で属性付与 |
| §2-4 `kv:launch` / `vision:written` | Task 8 / 5、RevealObserver と MarkerLayer が購読 |
| §3 VISION データ・マークアップ・手書き・相関図・マーカー | Task 4 / 5 / 7 / 6 |
| §4-1〜4-12 タイミング | Task 3 / 2 / 5 / 4 / 7 / 8 / 8 / 9 / 9 / 10 / 11 / 12 |
| §5 CSS とトークン | Task 1（トークン・up）、各 Task の globals 追記 |
| §6 変更ファイル・削除（SVG 2 点、gsap/lenis） | Task 5 / 7（削除）、Task 1（依存） |
| §7 テスト 6 ファイル | Task 1 / 2 / 3 / 5 / 6 / 8 |
| §8 ブラウザ検証 14 項目 | 各 Task の確認 + Task 14 |
| §9 ドキュメント | Task 13 |
| §10 完了基準（dev サーバー） | Task 14 |

**Placeholder scan:** 「TBD」「後で」「適切に」「同様に」なし。全コード step にコードあり。

**Type consistency:**
- `markRevealed` / `initActiveRows` は `RevealObserver.tsx` の named export。`data-reveal-kind` の値は初期値と同じ文字列（head/para/line/write/diagram/blur/up）。
- `revealDelay` / `cellPopDelay`（Task 1）を Task 8 / 9 / 10 で同名で使用。
- `Marquee` の DOM（`[data-marquee]` / `[data-row]` / `.mq-track` / `[data-cell]` / `[data-lead]`）を `MarqueeDrag` と `IntroVeil` が参照。
- `.vlt` の `--li` を `MarkerLayer` が読む。`.marker-target` は Task 4 で出力、Task 6 で計測。
- `Button` の `variant="liquid"` は Task 11 で定義し同 Task の Header で使用。
- `HOVER_TARGETS`（`.work-row, #service-track > li`）は Task 10 の `.work-row` と Task 9 の `#service-track` に一致。
