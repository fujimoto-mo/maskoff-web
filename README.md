# MasKOFF Corporate Site

Cloudflare Workers (Static Assets) + Next.js 16 static export + microCMS Hobby + Resend + Turnstile + KV + GitHub Actions — **月額 ¥0**。

## ページ構成

| URL | 内容 | データ |
| --- | --- | --- |
| `/` | HOME（creator.dipsy.com/apply 型 LP：マーキー / VISION / SERVICE / WORKS / PARTNERS / NEWS・NOTICE / FAQ / CONTACT） | faq, news, notice |
| `/company/` | 理念・会社概要・メンバー・アクセス | members |
| `/service/` `/service/<slug>/` | 8サービス（`src/lib/services.ts` で静的管理）※フェーズ②で移植 | — |
| `/news/` `/news/<id>/` `/news/category/<slug>/` | ニュース一覧・詳細・カテゴリ | news |
| `/notice/` `/notice/<id>/` | お知らせ | notice |
| `/recruit/` `/recruit/<id>/` | 採用（JobPosting 構造化データ付き） | jobs |
| `/contact/` `/contact/thanks/` | フォーム（Turnstile → Worker → Resend） | — |
| `/privacy/` | プライバシーポリシー | — |

microCMS の API は **news / notice / members / faq / jobs** の 5 つ（Hobby 上限）。WORKS / PARTNERS は `src/lib/works.ts` `src/lib/partners.ts`。
環境変数が無い場合は `src/content/sample.ts` のサンプルデータでビルドされます。

下層ページ（COMPANY / SERVICE / NEWS / NOTICE / RECRUIT / CONTACT / PRIVACY）はフェーズ②で `src/` に移植します。それまで 404 です。

## セットアップ（WSL2 内で実行）

```bash
# 1) 必ず WSL 側のファイルシステムに置く（/mnt/c 配下は不可）
cd ~ && unzip maskoff-site.zip && cd maskoff-site
git init && git config core.autocrlf input

# 2) Node（mise 推奨。.node-version を参照）
mise install && mise use

# 3) 依存
npm ci   # lock が無ければ npm install

# 4) 環境変数（WSL 内で作成 → BOM 回避）
cp .env.local.example .env.local   # Next.js ビルド時（microCMS / Turnstile サイトキー）
cp .dev.vars.example .dev.vars     # Wrangler 実行時（Resend / Turnstile secret / GitHub token）

# 5) 開発
npm run dev                # Next.js のみ（フォーム送信は失敗する）
npm run preview            # build → wrangler dev（/api/* 含めて本番同等）
```

## デプロイ

1. Cloudflare: KV Namespace 作成 → `wrangler.toml` の `id` を置換。Turnstile ウィジェット作成。
2. `wrangler secret put RESEND_API_KEY / TURNSTILE_SECRET_KEY / MICROCMS_WEBHOOK_SECRET / GITHUB_DISPATCH_TOKEN`（任意で `SLACK_WEBHOOK_URL`）
3. GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY` / Variables: `TURNSTILE_SITE_KEY`
4. `main` へ push → `.github/workflows/deploy.yml` が build & deploy。
5. microCMS の各 API に Webhook（カスタム通知）: `https://maskoff.co.jp/api/rebuild`、シークレットは `MICROCMS_WEBHOOK_SECRET` と同値。
6. Resend でドメイン認証（SPF/DKIM を Cloudflare DNS に追加。既存 SPF がある場合は `include:` を統合）。

## デザイントークン

`src/styles/tokens.css` の `@theme` に集約（creator.dipsy.com/apply の実測値）。ブランドカラーは `--color-marker` / `--color-required`。
フルブリード 32px（SP 20px）/ SERVICE 列 56px・FAQ 18px の個別ガター / SP で SERVICE・PARTNERS は scroll-snap カルーセル、FAQ はアコーディオン / SP 右下に回転バッジ CTA。

## 差し替えが必要なサンプル

- `src/lib/site.ts`（住所・電話・SNS）
- `src/lib/services.ts` `src/lib/works.ts` `src/lib/partners.ts`、`src/content/sample.ts`
- `src/components/sections/VisionBlock.tsx` の本文と `public/images/company/*.svg`（手書き見出しはデザイナー入稿の SVG に差し替え）
- `public/images/`（`scripts/gen-sample-assets.mjs` で生成した仮画像。差し替え後 `npm run images`）
