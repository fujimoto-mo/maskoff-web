# CLAUDE.md — 株式会社MasKOFF コーポレートサイト

このファイルはプロジェクトの憲法です。以下の内容と矛盾するコードは書かないでください。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| クライアント | 株式会社MasKOFF |
| 事業 | アパレル企画・製造販売 / アーティスト活動支援 / ホームページ制作 |
| 目的 | 現行サイト（STUDIO製）からのリニューアル |
| ページ数 | 7ページ（HOME / COMPANY / SERVICE / NEWS / NOTICE / CONTACT / RECRUIT） |
| デザイン方向 | 参考サイトのトーンを踏襲したモノクロ＋緑1色のエディトリアル |
| 主要KPI | 問い合わせ数、採用応募数 |

**重要：このサイトは制作会社の自社サイトです。** PageSpeed スコアと表示品質そのものが営業資料になります。パフォーマンスを犠牲にする実装は採用しないでください。

---

## 2. 技術スタック

```
Next.js 16 (App Router) / TypeScript (strict)
  └ output: "export"（静的エクスポート）
Tailwind CSS v4（CSS-first / @theme）
microCMS Hobby（ヘッドレスCMS / API上限5本 / SDK は使わず生 fetch）
アニメーションは依存ゼロ（IntersectionObserver + rAF + Web Animations API）。GSAP はピン留めやスクラブのタイムラインが必要になった時点で導入する。Lenis は参考サイトも不使用のため導入しない
Resend（メール送信）
Cloudflare Workers（ホスティング）
  ├ Static Assets（out/ を無課金で配信）
  ├ worker/index.ts（/api/* のみ実行）
  ├ KV（レート制限）
  └ Turnstile（Bot対策）
GitHub Actions（CI / デプロイ）
sharp（ビルド時の画像最適化）

Node.js 24.17.0（.node-version で固定）
```

**注意: ローカルの Node 24 で動くコードが Worker で動くとは限らない。**
`worker/` 配下は Node ではなく workerd 上で実行される。`nodejs_compat`
フラグで一部の Node API が使えるが、あくまで互換レイヤーで全部ではない。
Worker のコードは Web 標準 API（fetch / crypto.subtle / TextEncoder）で書く。

### この構成で必ず守ること

**1. API Routes を作らない。**
静的エクスポートでは `src/app/api/` が動かない。サーバー側の処理は
すべて `worker/` に書き、`worker/index.ts` でルーティングする。

**1-b. `wrangler.toml` の `run_worker_first = ["/api/*"]` を消さない。**
この1行で、静的アセットが Worker を通らず無課金で配信される。
消すと全リクエストが課金対象になり、無料枠を即座に超える。

**2. `next/image` を使わない。**
最適化サーバーが動かない。代わりに `components/ui/Picture.tsx` を使う。
`scripts/optimize-images.mjs` がビルド前に AVIF / WebP を生成し、
`src/lib/images/manifest.json` に width / height を書き出す。
**`Picture` はマニフェストから width / height を常に `<img>` に出力する**（呼び出し側は渡さない）。SVG だけはマニフェストに載らないため `width` / `height` props が必須。省くと CLS が悪化する。

**3. microCMS の API は5本まで。**
`news` / `notice` / `members` / `faq` / `jobs` の5本で確定。
追加が必要になったら新規APIを作らず、既存APIに `type` フィールドを足して統合する。

**4. 画像を microCMS から直接配信しない。**
Hobby プランは転送量が月20GBを超えると API が停止する。
画像はビルド時に取得して `public/` へ同梱し、Cloudflare から配信する。

**5. 動的ルートには `generateStaticParams` を必ず実装する。**
静的エクスポートでは必須。無いとビルドが落ちる。

**6. リダイレクトは `public/_redirects` に書く。**
静的エクスポートでは `next.config.ts` の `redirects()` が効かない。

**7. フォームの検証ルールは `src/lib/schema/contact.ts` の zod スキーマだけに書く。**
`worker/contact.ts` はこのスキーマを import して `safeParse` する。Worker 側に手書きの
検証を足さない。二重管理にすると開発者ツールから入力制限を回避できてしまう。

