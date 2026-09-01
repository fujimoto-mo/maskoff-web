# ディレクトリ構成・コンポーネント設計

> **2026-08-31 注記:** 本書の ISR / Vercel / `/api/revalidate` / Upstash に関する記述は廃止。
> 現行の構成は CLAUDE.md（Cloudflare Workers + 静的エクスポート）と
> `docs/superpowers/specs/2026-08-31-home-apply-lp-design.md` を正とする。
> ディレクトリ構成は `src/` 配下（§1）のみ有効で、`api/` は存在しない。

## 1. ディレクトリ構成

```
maskoff-web/
├── CLAUDE.md                       プロジェクト規約（最初に読む）
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
│
├── docs/
│   ├── architecture.md             このファイル
│   └── microcms-schemas/           microCMS スキーマ定義（インポート用）
│       ├── news.json
│       ├── notice.json
│       ├── members.json
│       ├── works.json
│       ├── faq.json
│       └── jobs.json
│
├── public/
│   ├── images/
│   │   ├── hero/                   ヒーローマーキー用 透過PNG
│   │   ├── company/                手書き風見出しSVG など
│   │   └── og/                     OGP画像
│   └── fonts/
│
└── src/
    ├── app/
    │   ├── layout.tsx              Header / Footer / Organization JSON-LD
    │   ├── page.tsx                HOME
    │   ├── globals.css             @theme トークン定義
    │   ├── not-found.tsx
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   ├── opengraph-image.tsx
    │   │
    │   ├── company/page.tsx
    │   ├── service/page.tsx
    │   ├── privacy-policy/page.tsx
    │   │
    │   ├── news/
    │   │   ├── page.tsx            一覧（1ページ目）
    │   │   ├── page/[page]/page.tsx  一覧（2ページ目以降）
    │   │   ├── category/[id]/page.tsx
    │   │   └── [slug]/page.tsx     詳細 + Article JSON-LD
    │   │
    │   ├── notice/                 news と同構成
    │   │
    │   ├── recruit/
    │   │   ├── page.tsx            募集要項一覧・選考フロー
    │   │   └── [slug]/page.tsx     詳細 + JobPosting JSON-LD
    │   │
    │   ├── contact/
    │   │   ├── page.tsx
    │   │   └── thanks/page.tsx
    │   │
    │   └── api/
    │       ├── contact/route.ts    フォーム受信・メール送信
    │       └── revalidate/route.ts microCMS Webhook 受け口
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── MobileNav.tsx       "use client"
    │   │   ├── Footer.tsx
    │   │   ├── StickyCta.tsx       SP専用の追従CTA
    │   │   └── Breadcrumb.tsx
    │   │
    │   ├── ui/
    │   │   ├── SectionHeading.tsx  英字大見出し＋和文サブ（全セクション必須）
    │   │   ├── Button.tsx
    │   │   ├── Marker.tsx          緑マーカーのラッパー
    │   │   ├── Field.tsx           label + input + error
    │   │   ├── Card.tsx
    │   │   ├── Pagination.tsx
    │   │   └── Tag.tsx
    │   │
    │   ├── motion/                 全て "use client"
    │   │   ├── Marquee.tsx         横無限スクロール
    │   │   ├── ScrollReveal.tsx    fade + translateY
    │   │   ├── ScrollBgSection.tsx 背景色のスクロール補間
    │   │   ├── Collage.tsx         画像の不規則出現
    │   │   ├── RollText.tsx        ホバーで文字が入れ替わる
    │   │   └── SmoothScroll.tsx    Lenis 初期化
    │   │
    │   └── sections/
    │       ├── Hero.tsx
    │       ├── VisionBlock.tsx     黒背景＋手書き見出し＋マーカー本文
    │       ├── ServiceGrid.tsx     PC=grid / SP=Swiper
    │       ├── MemberList.tsx      2カラム＋コラージュ
    │       ├── WorksGrid.tsx
    │       ├── FaqList.tsx         PC=展開固定 / SP=アコーディオン
    │       ├── NewsList.tsx
    │       ├── StepFlow.tsx        番号バッジ＋縦線
    │       ├── ContactForm.tsx     "use client"
    │       └── NoticeBanner.tsx    isPinned な NOTICE をHOME最上部に
    │
    ├── lib/
    │   ├── microcms.ts             クライアント + 型付きfetch
    │   ├── resend.ts
    │   ├── turnstile.ts
    │   ├── ratelimit.ts
    │   ├── jsonld.ts               各種構造化データ生成
    │   ├── seo.ts                  generateMetadata 共通処理
    │   └── schema/
    │       └── contact.ts          Zod スキーマ（クライアント/サーバー共用）
    │
    ├── types/
    │   └── microcms.ts             API レスポンス型
    │
    └── styles/
        └── tokens.css              @theme（globals.css から import）
```

---

## 2. レンダリング戦略

| ページ | 方式 | 備考 |
|---|---|---|
| HOME | ISR（`revalidate: 60`） | NEWS/NOTICE最新分を含むため |
| COMPANY / SERVICE / PRIVACY | SSG | 完全静的 |
| NEWS / NOTICE 一覧・詳細 | SSG + On-demand ISR | Webhookで即時反映 |
| NEWS / NOTICE 下書きプレビュー | 動的（`draftKey`） | `searchParams` で分岐 |
| RECRUIT | SSG + On-demand ISR | |
| CONTACT | 静的（フォームのみクライアント） | |

