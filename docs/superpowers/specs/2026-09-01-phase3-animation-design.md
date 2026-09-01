# フェーズ③ アニメーション設計 — VISION のスクロール演出と全体の出現演出

- 日付: 2026-09-01
- ステータス: 承認済み（実装計画待ち）
- 対象: HOME（`/`）の全演出と共通シェル（ヘッダー・追従バッジ・SP メニュー）
- 前提: フェーズ①（HEAD 19d9156、`feature/make`）のマークアップが完成していること
- 参考: `docs/superpowers/specs/2026-08-31-home-apply-lp-design.md`（フェーズ①）、CLAUDE.md §7

---

## 1. 目的とスコープ

creator.dipsy.com/apply のスクロール・ホバー・初回表示の演出を、**依存ライブラリなし**（IntersectionObserver + requestAnimationFrame + Web Animations API + CSS）で再現する。ユーザーが最初に求めたのは VISION セクション（スワイプ時に本文が 1 行ずつ点灯する挙動を含む）で、確認の結果、参考サイトにある他の演出もすべて対象に含める。

### 対象の演出（承認済み）

| # | 演出 | 対象 |
|---|---|---|
| A | 背景の白→黒の連続補間（ヘッダー含むページ全体） | VISION |
| B | 見出し英字の 1 文字ずつ skew 立ち上がり | 全 SectionHeading |
| C | 手書き見出し SVG の書き順どおりの線描画 | VISION |
| D | 本文の行フェード（PC は段落単位、SP は 1 行ずつ点灯） | VISION |
| E | 蛍光ペン風マーカーの左→右描画（別レイヤー） | VISION |
| F | 相関図：リング描画 → ノード出現 → 常時回転 + 2 つの玉が周回しノード通過で脈動・波紋 | VISION |
| G | イントロ幕（黒幕 + ロゴ → マーキー起動） | HOME 初回表示 |
| H | マーキーのセル pop と JS 駆動 + ドラッグ | Hero |
| I | SERVICE カードの blur 出現 + バッジ pop | SERVICE |
| J | PARTNERS / FAQ / NEWS / CONTACT の stagger 出現 | 各セクション |
| K | WORKS 行ホバーでサムネ散布・名前ロール（PC）、SP は中央行アクティブ | WORKS |
| L | ヘッダーナビのロール、CTA の液体ホバー、SP メニューのリンク帯 | Header / MobileNav |
| M | カスタムカーソル（PC・ポインタ精細時のみ） | WORKS / SERVICE |
| N | 追従バッジの hover 拡大・回転停止 | StickyCta |

### 対象外
- Lenis 等のスムーススクロール（参考サイトも不使用。CLAUDE.md から除外する）
- 下層ページの演出（フェーズ②の移植後に同じ部品で適用する）
- 実データの手書き SVG・相関図の文言（サンプルのまま。差し替え規約は §3 に定義）

### 決定事項（ユーザー確認済み）
1. 対象は上表 A〜N すべて。見出しアニメは全セクション共通。
2. マーカーは参考サイトと同じ「レイヤー方式」（文字位置を計測し背後に線を置く）。
3. 駆動は依存ゼロ。GSAP / Lenis は `package.json` から外し、CLAUDE.md §2 / §7 を改訂する。
4. reduced-motion では背景反転も瞬時切替（補間しない）にする。
5. 手書き・相関図の SVG ファイルは廃止し、インライン化（単一情報源）。

---

## 2. 駆動層（アーキテクチャ）

### 2-1. 原則
- **1 つの監視役**：ページに `RevealObserver` を 1 つ置き、`[data-reveal]` を IntersectionObserver で監視して `data-reveal="in"` に書き換える。演出そのものは CSS（属性セレクタ）で行う。
- **スクロール量に連動する連続値**は `ScrollTheme` の rAF 補間のみ（背景反転）。
- **時間軸の演出**（線描画・慣性）は Web Animations API / rAF。
- client 部品は葉ノードのみ。Server Component で描画した DOM に属性・クラスを付けて動かす。
- JS 無効・クローラ対策：`<head>` の 1 行スクリプトで `<html class="js">` を付け、初期の `opacity:0` 等は `html.js` 配下だけに適用する。
- `prefers-reduced-motion: reduce` は CSS（最終状態を強制）と JS（監視・補間を行わず即最終状態）の両方で扱う。

### 2-2. 新規 client 部品（7 つ）

