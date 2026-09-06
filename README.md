# MasKOFF Corporate Site

Cloudflare Pages（Advanced mode の `_worker.js`）+ Next.js 16 static export + microCMS Hobby + Resend + Turnstile + KV + GitHub Actions — **月額 ¥0**。

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
npm run preview            # build → wrangler pages dev（/api/* 含めて本番同等。機密は .dev.vars）
```

## 開発サーバーの起動・停止・再起動

プロジェクトのディレクトリで実行する。開発サーバーは http://localhost:3000 。

```bash
# 起動（フォアグラウンド。Ctrl+C で停止）
npm run dev

# 起動（バックグラウンドで動かしたままにする。ログは /tmp/maskoff-dev.log）
setsid nohup npm run dev -- -p 3000 > /tmp/maskoff-dev.log 2>&1 < /dev/null &

# 停止（ポート 3000 を使っているプロセスを kill）
kill $(ss -ltnp | grep ':3000 ' | grep -o 'pid=[0-9]*' | cut -d= -f2)

# 再起動（停止 → 起動）
kill $(ss -ltnp | grep ':3000 ' | grep -o 'pid=[0-9]*' | cut -d= -f2); sleep 1; npm run dev

# 本番と同じ静的ビルドで確認（http://localhost:3999）
npm run build && npx serve out -l 3999
```

- `next dev` は同じディレクトリで 2 つ起動できない（ロックが掛かる）。「already running」と出たら上の停止コマンドで先に止める
- 画像を追加・差し替えたときは `npm run build`（`prebuild` で最適化スクリプトが走る）か `node scripts/optimize-images.mjs` を実行してから確認する

## デプロイ（Cloudflare Pages）

ビルドとデプロイは Pages の Git 連携が行う（`main` へ push → Pages がビルド）。GitHub Actions は日次 cron で Deploy Hook を叩くだけ。

1. Cloudflare → Workers & Pages → Pages プロジェクトを作成（Git 連携）。ビルドコマンド `npm run build`、出力ディレクトリ `out`。
2. 設定 → 環境変数（Production / Preview 両方）: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NODE_VERSION`（24.17.0）。
3. 暗号化変数（Production / Preview 両方）: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `MICROCMS_WEBHOOK_SECRET`, `CF_DEPLOY_HOOK_URL`（任意で `SLACK_WEBHOOK_URL`）。`npx wrangler pages secret put <NAME> --project-name maskoff-web` でも可。
4. KV バインディングと非機密の変数は `wrangler.toml` に定義済み（ファイルが正。ダッシュボードでは閲覧のみ）。
5. 設定 → ビルド → デプロイフック を作成し、URL を 3 の `CF_DEPLOY_HOOK_URL` と GitHub Secrets の `CF_DEPLOY_HOOK_URL`（`.github/workflows/daily-rebuild.yml` 用）に登録。
6. microCMS の各 API に Webhook（カスタム通知）: `https://maskoff.co.jp/api/rebuild`、シークレットは `MICROCMS_WEBHOOK_SECRET` と同値。
7. Turnstile のホスト名に `<project>.pages.dev` と `maskoff.co.jp` を登録。Resend でドメイン認証（SPF/DKIM をムームーDNS に追加）。
8. `<project>.pages.dev` で検証後、カスタムドメイン（apex は ALIAS、www は CNAME）を設定し、`NEXT_PUBLIC_SITE_URL` を本番 URL に変えて再ビルド。

`functions/` ディレクトリは作らない（`_worker.js` と併用不可）。静的アセットと旧 URL は `worker/routes.ts` → `out/_routes.json` で Function の対象外にしている。

## デザイントークン

`src/styles/tokens.css` の `@theme` に集約（creator.dipsy.com/apply の実測値）。ブランドカラーは `--color-marker` / `--color-required`。
フルブリード 32px（SP 20px）/ SERVICE 列 56px・FAQ 18px の個別ガター / SP で SERVICE・PARTNERS は scroll-snap カルーセル、FAQ はアコーディオン / SP 右下に回転バッジ CTA。

## 演出（アニメーション）

依存ライブラリなし。`src/components/motion/` の 7 つの client 部品（`RevealObserver` / `ScrollTheme` / `Handwriting` / `MarkerLayer` / `IntroVeil` / `MarqueeDrag` / `CustomCursor`）と `globals.css` の CSS で動きます。

- 出現系は要素に `data-reveal="head|para|line|write|diagram|blur|up"` を付け、`RevealObserver` が画面に入ったとき `data-reveal="in"` に書き換えます（元の値は `data-reveal-kind`）。演出は CSS。
- 初期の隠し状態は `html.js` 配下だけ。JS 無効・クローラは常に可視です。
- `prefers-reduced-motion: reduce` では全演出が最終状態で静止し、イントロ幕も出ません。
- 手書き見出しは `scripts/handwriting-paths.py`（要 `pip install fonttools`）で手書き系フォントの輪郭から `src/content/vision-handwriting.ts` を生成します（文言は同スクリプトの `LINES`）。デザイナー入稿の SVG がある場合は同じ形式で `<path d>` を写します。

## 差し替えが必要なサンプル

- `src/lib/site.ts`（住所・電話・SNS）
- `src/lib/services.ts` `src/lib/works.ts` `src/lib/partners.ts`、`src/content/sample.ts`
- `public/videos/hero/sample-01.mp4` と `public/images/hero/sample-01-poster.png`（マーキーの動画セルの仮素材。`Hero.tsx` の `VIDEO` を実素材に差し替える。正方形・音なし・数秒ループ・500KB 以下の MP4）
- `src/components/sections/VisionBlock.tsx` の本文と `src/content/vision-handwriting.ts`（手書き見出しの文言・フォントを確定したら `scripts/handwriting-paths.py` で再生成、またはデザイナー入稿 SVG の `<path d>` に差し替え）
- `public/images/`（`scripts/gen-sample-assets.mjs` で生成した仮画像。差し替え後 `npm run images`）

## メンテナンスモード

`wrangler.toml` の `[vars] MAINTENANCE` がスイッチ。`"1"` で全ページが 503 のメンテ画面（`worker/maintenance.ts`）になり、`/api/contact` も 503 で止まる。画像・フォントなどの静的アセットは配信を続ける。`/api/rebuild`（microCMS → 再ビルド）はメンテ中も動く。

```bash
# ON
git checkout main && git pull
sed -i 's/^MAINTENANCE = "0"/MAINTENANCE = "1"/' wrangler.toml
git commit -am "メンテナンス開始" && git push

# OFF
git checkout main && git pull
sed -i 's/^MAINTENANCE = "1"/MAINTENANCE = "0"/' wrangler.toml
git commit -am "メンテナンス終了" && git push

# 反映確認（メンテ中は 503、通常は 200）。push から 3〜5 分
curl -sI https://maskoff.co.jp/ | head -1

# ローカルでメンテ画面を確認
npm run build && npx wrangler pages dev --binding MAINTENANCE=1
```

- `wrangler.toml` が正なのでダッシュボードからは変更できない。反映は Pages のビルド完了後（push から 3〜5 分）
- 文言・連絡先を変えるときは `worker/maintenance.ts`（連絡先は `CONTACT_TO_EMAIL`）