追加ライブラリを入れる前に必ず確認を取ること。UIライブラリ（MUI, Chakra,
shadcn/ui 等）は使わない。全て Tailwind で書く。

## 3. 絶対に守るルール

AIが無意識に破りやすい項目です。コードを書く前に毎回読み返してください。

### 3-1. コンテナに max-width を設定しない

```css
/* ❌ 絶対に書かない */
.container { max-width: 1200px; margin: 0 auto; }

/* ✅ 正しい */
.container { padding-inline: var(--pad-x); }
```

このデザインは**フルブリード**です。画面幅がいくら広くても中央に寄せません。左右パディングのみで制御します。

- PC: `32px`
- SP: `20px`

`mx-auto` `max-w-screen-xl` `container` クラスは使用禁止です。

### 3-2. セクションごとにガター幅が異なる

統一しないでください。実測値です。

| セクション | 列数(PC) | ガター |
|---|---|---|
| SERVICE | 3 | **列 clamp(28px,4vw,56px) / 行 clamp(48px,6vw,72px)** |
| FAQ | 3 | **18px** |
| 実績・パートナー | 4 | **18px** |

SERVICEだけガターが広いのは、カードに背景色がないため間隔で区切りを作っているからです。勝手に揃えないこと。

### 3-3. 色はトークン以外を使わない

`globals.css` の `@theme` に定義した変数のみ使用します。`text-gray-500` `bg-slate-900` などTailwindのデフォルトパレットは**使用禁止**です。

### 3-4. ブレークポイントで「挙動」が変わる箇所がある

列数だけでなくインタラクションそのものが変わります。§6を必ず参照してください。

### 3-5. モバイルでコンテンツを非表示にしない

`hidden md:block` でセクション丸ごとを消す実装は禁止です。モバイルファーストインデックスで不利になります。レイアウトを変えて対応してください。

---

## 4. デザイントークン

参考サイトからピクセル単位で実測した値です。改変しないでください。

### 4-1. カラー

```css
@theme {
  /* ベース */
  --color-bg:          #FFFFFF;  /* 基本背景 */
  --color-bg-dark:     #0A0A0A;  /* 反転セクション背景 */
  --color-bg-mid:      #B3B3B3;  /* スクロール遷移の中間色 */
  --color-surface:     #F9F9F9;  /* カード背景 */
  --color-surface-alt: #F5F5F4;  /* 入力欄背景 */
  --color-placeholder: #EAEAEA;  /* 画像プレースホルダ */
  --color-border:      #E4E4E1;  /* 罫線 */
  --color-placeholder-text: #B5B5B2; /* 入力欄プレースホルダ文字 */

  /* テキスト */
  --color-fg:          #0A0A0A;  /* 見出し */
  --color-fg-body:     #444444;  /* 本文 */
  --color-fg-muted:    #6B6B68;  /* 補助・肩書 */
  --color-fg-invert:   #FFFFFF;  /* 反転セクションの文字 */

  /* アクセント（唯一の有彩色） */
  --color-marker:      #2E891E;  /* 本文中のマーカーハイライト */
  --color-required:    #EF3B59;  /* 必須マーク */

  /* UI */
  --color-disabled:    #A9A9A9;  /* 無効ボタン */
}
```

**有彩色は `--color-marker` と `--color-required` の2つだけです。**
色は写真とコンテンツに持たせ、UIは徹底して無彩色にします。この規律がデザインの核心です。

`--color-marker` の緑は、本文中のキーフレーズ背景として使います。装飾で乱用しないでください。1セクションにつき2〜3箇所が上限です。

暗転時（VISIONの`data-on-vision`のマーカー帯）は `color-mix(in srgb, var(--color-marker) 88%, white)`、CTAの液体ホバー塗り（暗色配色時）は `color-mix(in srgb, var(--color-marker) 88%, black)` を使い、いずれも文字とのコントラスト比4.5:1以上を確保します。トークンの値そのものは変更しません。JS からしか読まないトークン（VISION 反転先の `--color-dark-*` など）は **`@theme static`** で定義すること（通常の `@theme` は CSS 未参照の変数を出力しないため、`getComputedStyle` が空になり文字が黒のまま背景に沈む）。