| ファイル | 役割 | 依存する純粋関数 |
|---|---|---|
| `src/components/motion/ScrollTheme.tsx` | `#vision` の矩形から進行度 t を計算し `<html>` の色変数を補間、`data-on-vision` 切替 | `scroll-theme-math.ts` |
| `src/components/motion/RevealObserver.tsx` | `[data-reveal]` の監視と `in` 付与。`kv:launch` を待ってから開始。SP/PC で監視対象を切替（`para` / `line`）。WORKS の `data-active` モード | `reveal-delay.ts` |
| `src/components/motion/Handwriting.tsx` | 手書き SVG のインライン描画と線描画 | `handwriting-timing.ts` |
| `src/components/motion/MarkerLayer.tsx` | `.marker-target` の計測と `span.marker-line` の生成・描画 | `marker-rects.ts` |
| `src/components/motion/IntroVeil.tsx` | 黒幕と `kv:launch` | — |
| `src/components/motion/MarqueeDrag.tsx` | マーキーの JS 駆動・セル pop・ドラッグ慣性 | `marquee-physics.ts` |
| `src/components/motion/CustomCursor.tsx` | ポインタ追従の円カーソル | — |

Server のまま拡張: `ui/SectionHeading.tsx`（文字分割）、`ui/Button.tsx`（`liquid` バリアント）、`layout/Header.tsx`（`data-text`）、`sections/VisionBlock.tsx`、`sections/ServiceGrid.tsx`、`sections/WorksList.tsx`、`sections/PartnerGrid.tsx`、`sections/NewsStrip.tsx`、`sections/FaqList.tsx`、`sections/ContactSection.tsx`、`sections/Hero.tsx`。新規 Server 部品: `motion/VisionDiagram.tsx`、`motion/SplitChars.tsx`（見出し文字分割の描画）。

### 2-3. `data-reveal` 契約

| 属性値 | 意味 | 監視 rootMargin / threshold |
|---|---|---|
| `data-reveal="head"` | 見出し。`.ch` の skew 立ち上がり | `0px 0px -8% 0px` / 0.08 |
| `data-reveal="para"` | VISION 段落（PC で監視） | `0px 0px -8% 0px` / 0.08 |
| `data-reveal="line"` | VISION 行（SP ≤640 で監視） | `0px 0px -25% 0px` / 0 |
| `data-reveal="write"` | 手書き SVG（Handwriting が自前で監視） | `0px 0px -25% 0px` / 0 |
| `data-reveal="diagram"` | 相関図 | `0px 0px -20% 0px` / 0.3 |
| `data-reveal="blur"` | SERVICE カード | `0px 0px -8% 0px` / 0.08 |
| `data-reveal="up"` | 汎用 fade + 上昇（PARTNERS / FAQ / NEWS 行 / CONTACT 要素） | `0px 0px -8% 0px` / 0.08 |
| `data-reveal-delay="n"` | 遅延インデックス（`--rd = n × 80ms`）。CSS では `style="--rd"` として Server が出力 | — |

`in` になった要素は `data-reveal="in"` に書き換える（元の値は `data-reveal-kind` に退避し、CSS は `[data-reveal-kind="blur"][data-reveal="in"]` で判定する）。一度 `in` になったら戻さない。

### 2-4. イベント
- `kv:launch`（document）: イントロ幕終了。`RevealObserver` はこれを受けてから監視開始（幕が無い場合は即時）。`MarqueeDrag` はこれで JS 駆動へ切替。
- `vision:written`（document）: 手書き描画完了。PC の VISION 段落 `para` はこれ以降にしか `in` にならない。`MarkerLayer` は再計測する。

---

## 3. VISION の設計

### 3-1. 本文データ `src/content/vision-copy.ts`（SAMPLE）
```ts
export type Segment = string | { marker: string };
export type VisionParagraph = Segment[][]; // 段落 = 行の配列、行 = セグメントの配列
export const VISION_COPY: VisionParagraph[];  // 現行 4 段落を文単位の行に分割、マーカー 3 箇所
```

### 3-2. マークアップ（Server: `VisionBlock`）
```html
<section id="vision" aria-labelledby="vision-title" class="section-pad">
  <div class="wrap">
    <SectionHeading en="VISION" ja="私たちの想い" id="vision-title" />   ← data-reveal="head"
    <div class="grid …">
      <div class="marker-block relative" data-marker-block>
        <div class="marker-block__layer absolute inset-0 pointer-events-none" aria-hidden></div>
        <Handwriting />                                    ← client、data-reveal="write"
        <p data-reveal="para" style="--rd:0">
          <span class="vln"><span class="vlt" data-reveal="line">…</span></span>
          <span class="vln"><span class="vlt" data-reveal="line">服は、…<span class="marker-target">引き出すためにある</span>。</span></span>
        </p>
        …
        <MarkerLayer />                                    ← client
      </div>
      <VisionDiagram />                                    ← Server、data-reveal="diagram"
    </div>
  </div>
  <ScrollTheme />                                          ← client
</section>
```
- `.vln`: PC `display:block`（文ごとに 1 行）、≤640 `display:inline`。
- `.vlt`: `html.js` 配下で初期 `opacity:0`。