**microCMS の Webhook を `/api/revalidate` に向け、`revalidatePath` / `revalidateTag` で該当ページのみ再生成します。** 全体再ビルドは行いません。

---

## 3. 主要コンポーネントの設計

### SectionHeading

全セクションの見出しを統一します。個別に `<h2>` を組むことは禁止です。

```tsx
type Props = {
  en: string;              // "SERVICE"
  ja: string;              // "サービス紹介"
  as?: "h1" | "h2";        // 既定 h2
  invert?: boolean;        // 黒背景セクションで true
};
```

英字が主・和文が従の序列を、このコンポーネントで担保します。

---

### Marquee

```tsx
type Props = {
  items: ReactNode[];
  speed?: number;          // px/sec 既定 40
  direction?: "left" | "right";
  pauseOnHover?: boolean;  // 既定 false
};
```

内部で `items` を2回描画してシームレスループを作ります。ヒーローでは3本を速度違いで積みます。

`prefers-reduced-motion: reduce` のとき、アニメーションを止めて静的なグリッド表示にフォールバックします。

---

### ScrollBgSection

背景色をスクロール量に応じて補間します。

```tsx
type Props = {
  from: string;            // "var(--color-bg-dark)"
  to: string;              // "var(--color-bg)"
  children: ReactNode;
};
```

参考サイトで観測された中間色（`#B3B3B3` `#333333`）は、この遷移の途中経過と推定しています。**実装前に一度、参考サイトをゆっくりスクロールして挙動を確認してください。**もし単なる固定色だった場合、このコンポーネントは不要になります。

---

### ServiceGrid

**PCとSPで実装が分岐する唯一のセクションです。**

```tsx
// PC (>=1024px): CSS grid 3列 / gap 62px
// SP (<1024px) : Swiper（slidesPerView: 1.15, spaceBetween: 16, pagination: dots）
```

SSRでの不一致を避けるため、**両方をマークアップして CSS で出し分けます。** `useMediaQuery` による条件レンダリングは使いません（ハイドレーション不一致とCLSの原因になります）。

---

### FaqList

```tsx
// <details>/<summary> で実装
// SP : ネイティブのアコーディオン挙動
// PC : CSS で summary のマーカーを隠し、常時 open 相当の見た目に
```

JSを使わないことで、JS無効環境とクローラの双方で内容が読めます。`FAQPage` の JSON-LD も同じデータから生成します。

---

### MemberList

参考サイトで最も複雑なセクションです。

```
PC: [アバター] [名前 / 肩書]  [コラージュ画像]  [本文]
     35px      107px          280〜592px        592px〜

SP: 縦積み。コラージュ画像は行の前後に不規則配置
```

`280〜592px` の領域は **PC版で空白に見えていた箇所** です。ここに `works` から取得した作品画像が、スクロール発火で不規則な位置・サイズで出現します。

**この演出は工数1.5人日の見積もり項目です。予算調整が必要な場合、最初に削る候補になります。**削った場合は静的な2カラムリストとして成立します。

---

## 4. データフロー

```
microCMS ──(fetch / SSG)──> Next.js ──(HTML/CSS/JS)──> ブラウザ
    │
    └──(Webhook)──> /api/revalidate ──> revalidatePath()

ブラウザ ──(POST)──> /api/contact
                        ├─ Turnstile 検証
                        ├─ Zod バリデーション
                        ├─ ハニーポット判定
                        ├─ レート制限（Upstash）
                        ├─ Resend ─┬─> 管理者通知メール
                        │           └─> 送信者へ自動返信
                        └─ Slack Webhook（送信ログ）
```

---

## 5. 実装順序

| # | 作業 | 目安 |
|---|---|---|
| 1 | 環境構築・CLAUDE.md 配置・Vercel Preview疎通 | 0.3 |
| 2 | トークン定義（globals.css）・SectionHeading・Button | 0.3 |
| 3 | Header / Footer / MobileNav / StickyCta | 0.5 |
| 4 | COMPANY → SERVICE → RECRUIT（静的ページ） | 1.2 |
| 5 | microCMS 接続・型定義・NEWS/NOTICE 一覧詳細 | 1.5 |
| 6 | CONTACT フォーム + API Route + メール到達確認 | 0.7 |
| 7 | HOME（他ページのパーツを組み合わせる） | 1.0 |
| 8 | 構造化データ・sitemap・OGP | 0.5 |
| 9 | **アニメーション（ここで初めて着手）** | 3.2 |
| 10 | レスポンシブ調整・iOS Safari 実機検証 | 1.5 |
| 11 | Lighthouse 改善・修正対応 | 1.5 |
| 12 | DNS切替・SPF/DKIM/DMARC・公開 | 0.3 |

**合計 12.5人日**（別途：デザイン3.5 / 素材2.0 / 要件定義0.8 ＝ 総計約19人日）

**9番を最後に置くことが最重要です。**先にアニメーションを入れると、レイアウト変更のたびに発火位置の再調整が発生し、工数が倍増します。