### 4-2. レイアウト

```css
@theme {
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
}
```

### 4-3. タイポグラフィ

全セクション共通の見出しパターンです。例外を作らないでください。

```
SERVICE          ← 英字・大文字・極太・字間タイト
サービス紹介       ← 和文・小・#6B6B68・すぐ下に密着
```

英字が主、和文が従。この序列を全ページで守ります。

```css
@theme {
  --text-display:    clamp(27px, 4.8vw, 46px);  /* セクション見出し PC。700 / 字間 -0.045em */
  --text-display-sp: min(13vw, 60px);           /* セクション見出し SP（PC より大きい） */
  --text-sub:        14px;  /* 見出し下の和文。500 / SP 13px */
  --text-body:       14px;  /* lh 1.8。VISION 本文は lh 2 */
  --text-body-sp:    13px;
  --text-caption:    12px;  /* カード説明・注記・フッター */
  --text-card-title: 20px;  /* SERVICE カード h3。SP 16px */
}
```

**フォント**
- 英字：Inter Tight。`scripts/mirror-fonts.mjs` が Google Fonts の css2 出力を `public/fonts/` + `src/styles/fonts.css` にミラーしてセルフホストする（`next/font` は不使用 — ビルド毎のダウンロードが遅い回線でタイムアウトしフォールバックに落ちるため）。見出しは 700、字間 −0.045em。
- 和文：Noto Sans JP。本文 400、見出し 700。`display: "optional"` で読み込む（初回訪問は OS の和文フォントで描画し、以降のキャッシュで Noto に切り替わる。46 スライス約 800KB の再レイアウトを避けるため）。
- **手書き風の大見出し**（VISION / COMPANY用）は Web フォントで再現不可。文字の輪郭パスを `scripts/handwriting-paths.py` で 手書き系フォント（Zen Kurenaido、SIL OFL）から生成して `src/content/vision-handwriting.ts` に書き出す（1 文字 = 1 ストローク、生成物のみコミット。デザイナー入稿の SVG がある場合は同じ形式で `<path d>` を写す）。`Handwriting` が輪郭を描いてから塗りを入れる。テキストで代替しないこと。`aria-label` に必ず同じ文言を入れて SEO・スクリーンリーダー対応。

---

## 5. ページ構成

| パス | ページ | データソース |
|---|---|---|
| `/` | HOME | 静的 + news / notice 最新3件 |
| `/company` | COMPANY | 静的 |
| `/service` | SERVICE | 静的（将来 service API に移行可） |
| `/news` `/news/[slug]` | NEWS | microCMS `news` |
| `/notice` `/notice/[slug]` | NOTICE | microCMS `notice` |
| `/contact` `/contact/thanks` | CONTACT | 静的 + API Route |
| `/recruit` `/recruit/[slug]` | RECRUIT | microCMS `jobs` |
| `/privacy-policy` | プライバシーポリシー | 静的 |

### NEWS と NOTICE の使い分け（運用ルール）

- **NEWS**: プレスリリース、実績公開、メディア掲載、イベント出展
- **NOTICE**: システムメンテナンス、年末年始休業、重要なお知らせ、お詫び

HOME 最上部の「お知らせ」帯（`isPinned` の NOTICE 掲出）は 2026-09-02 にクライアント指示で廃止した（復活させる場合は git 履歴の `NoticeBanner.tsx` / `lib/pinned.ts` を参照）。

---

## 6. ブレークポイント仕様

```
sp:      〜600px      （Tailwind: max-sp:）
tablet:  601px 〜 960px（max-pc:）
pc:      961px 〜      （pc:）
ヘッダーのハンバーガー切替は 720px（max-nav:）。Tailwind 既定の sm/md/lg は無効化している。
```

**列数だけでなく挙動が変わる箇所があります。**