### 3-3. 手書き `src/content/vision-handwriting.ts`（SAMPLE）
```ts
export const HANDWRITING = { viewBox: "0 0 640 160", label: "仮面を外して、素の自分で。", strokes: [{ d: string; width?: number }] };
```
`Handwriting` は `<svg role="img" aria-label>` に `<path pathLength="1" class="write-stroke" stroke="currentColor" …>` を出力。差し替え規約: デザイナー入稿の SVG から `<path d>` を順番どおり写す（書き順 = 配列順）。`public/images/company/vision-handwriting.svg` は削除。

### 3-4. 相関図 `motion/VisionDiagram.tsx`（Server）
インライン SVG。`circle.vd-ring`（点線、`transform-box: fill-box`、80s 回転）、`circle.vd-ringmask`（実線、`pathLength="1"`、描画用）、`g.vd-node`×5（`style="--ni:n"`、塗り `var(--color-surface)`、線 `var(--color-border)`、文字 `currentColor`）、キャプション。`public/images/company/vision-diagram.svg` は削除。

### 3-5. マーカー（`MarkerLayer`）
- 計測: 各 `.marker-target` の `getClientRects()` → `mergeLineRects()` で行ごとに 1 矩形。`.marker-block` 相対座標。
- 生成: `span.marker-line`（`left/top/width/height`、`height = 行高 × 0.78`、`top += 行高 × 0.16`、左右 `0.18em` 拡張、`transform: rotate(θ) scaleY(1.04)`、`transform-origin: left center`、θ は `[-0.7, 0.35, -0.4]` を順繰り、`clip-path: inset(0 100% 0 0)`）。
- 色: 通常 `color-mix(in srgb, var(--color-marker) 50%, transparent)`。`html[data-on-vision]` では `var(--color-marker)` 不透明 + `.marker-target { color: var(--color-bg-dark) }`。
- 描画: `clip-path → inset(0)`、0.85s、`cubic-bezier(.65,0,.35,1)`。トリガー: PC = 親段落 `in` から「行の遅延 + 300ms」後、SP = 該当行 `in` の 520ms 後。同一対象が複数行なら 1 本ずつ +150ms。
- 再計測: `ResizeObserver(.marker-block)` と `vision:written`。描画済みの線は `inset(0)` を維持。
- 既存の `@utility marker`（`background-size` 方式）は他セクション用に残す。VISION では `Marker` 部品を使わない。

---

## 4. 演出のタイミング仕様

すべて `tokens.css` の `@theme` に置く（`--duration-*` / `--ease-*` / `--delay-*`）。

### 4-1. 背景補間（A）
- `t = min(tIn, tOut)`、`vh = innerHeight`、`rect = #vision.getBoundingClientRect()`
  - `tIn = clamp((0.45·vh − rect.top) / (0.40·vh), 0, 1)`
  - `tOut = clamp((rect.bottom − 0.20·vh) / (0.25·vh), 0, 1)`
- 線形補間（sRGB）で `<html>` のインラインに設定: `--color-bg / --color-fg / --color-fg-body / --color-fg-muted / --color-surface / --color-border / --color-fg-invert`

| 変数 | 明 | 暗 |
|---|---|---|
| bg | #FFFFFF | #0A0A0A |
| fg | #0A0A0A | #F2F2F0 |
| fg-body | #444444 | #C6C6C3 |
| fg-muted | #6B6B68 | #9A9A97 |
| surface | #F9F9F9 | #151514 |
| border | #E4E4E1 | #2C2C2A |
| fg-invert | #FFFFFF | #0A0A0A |

- `t > 0.5` で `<html data-on-vision>`。`#vision` が画面 ±1 画面の外なら計算しない。`t = 0` に戻ったらインライン変数を削除する。
- reduced-motion: 補間せず `t > 0.5` で瞬時切替。

