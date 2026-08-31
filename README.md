# MasKOFF Corporate Site

Cloudflare Workers (Static Assets) + Next.js 15 static export + microCMS Hobby + Resend + Turnstile + KV + GitHub Actions — **月額 ¥0**。

## ページ構成

| URL | 内容 | データ |
| --- | --- | --- |
| `/` | HOME（creator.dipsy.com/apply 型 LP：マーキー / VISION / SERVICE / WORKS / PARTNERS / NEWS / FAQ / CONTACT） | faq, news |
| `/company/` | 理念・会社概要・メンバー・アクセス | members |
| `/service/` `/service/<slug>/` | 8事業（`lib/services.ts` で静的管理） | — |
| `/news/` `/news/<id>/` `/news/category/<slug>/` | ニュース一覧・詳細・カテゴリ | news |
| `/notice/` `/notice/<id>/` | お知らせ | notice |
| `/recruit/` `/recruit/<id>/` | 採用（JobPosting 構造化データ付き） | jobs |
| `/contact/` `/contact/thanks/` | フォーム（Turnstile → Worker → Resend） | — |
| `/privacy/` | プライバシーポリシー | — |

microCMS の API は **news / notice / members / faq / jobs** の 5 つ（Hobby 上限）。WORKS は `lib/works.ts`。
環境変数が無い場合は `content/sample.ts` のサンプルデータでビルドされます。

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
2. `wrangler secret put RESEND_API_KEY / TURNSTILE_SECRET_KEY / MICROCMS_WEBHOOK_SECRET / GITHUB_TOKEN`
3. GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY` / Variables: `TURNSTILE_SITE_KEY`
4. `main` へ push → `.github/workflows/deploy.yml` が build & deploy。
5. microCMS の各 API に Webhook（カスタム通知）: `https://maskoff.co.jp/api/rebuild`、シークレットは `MICROCMS_WEBHOOK_SECRET` と同値。
6. Resend でドメイン認証（SPF/DKIM を Cloudflare DNS に追加。既存 SPF がある場合は `include:` を統合）。

## デザイントークン

`app/globals.css` の `:root` に集約。ブランドカラーは `--accent` 1 箇所を変更。
参照サイト踏襲: モノクロ + 単一アクセント / full-bleed 35px（SP 20px）/ SERVICE 62px・FAQ 20px の個別ガター /
SP で SERVICE はカルーセル・FAQ はアコーディオン・PARTNERS は非表示 / SP 下部固定 CTA。

## 差し替えが必要なサンプル

- `lib/site.ts`（住所・代表者・設立など）
- `lib/services.ts` 本文、`lib/works.ts`、`app/page.tsx` の PARTNERS
- `public/images/`（works/01-06.jpg、ogp.png、logo.png）
- `app/privacy/page.tsx` の文言（法務確認）