| コンポーネント | PC | SP |
|---|---|---|
| ヘッダーナビ | インライン + CTAボタン | ハンバーガー + 全画面オーバーレイ |
| SERVICE | 3列グリッド（列 gap 56px） | **横スワイプカルーセル**（CSS scroll-snap / カード幅80% / gap 14px / 次カードpeek / ドット表示） |
| FAQ | 3列グリッド・**全問展開固定** | 1列・**アコーディオン**（`<details>` ベース） |
| 実績・パートナー | 4列グリッド（gap 18px） | **横スワイプカルーセル**（SERVICE と同じ部品） |
| メンバー一覧 | 2カラム（名前 / 本文） | 縦積み |
| CONTACT | 2カラム（フロー / フォーム） | 縦積み |
| 追従CTA | 非表示 | **右下固定の円形バッジ 80px**（回転テキスト。CONTACT が見えたら消える） |
| 見出し | 1行 | 2行折り返しを許容 |

FAQは `<details>/<summary>` を閉じた状態で SSR し、PCでは CSS の `::details-content` で常時展開の見た目にします（未対応ブラウザはクリックで開ける）。JSでの出し分けは避けてください（CLSの原因になります）。

---

## 7. アニメーション方針

依存ライブラリなし（IntersectionObserver + rAF + Web Animations API + CSS）。**必ず `prefers-reduced-motion` を尊重すること。** 初期の隠し状態は `html.js` 配下だけに適用し、JS 無効・クローラは常に可視にする。詳細は `docs/superpowers/specs/2026-09-01-phase3-animation-design.md`。（`docs/` は git 管理外・ローカル参照のみ）

### 実装するもの

| 演出 | 対象 | 実装 |
|---|---|---|
| イントロ幕 | HOME 表示のたび | 参考サイトの手順を再現: SSR の黒幕 → ハイドレーション後にロゴ箱をマーキーのロゴセル `[data-lead] [data-lead-box]` と同じ位置・大きさに置き 0.5s フェード + 12px 上昇で出現（ロゴは動かない）→ 450ms（SP 780ms）後に黒幕（ロゴセル中心の巨大な角丸正方形 `.veil-curtain`）を `transform: scale` でその箱の大きさまで 0.75s で縮める（黒がロゴに集まる。clip-path はメインスレッド駆動で途中停止するため使わない）→ 終了で `data-boing`・`data-intro` 除去・`kv:launch`、幕は 0.12s フェード。定数は `IntroVeil.tsx` 先頭。reduced-motion / `saveData` / JS 無効ではスキップし `kv:launch` を即発火 |
| 横マーキー | HOMEヒーロー | 3行、行ごとに速度差。JS 駆動（rAF）でセルを中央から pop、ドラッグ慣性（触れた行は追従・逆方向行は反対）、PC はホバー中のマウス移動にも 15% で追従して減衰、行は速度比例で skewX、ホバーしたセルは 1.12 倍でカーソル方向へ寄る。配列を2倍に複製 |
| 見出しの文字立ち上がり | 全 SectionHeading | 1 文字ずつ `.ch` に分割し skew 立ち上がり（0.68s、26ms/文字） |
| 背景色遷移 | VISION | `ScrollTheme` が rAF でセクション位置から `<html>` の `--color-*` を白→黒へ補間。0.5 超で `data-on-vision` |
| 手書き線描画 | VISION | `Handwriting` が 1 文字ずつ読み順に輪郭を `stroke-dashoffset 1→0` で描き、続けて `fill-opacity 0→1`（合計 1.6s）。データは `scripts/handwriting-paths.py` で生成 |
| 行フェード | VISION 本文 | PC は段落単位で行が順に、SP(≤640) は 1 行ずつ画面下 75% で点灯 |
| マーカー描画 | VISION 本文 | `MarkerLayer` が文字位置を計測し背後の線を `clip-path` で左→右（0.85s）。他セクションは `background-size` 方式 |
| 相関図 | VISION | リングをマスクで描画、ノードはぼかしから出現、点線は 80s で回転。2 つの玉が 18s で周回し、リング上の 3 ノードを通過する瞬間にノードが脈動して波紋が広がる（軌道・脈動・波紋は出現時に同時開始して位相を揃える。周期を変えるときは `VisionDiagram` の `ORBIT_S` と各ノードの `t0` を合わせる） |
| スクロールリビール | SERVICE / PARTNERS / FAQ / NEWS / CONTACT | `data-reveal="blur"`（SERVICE、奥から blur 解除）/ `"up"`（fade + 18px）。stagger 80ms |
| ホバー散布 | WORKS | 行ホバーでサムネ 5 枚が 3 パターンの配置で出現、他行は薄く。`(max-width: 820px)` または `(hover: none)`（タッチ主体端末含む）では画面中央の行がアクティブになる方式に切替 |
| ホバーロール | WORKS の名前・ナビ | 同一テキストを2つ重ね、`overflow:hidden` + `translateY` で入れ替え |
| CTA の液体ホバー | ヘッダー CTA | 白点が `scale(56)` で広がり `--color-marker` に塗り替わる |
| カスタムカーソル | WORKS / SERVICE | `(hover:hover) and (pointer:fine)` のみ。円カーソルが追従し対象上で開く |