### 4-2. 見出し（B）
- Server が `en` を `SplitChars` で `<span class="ch-clip"><span class="ch" style="--ci:n" aria-hidden>X</span></span>` に分割（空白は `white-space: pre` の span、`\n` は既存の `<br class="hidden max-sp:inline">`）。見出し要素に `aria-label={en}`。
- `[data-reveal="in"] .ch`: `sec-en-skew-rise` 0.68s `cubic-bezier(.22,1,.36,1)`、遅延 `50ms + 26ms × --ci`（`translateY(118%) skewY(6deg) scaleY(1.05)` → 62% `translateY(-2.5%) skewY(-1.6deg)` → none）。初期は `translateY(115%)`（`.ch-clip` が `overflow:hidden`）。
- 和文: 初期 `opacity 0; translateY(12px)` → `in` で 0.55s、遅延 0.28s。

### 4-3. 手書き（C）
- `strokeSchedule(lengths, total = 1600, gap = 40, min = 80)`: 各線の `getTotalLength()` 比で時間配分、最短 80ms、線間 40ms。
- `path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" })`。
- 完了で `vision:written`。reduced-motion: `stroke-dashoffset: 0` を即設定し `vision:written` を即発火。

### 4-4. 本文の行（D）
- PC（>640）: `p[data-reveal="para"]` が交差 **かつ** `vision:written` 済みで `in`。`.vlt` は opacity 0.8s、遅延 `50ms + 70ms × 行index`（`style="--li:n"`）。
- SP（≤640）: `.vlt[data-reveal="line"]` を個別監視、`in` で opacity 0.5s、遅延なし。手書き完了は待たない。
- 段落 `in` は配下の行にも `in` を付ける（PC で行属性が残っていても矛盾しない）。

### 4-5. 相関図（F）
- `in` 後: `vd-ringmask` `stroke-dashoffset 1 → 0` 1.5s `cubic-bezier(.65,0,.35,1)` 遅延 0.9s。ノード `opacity 0 / scale(.25) / blur(12px)` → 1、opacity 0.6s・transform 0.85s `.22,1,.36,1`・filter 0.95s、遅延 `0.38s + 0.12s × --ni`。キャプション 0.8s。`vd-ring` 80s linear 無限回転（reduced-motion で停止）。
- 玉（`vd-sat` ×2、r 5.5、`currentColor`）: 3 ノードはリング上に 120° 間隔（上 / 30° / 150°）で置く。`[data-reveal-kind="diagram"]` で `vd-orbit`（リング中心を `transform-origin`、`transform-box: view-box`）18s linear 無限、2 つ目は `animation-delay: −9s`・opacity .55。出現後 2.4s / 2.8s でフェードイン。ノードの後ろを通る（DOM 順で先）。
- 通過アクション（参考サイトの `vd-ripple` / `vd-pulse`）: 各ノードは `--t0`（0s / 6s / 12s）を持ち、`.vd-pulse`（ノード本体のラッパ）が 18s 周期で `t0` と `t0+9s` に `scale(1.07)` へ膨らんで戻る。波紋 `circle.vd-ripple`（stroke `var(--color-border)` 1.5、fill なし）を 2 つ置き、18s 周期の最初の 1.5s（8.33%）で opacity .85 → 0・scale 1 → 2.1、遅延 `t0` / `t0+9s`。軌道・脈動・波紋は同じ瞬間（出現時）に始めて位相を揃える。
- reduced-motion: 玉と波紋は `display: none`、脈動なし。

