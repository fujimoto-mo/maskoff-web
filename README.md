# maskoff-web 初期設計一式

株式会社MasKOFF コーポレートサイト（Next.js + Cloudflare Workers + microCMS）の
初期ファイル一式。

---

## 1. 中身

```
maskoff-web/
├── README.md                    このファイル
├── CLAUDE.md                    ★ Claude Code に読ませる規約。最重要
│
├── .node-version                24.17.0（mise / CI の単一情報源）
├── .mise.toml
├── .gitattributes               改行コードを LF 固定。最初に入れること
├── .gitignore
├── .env.example
│
├── next.config.ts               静的エクスポート設定
├── wrangler.toml                Workers 設定（run_worker_first に注意）
│
├── .github/workflows/
│   └── deploy.yml               ビルド → Workers デプロイ
│
├── worker/                      本番では workerd 上で動く
│   ├── index.ts                 エントリ。/api/* のルーティング
│   ├── contact.ts               フォーム受信・メール送信
│   └── rebuild.ts               microCMS Webhook → GitHub dispatch
│
├── scripts/
│   └── optimize-images.mjs      next/image の代替。AVIF / WebP 生成
│
├── src/
│   ├── styles/tokens.css        デザイントークン（実測値）
│   └── lib/schema/contact.ts    Zod スキーマ
│
└── docs/
    ├── setup-workers.md         ★ 全体の進行（Phase 0〜10）
    ├── local-dev.md             ★ 日々の開発手順・トラブルシュート
    ├── architecture.md          ディレクトリ構成・コンポーネント設計
    ├── dns-migration.md         ムームードメイン → Cloudflare の DNS 移行
    └── microcms-schemas/        API スキーマ定義 5本
        ├── news.json
        ├── notice.json
        ├── members.json
        ├── faq.json
        └── jobs.json
```

---

## 2. 読む順番

| # | ファイル | いつ |
|---|---|---|
| 1 | `docs/setup-workers.md` | 最初に全体像を掴む |
| 2 | `docs/local-dev.md` | 環境構築のとき |
| 3 | `CLAUDE.md` | 実装中ずっと |
| 4 | `docs/architecture.md` | コンポーネント設計で迷ったら |
| 5 | `docs/dns-migration.md` | DNS 移行のとき |

---

## 3. 配置手順

### 3-1. Next.js プロジェクトを作る

**WSL のホーム配下に置くこと。** `/mnt/c/` だと I/O が10倍以上遅い。

```bash
cd ~
mkdir maskoff-web && cd maskoff-web

npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack
```

### 3-2. この一式を上書きコピー

`next.config.ts` は `create-next-app` が生成したものを**上書きする**
（静的エクスポート設定が入っているため）。

### 3-3. 依存関係を追加

```bash
npm i microcms-js-sdk zod
npm i -D sharp wrangler @cloudflare/workers-types
npm i gsap lenis swiper
npm i -D prettier prettier-plugin-tailwindcss
```

### 3-4. globals.css の先頭を書き換える

```css
@import "tailwindcss";
@import "../styles/tokens.css";
```

### 3-5. package.json に scripts を追記

```json
{
  "scripts": {
    "prebuild": "node scripts/optimize-images.mjs",
    "build": "next build",
    "preview": "npm run build && wrangler dev",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types"
  }
}
```

### 3-6. tsconfig.json に Workers の型を追加

```json
{ "compilerOptions": { "types": ["@cloudflare/workers-types"] } }
```

### 3-7. 環境変数

```bash
cp .env.example .env.local
```

`.dev.vars` を**WSL 内の VS Code で**新規作成する。
Windows 側のエディタだと BOM が付き、Wrangler が値を読み違える。

### 3-8. 動作確認

```bash
mise install
node -v          # v24.17.0
npm run dev      # http://localhost:3000
```

---

## 4. 未実装のもの

この一式は設計と設定のみ。以下は実装が必要。

```
src/types/microcms.ts              API レスポンス型
src/lib/microcms.ts                型付き取得関数
src/lib/works.ts                   works の静的データ
src/components/ui/Picture.tsx      ★ next/image の代替。最初に作る
src/components/ui/SectionHeading.tsx
src/components/ui/Button.tsx
src/components/layout/             Header / Footer / MobileNav / StickyCta
src/components/motion/             Marquee / ScrollReveal / Collage ほか
src/components/sections/           各セクション
src/app/**/page.tsx                7ページ分
public/_redirects                  旧URLからの301（URL構造が変わる場合）
```

実装順は `docs/local-dev.md` の §4 を参照。

---

## 5. 特に注意する3点

### wrangler.toml の `run_worker_first = ["/api/*"]` を消さない

この1行で静的アセットが Worker を通らず無課金で配信される。
消すと全リクエストが課金対象になり、無料枠を即座に超える。

### `worker/` は Node ではない

本番では workerd 上で動く。`nodejs_compat` は互換レイヤーで全部ではない。
Web 標準 API（fetch / crypto.subtle / TextEncoder）だけで書くこと。
`node:fs` や `Buffer` を使わない。

### MailChannels を使わない

Cloudflare Workers × メール送信で検索すると大量に出てくるが、
2024年8月31日に無料サービスが終了している。メール送信は Resend を使う。

---

## 6. 構成の要約

```
ホスティング   Cloudflare Workers（Static Assets）    0円
CMS           microCMS Hobby（API 5本上限）          0円
メール         Resend Free（3,000通/月）              0円
Bot対策        Cloudflare Turnstile                  0円
レート制限     Cloudflare KV                         0円
CI            GitHub Actions                        0円
──────────────────────────────────────────────
                                      合計 0円/月
```

想定工数 17.4人日（実装 11.1 / 要件定義 0.8 / デザイン 3.5 / 素材 2.0）。
コピーライティングは別枠。