### 参考サイトで確認した演出（フェーズ③で採否を確定済み — 上表が実装結果）

イントロ幕 / マーキーのセル pop + ドラッグ / 見出しの 1 文字ずつ立ち上がり / VISION の手書きストローク描画と段落フェード / SERVICE の blur 出現 + バッジ pop / WORKS のホバーでサムネ散布・名前ロール・カスタムカーソル / PARTNERS・FAQ の stagger / ヘッダーナビのロール / CTA の液体ホバー。（Lenis のような慣性スクロールは採用しない）

### 実装順序

**アニメーションはページのマークアップが完成してから実装します。**
先に入れるとレイアウト変更のたびに発火位置の取り直しが発生します。フェーズ③は HOME のマークアップ完成後に HOME から着手し、下層ページはフェーズ②の移植後に同じ部品（`data-reveal` 契約）を適用します。

### 禁止事項

- WebGL / Three.js は使いません。このデザインには不要です
- `will-change` の多用禁止。必要な要素にのみ
- スクロールジャック（ホイールを奪う実装）禁止

---

## 8. コンポーネント規約

```
components/
├ layout/    Header, Footer, MobileNav, StickyCta, Breadcrumb
├ ui/        SectionHeading, Button, Marker, Field, Card, Pagination
├ motion/    RevealObserver, ScrollTheme, IntroVeil, Marquee, MarqueeDrag,
│            SplitChars, Handwriting, MarkerLayer, VisionDiagram, CustomCursor
│            葉モジュール（純粋関数・node:test 対象）: reveal-delay, scroll-theme-math,
│            split-chars, handwriting-timing, marker-rects, marquee-cells, marquee-physics
└ sections/  Hero, VisionBlock, ServiceGrid, MemberList, FaqList,
             NewsList, ContactForm, StepFlow
```

- **1ファイル1コンポーネント。** default export。
- **Server Component を既定とする。** `"use client"` は演出のドライバ（`RevealObserver` / `MarqueeDrag` など）やフォーム等、必要な葉ノードにのみ付けます。ページ全体をクライアント化しないこと。
- Props に必須の引数を作る場合、Storybook等はないので**呼び出し例をJSDocに残す**こと。
- スタイルは Tailwind ユーティリティで書く。`.module.css` は複雑なキーフレームが必要な場合のみ許可。

### SectionHeading の使い方

全セクションで必ずこれを使います。個別に `<h2>` を組まないでください。

```tsx
<SectionHeading en="SERVICE" ja="サービス紹介" />
```

---

## 9. 画像