### 4-6. イントロ幕（G）
- `IntroVeil`（client）: マウント時に `<html data-intro>`。幕 `fixed inset-0 z-[100]`（背景は components 層の `.intro-veil { background: var(--color-bg-dark) }`）+ 画面中央にロゴ箱 `.veil-logo`（マーキーのロゴセルと同じ構成: 黒角丸 `bg-fg` + `p-[12%]` + `/images/logo-wordmark.png`。大きさはロゴセル内の箱と同じ = セル幅 × 62%（PC `calc(var(--spacing-mq-cell) * 0.62)` / ≤600 `calc(max(160px, (100svh - 176px) / 3) * 0.62)`、拡大しない — 参考サイトと同じ）。黒幕上では箱が見えずロゴだけが見える）。ロゴは 0.1s 後に 0.35s（`--ease-mk`）で fade + scale .96→1 で現れる。位置は画面中央で計測しない。
- 900ms（≤640 は 1100ms）後（`done`）: `.veil-logo` と `[data-lead] [data-lead-box]`（マーキーのロゴセル内の箱。`MarqueeDrag` がマウント時に中央へ寄せ、`kv:launch` までは静止）の rect を計測し、中心差 `dx/dy` と `scale = 目標幅 / 現在幅` を WAAPI で 0.5s `cubic-bezier(.22,1,.36,1)` `fill: forwards` で適用（FLIP）。同時に幕（黒背景）を WAAPI の `clip-path: inset(0 round 0)` → `inset(ロゴセル箱の矩形 round 22%)` で同じ 0.5s・同じ ease で縮める（黒がロゴに集まり、そのままロゴセルの黒い箱になる — 参考サイトと同じ。背景はフェードさせない）。
- 着地（`onfinish`、保険で 0.7s のタイマー）: ロゴセルに `data-boing`（`lead-boing` 0.52s `cubic-bezier(.3,.6,.4,1)`）、`data-intro` 除去、`kv:launch` 発火、幕をアンマウント。ロゴセルは `[data-js]` 中 `opacity: 0` で隠し、`data-go`（launch）で表示する（二重に見えない）。
- スキップ条件: reduced-motion（CSS でも `display:none`）、`navigator.connection?.saveData`、`html.js` でない。スキップ時も `kv:launch` は即発火する。
- 幕表示中はスクロール可能なまま（スクロールジャック禁止）。HOME を開くたびに毎回表示する（ブラウザに状態を保存しない — CLAUDE.md §12）。
- 注意（カスケード層）: マーキーの CSS アニメーションは utilities の `animate-*` ではなく components 層の `.mq-track { animation: drift … }` / `[data-reverse] .mq-track { animation-name: drift-rev }` で定義する。utilities 層だと `[data-marquee][data-js] .mq-track { animation: none }` が負けて JS 駆動（中央寄せ・ドラッグ）が描画に反映されない。

### 4-7. マーキー（H）
- `kv:launch` 以降 `.mqs[data-js]`: `.mq-row { animation: none }`、rAF で `translateX(x)`。基準速度 `v0 = half / duration`（`half` = 1 周分の幅、`duration` は行の `--d`）、逆方向行は負。
- セル pop: `--ed = |中央からの距離| / セル幅 × 35ms`（`cellPopDelay`）、`cell-pop` 0.45s `cubic-bezier(.34,1.56,.64,1)`。ロゴセルは `--ed: 0`。
- ドラッグ: `pointerdown` → `data-dragging`、`pointermove` の Δx を、触れた行には +Δx、進行方向が逆の行には −Δx として加算（例: 中段を左へスワイプすると上下段は右へ動く — 参考サイトと同じ）、`pointerup` で直前速度を `[-900, 900]` px/s にクランプし同じ符号で慣性、1.2s で `v0` へ指数減衰（`advance(x, v, dt, half, v0)`）。`touch-action: pan-y`。`setPointerCapture`。
- 画面外（IO threshold 0.3 で不可視）では rAF 停止。reduced-motion: JS 駆動しない（CSS 停止のまま静止）、ドラッグ無効。

### 4-8. SERVICE（I）
- `.svf[data-reveal-kind="blur"]`: 初期 `opacity 0; filter: blur(14px); transform: translateZ(-420px)`（親 `ul` に `perspective: 1200px`）。`in` で transform 0.9s `.22,1,.36,1`・opacity 0.55s・filter 0.95s（+0.1s）、遅延 `--rd`。≤820 は blur なし、≤600 は fade + `translateY(14px)`。
- バッジ: `in` の `--rd × 3 + 0.3s` 後に `badge-pop` 0.55s（scale .4 → 1）。

### 4-9. 汎用 stagger（J）
- `[data-reveal-kind="up"]`: 初期 `opacity 0; translateY(18px)`（FAQ カードは 16px）→ `in` で opacity 0.55s ease / transform 0.55s `.22,1,.36,1`（FAQ は 0.8s）、遅延 `--rd`。
- 適用: PARTNERS カード（index）、FAQ カード（index）、NEWS / NOTICE の行（index）、CONTACT のリード・StepFlow・フォームカード（0 / 1 / 2）。

### 4-10. WORKS（K）
- PC（`hover:hover and pointer:fine`）: `.work-list:hover .work-row { opacity: .05 }`、hover 行 1（0.3s）。サムネ `.work-sc`（L 240 / M 184 / S 152 / M2 168 / S2 126px、`aspect-ratio:1`、r4、`Picture` で `works.ts` の `thumbs[0..4]`）は初期 `opacity 0; translateY(26px) scale(.94)`、hover で 1 / none（opacity 0.3s、transform 0.9s `.22,1,.36,1`、遅延 L 0 / M 70 / M2 100 / S 130 / S2 160ms）、その後 `crlBreath`（`translateY(-4px)` alternate、L 4.5s / M 5.2s / S 3.8s / M2 4.9s / S2 4.1s）。ロゴ `scale(1.07)`。名前は `.nm-a/.nm-b` の 2 段重ねで `translateY(-100%)`（0.55s `.65,0,.35,1`）。
- 配置パターン `data-pat="p0|p1|p2"`（行 index % 3）:
  - p1: L `bottom: calc(100% + 8px); right: 5%` / M `top: calc(100% + 12px); left: 24%` / S `bottom: calc(100% + 40px); left: 12%` / M2 `top: calc(100% + 34px); right: 20%` / S2 `bottom: calc(100% + 14px); left: 40%`
  - p2: L `bottom: calc(100% + 8px); left: 14%` / M `top: calc(100% + 12px); right: 7%` / S `bottom: calc(100% + 40px); right: 27%` / M2 `top: calc(100% + 30px); left: 36%` / S2 `bottom: calc(100% + 16px); right: 5%`
  - p0: L `top: calc(100% + 6px); right: 24%` / M `bottom: calc(100% + 16px); left: 12%` / S `bottom: calc(100% + 42px); right: 5%` / M2 `top: calc(100% + 26px); left: 14%` / S2 `bottom: calc(100% + 10px); left: 46%`
- SP（≤820）: `RevealObserver` の `data-active` モード（`rootMargin: -40% 0px -40% 0px`）で画面中央の行に `data-active`。`.work-list[data-live] .work-row { opacity: .05 }`、active 行 1（0.45s）。active 行のサムネ: L `inset: auto -4% calc(100% + 14px) auto; width: min(34vw,136px)` / S2 `inset: auto auto calc(100% + 128px) 2%; width: min(18vw,72px)` / M `inset: calc(100% + 22px) auto auto -4%; width: min(31vw,124px)` / S `inset: auto auto calc(100% + 70px) 30%; width: min(24vw,96px)` / M2 `inset: calc(100% + 74px) 2% auto auto; width: min(28vw,112px)`、遅延 S2 60 / M 90 / S 130 / M2 170ms。見出し下余白 240px、行間 64px。行タップ: 非 active なら `scrollIntoView({block:"center"})`、active なら `url` へ。
- reduced-motion: 呼吸・移動なし、opacity 0.2s のみ。

### 4-11. ヘッダー・CTA・SP メニュー（L）
- ナビ: `<a data-text="COMPANY"><span class="rl-t">COMPANY</span></a>`、`a { overflow:hidden; position:relative }`、`a::after { content: attr(data-text); position:absolute; inset:0; transform: translateY(100%); color: var(--color-fg-muted) }`、hover で `.rl-t` `translateY(-100%)`・`::after` `translateY(0)`、0.3s `cubic-bezier(.65,0,.35,1)`。
- CTA `Button variant="liquid"`: `relative overflow-hidden`、`.cl-fill`（8px 白丸、`left:18px`）が hover で `scale(56)` 0.6s `.22,1,.36,1` → 背景 `var(--color-marker)`（0.12s、遅延 0.3s）。ラベル 2 段重ね `.cl-cur`（`translateY(-120%)`）/ `.cl-nxt`（`translateY(120%) → 0`）0.55s、テキストは `translateX(-15px)`、矢印 `.cl-arw`（右 13px、`translateX(7px)` → 0、opacity 0.3s 遅延 0.14s）。塗り後の文字色 `var(--color-fg-invert)`。`hover:none` では `:active { scale(.97) }`。reduced-motion: 塗り・ロールなし（opacity .85 のみ）。
- SP メニュー: リンクタップで `.mk`（幅 106%、高さ 36%、下 7%、`--color-marker`）を `scaleX(0 → 1)` 0.45s `cubic-bezier(.6,0,.2,1)` → 遷移。
- 追従バッジ（N）: hover `scale(1.04)`、`animation-play-state: paused`。

### 4-12. カスタムカーソル（M）
- `@media (hover:hover) and (pointer:fine)` のみ描画。`#cur`（`fixed; top:0; left:0; pointer-events:none; z-[80]`）、内側 `#cur-t`（72px、線 1.5px `var(--color-fg)`、円、矢印 SVG 26px、初期 `opacity 0; scale(.5)`）。`pointermove` を rAF で追従（lerp 0.2）。`.work-row` / `.svf` 上で `data-on`（scale 1・opacity 1、0.3s `.22,1,.36,1`）。対象は `cursor: none`。reduced-motion: 非表示。

---