- **`next/image` は使わない。** `components/ui/Picture.tsx` を使う（§2参照）。
- `<img>` の直書きも禁止。SVG は `Picture` に `width` / `height` を渡す（manifest に載らないため必須）。
- `sizes` を必ず指定する。指定漏れは全幅読み込みになる。
- マーキーヒーローでは、**各行の初期表示セル**の先頭 3 枚のみ `loading="eager"` + `fetchPriority="high"`（`Marquee` の `eagerCount`、既定 3。逆方向行は複製側が初期表示なので判定が変わる）。それ以外は遅延。
- `width` / `height` は `Picture` がマニフェストから常に `<img>` に出力する（呼び出し側は渡さない）。SVG だけは props で必須（§2 参照）。未指定の `<img>` は遅延読み込み時にセクションの高さが潰れる（参考サイトで実際に起きている疑いのある不具合）。
- 透過PNGは `public/images/hero/` 配下に置く。最適化スクリプトがアルファを保持する。
- マーキーの**動画セル**（`{ type: "video", src, poster }`）は `public/videos/hero/` に MP4（H.264、正方形、音なし、数秒ループ、**500KB 以下**）、`poster` は `public/images/hero/` の静止画を指定する。`<video muted loop playsInline preload="metadata">` で SSR し、`MarqueeDrag` が `kv:launch` 後に再生・画面外で停止する（reduced-motion / JS 無効では poster のまま）。複製分も含め要素数が倍になるため**1 行 1 本まで**。参考サイトは各行 1 つをアニメーション WebP にしている。

## 10. SEO / 構造化データ

**参考サイトが取りこぼしている領域です。ここで差をつけます。必ず実装してください。**

| 対象 | スキーマ |
|---|---|
| 全ページ | `Organization`（`app/layout.tsx` に1回） |
| 下層ページ | `BreadcrumbList` |
| NEWS詳細 | `Article` |
| RECRUIT詳細 | **`JobPosting`**（Googleしごと検索に掲載されます） |
| FAQ | `FAQPage` |
| COMPANY | `Organization` + `PostalAddress` |

その他必須：
- `generateMetadata` で全ページ固有の title / description / OGP
- `app/sitemap.ts` と `app/robots.ts` を動的生成
- canonical を全ページに設定
- OGP画像は `opengraph-image.tsx` で動的生成、または1200x630のPNGを配置

---

## 11. 品質基準

公開前に以下を満たすこと。

```
Lighthouse (モバイル)
  Performance    90以上
  Accessibility  95以上
  Best Practices 95以上
  SEO           100

Core Web Vitals
  LCP  2.5s 以下
  CLS  0.1 以下
  INP  200ms 以下
```

- キーボード操作で全ての導線が辿れること。フォーカスリングを消さないこと
- `prefers-reduced-motion: reduce` で全アニメーションが停止すること
- 実機確認は **iOS Safari を必須**とする（`100vh` 問題、慣性スクロール、`position: fixed` の挙動）

---

## 12. やらないこと

- localStorage / sessionStorage の使用（サーバー同期しない状態は持たない）
- `any` 型（`unknown` + 型ガードで対応）
- インラインの色指定（`style={{ color: '#333' }}`）
- CSSのデフォルトTailwindパレット（`gray-500` 等）
- max-width コンテナ
- モバイルでのセクション非表示
- 参考サイトの文章・写真の流用（レイアウト構造の参考は可、コンテンツは不可）

---

## 13. 環境変数・シークレット

**3か所に分かれる。混同しないこと。**

### wrangler.toml `[vars]`（非機密・Worker実行時）
```
SITE_URL / CONTACT_FROM_EMAIL / CONTACT_TO_EMAIL / GITHUB_REPO
```

### Cloudflare Secrets（機密・Worker実行時）
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put MICROCMS_WEBHOOK_SECRET
npx wrangler secret put GITHUB_DISPATCH_TOKEN
npx wrangler secret put SLACK_WEBHOOK_URL
```

### GitHub Actions Secrets / Variables（ビルド時）
```
Secret   : CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
           MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY / SLACK_WEBHOOK_URL
Variable : SITE_URL / TURNSTILE_SITE_KEY
```

microCMS の API キーは**ビルド時にのみ使う**。Worker には渡さない。

`.env.local` はローカル開発専用。**実値をコミットしないこと。**

## 14. 作業時の指示

1. **実装前に該当セクションの仕様を本ファイルで確認すること。**
2. コンポーネントを作ったら、必ず PC / SP 両方の表示を確認する。
3. 「動いたので完了」ではなく、§11の品質基準を満たして完了。
4. 仕様に迷いが出たら勝手に決めず、選択肢を提示して確認を取ること。
5. 本ファイルの内容を変更する必要が生じた場合、**変更提案を出してから**編集すること。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