## 5. CSS の置き場所とトークン
- `src/app/globals.css` に `@layer components` として「reveal（head/blur/up）」「vision（vln/vlt/marker-line/write-stroke/vd-*）」「marquee（js 駆動・cell-pop・lead-boing）」「works（work-sc・pat・sp-active）」「nav-roll / cta-liquid / sp-menu mk」「cursor」「intro-veil」を追加。各ブロックは `html.js` ガードと `prefers-reduced-motion` の最終状態を持つ。
- `tokens.css` `@theme` に追加: `--duration-reveal-fast: 550ms; --duration-reveal: 800ms; --duration-reveal-slow: 900ms; --duration-write: 1600ms; --duration-marker-draw: 850ms; --delay-reveal-step: 80ms; --ease-pop: cubic-bezier(.34,1.56,.64,1); --ease-boing: cubic-bezier(.3,.6,.4,1); --ease-mk: cubic-bezier(.6,0,.2,1)`。暗色パレットは `--color-dark-*`（bg/fg/fg-body/fg-muted/surface/border）として定義し `scroll-theme-math` から参照（JS 側は `getComputedStyle` で読む）。

---

## 6. 変更するファイル（概要）

| 区分 | ファイル |
|---|---|
| 新規 client | `motion/{ScrollTheme,RevealObserver,Handwriting,MarkerLayer,IntroVeil,MarqueeDrag,CustomCursor}.tsx` |
| 新規 Server | `motion/VisionDiagram.tsx`、`motion/SplitChars.tsx` |
| 新規 葉モジュール（テスト対象） | `motion/{scroll-theme-math,split-chars,marker-rects,handwriting-timing,marquee-physics,reveal-delay}.ts` |
| 新規 データ | `content/vision-copy.ts`、`content/vision-handwriting.ts` |
| 変更 | `ui/SectionHeading.tsx`、`ui/Button.tsx`、`layout/{Header,MobileNav,StickyCta}.tsx`、`sections/{Hero,VisionBlock,ServiceGrid,WorksList,PartnerGrid,NewsStrip,FaqList,ContactSection}.tsx`、`motion/Marquee.tsx`（`data-js` 対応・`--ed` 出力・ロゴセル id）、`app/layout.tsx`（`html.js` スクリプト、`RevealObserver`・`CustomCursor` の配置）、`app/page.tsx`（`IntroVeil`）、`app/globals.css`、`styles/tokens.css`、`lib/works.ts`（`thumbs` は既存） |
| 削除 | `public/images/company/vision-handwriting.svg`、`public/images/company/vision-diagram.svg`、`package.json` の `gsap` / `lenis` |
| 文書 | `CLAUDE.md` §2 / §4-3 / §7、`README.md`（演出の節） |

---

## 7. テスト（node:test、葉モジュール）

| ファイル | 内容 |
|---|---|
| `motion/scroll-theme-math.test.ts` | `progress()`: 上端 400px → 0、100px → ≥0.8、下端 300px → 0.4〜0.6、210px → ≤0.2（vh 900）、クランプ。`mix()`: 白→黒の中点 `#858585`。`isOn(t)`: 0.5 境界 |
| `motion/split-chars.test.ts` | 文字ごとの `--ci` 連番、空白保持、`\n` 位置の返却、サロゲートペア非分割 |
| `motion/marker-rects.test.ts` | 同一行の複数矩形統合（`lineHeight × 0.5` 以内を同一行）、相対座標、高さ 0.78・Y 0.16・左右 0.18em |
| `motion/handwriting-timing.test.ts` | 長さ比例配分、最短 80ms、遅延の累積、合計 ≈ 1600 + gap |
| `motion/marquee-physics.test.ts` | `advance()`: 剰余（`half`）、クランプ ±900、1.2s で `v0` へ収束、逆方向行の符号 |
| `motion/reveal-delay.test.ts` | `revealDelay(n) = n × 80ms`、`cellPopDelay(distance, cellWidth)` |

既存 26 件 + 約 24 件。

---

## 8. ブラウザ検証（scratchpad の Playwright、コミットしない）

1. **背景補間**（PC 1440）: `#vision` 上端を 500 / 300 / 100 / −200px、下端を 400 / 250 / 150px に置き、`--color-bg` と `data-on-vision` を記録。単調に暗→明。ヘッダー反転のスクショ。
2. **見出し**: SERVICE の `.ch` が `in` 前は `translateY` あり、後は none。`aria-label` 全文、`.ch` は `aria-hidden`。
3. **手書き**: `in` 後 2s で全 `write-stroke` の `stroke-dashoffset` 0、`vision:written` 受信。
4. **行点灯（SP 390）**: VISION 上端から 0 / 300 / 600 / 900px と進め、`.vlt[data-reveal="in"]` が単調増加、画面下 25% より下は未点灯。
5. **マーカー**: `.marker-line` 本数 = 3 対象の視覚行数、`clip-path` が `inset(0px)`、`data-on-vision` 時の文字色 `#0A0A0A`、390 → 768 リサイズで再配置。
6. **相関図**: `in` 後 3s で `vd-ringmask` offset 0、ノード opacity 1。
7. **幕**: 0.3s で黒幕 + ロゴ、1.2s（SP 1.6s）後に消え `kv:launch`。幕中に `.ch` は未発火、幕後に発火。
8. **マーキー**: `kv:launch` 後にセルが順に可視。`mouse.down/move(−300px)/up` で行が移動、離した 2s 後に元の速度へ戻る。`touch-action` で縦スクロールが効く（SP で `touchscreen.tap` 後に scroll）。
9. **SERVICE / stagger**: `in` 前後で opacity・filter・transform が仕様値。
10. **WORKS**: PC hover で `.work-sc` 5 枚 opacity 1・他行 0.05・名前ロール；SP で中央行だけ `data-active`、タップで中央へ。
11. **CTA / ナビ**: hover で `.cl-fill` scale 56・背景 `--color-marker`；ナビ `.rl-t` `translateY(-100%)`。
12. **カーソル**: `.work-row` 上で `#cur[data-on]`、`cursor: none`。`hasTouch` コンテキストでは非表示。
13. **reduced-motion**: 読み込み直後に全要素が最終状態、幕なし、2s 差の 2 枚が一致、背景は 0.5 で瞬時切替。
14. **Lighthouse**（同条件・`benchmarkIndex` 併記）: 初期 JS 増分 **≤ 8KB gz**、Accessibility 100 維持、CLS 0 維持、Performance は同条件比で悪化なし。

---

## 9. ドキュメント変更（CLAUDE.md §14-5）
- §2: 「GSAP + ScrollTrigger / Lenis（…）」→「アニメーションは依存ゼロ（IntersectionObserver + rAF + Web Animations API）。GSAP はピン留めやスクラブのタイムラインが必要になった時点で導入。Lenis は参考サイトも不使用のため導入しない」
- §4-3: 手書き見出しは「SVG の `<path d>` を `src/content/vision-handwriting.ts` に書き順どおり写す」に改訂
- §7: 冒頭を依存ゼロに。表を本 spec の A〜N に置換（マーカーはレイヤー方式、背景遷移は rAF 補間、コラージュは WORKS ホバー / SP アクティブ行）。「実装順序」に「フェーズ③は HOME から着手、下層ページはフェーズ②の移植後に同じ部品を適用」を追記
- `package.json`: `gsap` / `lenis` を除去（`npm install` で lock 更新）
- README: 「演出」の節を追加（依存ゼロ、reduced-motion、`data-reveal` 契約）

---

## 10. 完了基準
1. `npm run typecheck && npm run lint && npm test && npm run build` green（テスト約 50 件）
2. §8 の 14 項目を PC / SP / reduced-motion で実施し、スクショと数値を報告
3. `git diff --stat` に想定外のファイルがない
4. **dev サーバーを起動したまま `http://localhost:3000` で確認できる状態で報告**（見どころ: 初回の幕とマーキー、VISION の反転とスワイプ点灯、WORKS のホバー、CTA）
5. iOS Safari 実機は引き継ぎ（慣性スクロール中の rAF 補間、`100svh`、`pointer` イベント）

---

## 11. リスク
| リスク | 対応 |
|---|---|
| Web Animations API の `strokeDashoffset` が Safari で数値補間されない | 単位付き文字列 `"1"`/`"0"` ではなく `pathLength="1"` + 数値キーフレームで検証。不可なら CSS transition + `requestAnimationFrame` 遅延に切替 |
| `clip-path` アニメの Safari 挙動 | `inset()` は Safari 対応済み。念のため `-webkit-clip-path` 併記 |
| マーカー計測とフォントスワップのずれ | `vision:written` と `ResizeObserver` で再計測、`display:optional` のためスワップ自体は初回に起きない |
| 幕の 1s がクローラ・LCP に影響 | 幕は `html.js` 配下のみ、LCP 要素（ヒーロー画像）は幕の下で描画済み。Lighthouse で LCP が悪化すれば幕の時間を 700ms に短縮 |
| WORKS の hover でサムネ画像が遅延読込され初回に空白 | サムネは `loading="lazy"` のままだが hover 対象の行が画面内なら既に読込済み。SP は active 行の切替で読込 |
