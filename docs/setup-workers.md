# 構築手順書（Cloudflare Workers + microCMS Hobby）

Pages を経由せず、**最初から Workers ネイティブ**で構築する手順。
Cloudflare の Pages → Workers 統合による将来の移行作業を回避できる。

---

## 0. なぜ Workers 直行なのか、そして月額はいくらか

### Pages ではなく Workers を選ぶ理由

Cloudflare は Pages を Workers に統合する方向で進めている。Pages で作ると、
いずれ移行作業が発生する。最初から Workers Static Assets で組めばそれがない。

機能面の差はほぼない。Pages が提供していた「静的ファイル配信 + 動的処理 + Git連携」
は、Workers 側で `[assets]` 設定と Workers Builds / GitHub Actions として揃っている。

### 月額は0円で足りる可能性が高い

**`run_worker_first = ["/api/*"]` の設定が決定的に効く。**

```
/                 → 静的アセット。Worker を通らない。無制限・無課金
/company/         → 同上
/news/xxx/        → 同上
/_opt/hero/*.avif → 同上
/api/contact      → Worker が処理。ここだけカウントされる
/api/rebuild      → 同上
```

つまり Worker のリクエスト消費は、**フォーム送信と再ビルド通知だけ**。
コーポレートサイトなら月100リクエスト程度で、無料枠（10万/日）に対して誤差。

CI に GitHub Actions を使えば、Cloudflare 側のビルド枠も消費しない。
プライベートリポジトリでも月2,000分の無料枠があり、1ビルド2〜3分なので
月600回以上デプロイできる。

| 項目 | プラン | 月額 |
|---|---|---|
| Cloudflare Workers | 無料枠 | 0円 |
| GitHub Actions | 無料枠（2,000分/月） | 0円 |
| microCMS | Hobby | 0円 |
| Resend | Free（3,000通/月） | 0円 |
| Turnstile / KV | 無料 | 0円 |
| **合計** | | **0円/月** |

**$5 の有料枠は不要。** 必要になるのは、Worker のリクエストが1日10万を超えるか、
KV の書き込みが1日1,000を超えたときだけ。フォーム経由では到達しない。

現行 STUDIO（月980〜4,980円）を解約するので、実質はコスト減。

### Pages 構成との差分

| | Pages | Workers |
|---|---|---|
| 静的配信 | 自動 | `[assets]` で設定 |
| 動的処理 | `functions/` の規約 | `worker/index.ts` で自前ルーティング |
| Git連携 | ダッシュボードで接続 | Workers Builds または GitHub Actions |
| 再ビルド起動 | Deploy Hook（標準機能） | **`/api/rebuild` を自作**（worker/rebuild.ts） |

**手間が増えるのは再ビルドの起点だけ**で、その分は実装済み。

---

## Phase 0. アカウント準備（0.2人日）

| サービス | 作業 |
|---|---|
| GitHub | プライベートリポジトリ作成 |
| Cloudflare | アカウント作成（**無料枠のままでよい**） |
| microCMS | サービス作成（Hobby のまま） |
| Resend | アカウント作成。ドメイン認証は Phase 6 |

Turnstile はダッシュボードからサイト登録して site key / secret key を取得する。
**登録ドメインに `localhost` も追加すること。** 忘れると開発中にテストできない。

---

## Phase 1. プロジェクト初期化（0.3人日）

```bash
npx create-next-app@latest maskoff-web \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack

cd maskoff-web

npm i microcms-js-sdk zod
npm i -D sharp wrangler @cloudflare/workers-types
npm i gsap lenis swiper
npm i -D prettier prettier-plugin-tailwindcss
```

配布ファイルを配置する。

```
maskoff-web/
├── CLAUDE.md
├── next.config.ts              静的エクスポート設定
├── wrangler.toml               Workers 設定（★ run_worker_first に注意）
├── .env.example
├── .github/workflows/deploy.yml
├── worker/
│   ├── index.ts                エントリ。/api/* のルーティング
│   ├── contact.ts              フォーム受信・メール送信
│   └── rebuild.ts              microCMS Webhook → GitHub dispatch
├── scripts/optimize-images.mjs
├── docs/
│   ├── architecture.md
│   ├── setup-workers.md        このファイル
│   └── microcms-schemas/*.json （5本）
└── src/
    ├── styles/tokens.css
    └── lib/schema/contact.ts
```

`package.json`：

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

`src/app/globals.css`：

```css
@import "tailwindcss";
@import "../styles/tokens.css";
```

`tsconfig.json` に Workers の型を追加：

```json
{ "compilerOptions": { "types": ["@cloudflare/workers-types"] } }
```

---

## Phase 2. Workers への疎通（0.4人日）

**実装より先に通す。** デプロイが動いていれば、Claude Code に
「デプロイ先を見て直して」と指示できるようになる。

### 2-1. KV 名前空間を作成

```bash
npx wrangler kv namespace create RATE_LIMIT
npx wrangler kv namespace create RATE_LIMIT --preview
```

出力された id を `wrangler.toml` に貼る。

### 2-2. シークレットを登録

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put MICROCMS_WEBHOOK_SECRET
npx wrangler secret put GITHUB_DISPATCH_TOKEN
npx wrangler secret put SLACK_WEBHOOK_URL
```

`GITHUB_DISPATCH_TOKEN` は GitHub の Fine-grained personal access token。
**権限は対象リポジトリの Contents: Read and write だけに絞る。**

### 2-3. 初回デプロイ

```bash
npm run build      # out/ が生成される
npx wrangler deploy
```

`https://maskoff-web.<account>.workers.dev` ではなく、`workers_dev = false` に
しているので独自ドメイン設定後に公開される。動作確認だけしたい間は
一時的に `workers_dev = true` にしてよい。

### 2-4. GitHub Actions の設定

リポジトリの Settings > Secrets and variables > Actions に登録する。

| 種別 | 名前 |
|---|---|
| Secret | `CLOUDFLARE_API_TOKEN`（Workers Scripts: Edit 権限） |
| Secret | `CLOUDFLARE_ACCOUNT_ID` |
| Secret | `MICROCMS_SERVICE_DOMAIN` |
| Secret | `MICROCMS_API_KEY` |
| Secret | `SLACK_WEBHOOK_URL` |
| Variable | `SITE_URL` |
| Variable | `TURNSTILE_SITE_KEY` |

main に push して、Actions が緑になることを確認する。

### 2-5. ローカルでの動作確認

```bash
npm run preview     # build → wrangler dev
```

`wrangler dev` は静的アセットと Worker の両方を再現するので、
`/api/contact` の動作までローカルで確認できる。

---

## Phase 3. microCMS セットアップ（0.4人日）

### 3-1. API を5本作成

Hobby プランの上限が5個。`docs/microcms-schemas/*.json` に沿って作る。

```
news / notice / members / faq / jobs
```

**5本を超えないこと。** 追加が必要なら新規APIを作らず、
既存APIに `type` フィールドを足して統合する。

### 3-2. API キーを発行

権限を GET のみに絞る。

### 3-3. テストデータ

`news` はページネーション確認のため11件以上入れる。

### 3-4. Webhook を設定

API設定 > Webhook > カスタム通知

| 項目 | 値 |
|---|---|
| URL | `https://maskoff.co.jp/api/rebuild` |
| シークレット | `MICROCMS_WEBHOOK_SECRET` と同じ値 |

これで以下が繋がる。

```
コンテンツ更新 → /api/rebuild（署名検証）
              → GitHub repository_dispatch
              → Actions が build & deploy
              → 1〜2分で公開
```

**署名検証を必ず通すこと。** `worker/rebuild.ts` に実装済み。
検証を省くと、URLを知られただけで無制限にビルドを起動されてしまう。

### 3-5. 画像は microCMS から直接配信しない

Hobby プランは転送量が月20GBを超えると API が停止する（翌月1日リセット）。
**ビルド時に画像を取得して `public/` へ同梱し、Cloudflare から配信する。**
そうすれば microCMS からの転送は API の JSON だけになり、20GBに届かない。

---

## Phase 4. 基盤実装（0.9人日）

1. `types/microcms.ts`
2. `lib/microcms.ts`
3. `lib/works.ts`（microCMS から外した works の静的データ）
4. **`components/ui/Picture.tsx`** — `next/image` の代替
5. `components/ui/SectionHeading.tsx`
6. `components/ui/Button.tsx`
7. `components/layout/` 一式

### Picture.tsx

`scripts/optimize-images.mjs` が生成した `src/lib/images/manifest.json` を読み、
`<picture>` で AVIF / WebP を出し分ける。

```tsx
<picture>
  <source type="image/avif" srcSet="/_opt/hero/item-400.avif 400w, ..." sizes="..." />
  <source type="image/webp" srcSet="/_opt/hero/item-400.webp 400w, ..." sizes="..." />
  <img src="/images/hero/item.jpg" width={w} height={h} loading="lazy" decoding="async" />
</picture>
```

**`width` / `height` をマニフェストから必ず埋めること。** 省くと遅延読み込み時に
レイアウトが潰れる。参考サイトで SPONSORING セクションが消えていた原因として
疑っている不具合がこれ。

### トークンの実測確認

`SectionHeading` を仮ページに置き、検証ツールで測る。

- PC 38px / SP 27px
- 左右パディング PC 35px / SP 19px

ここがズレたまま7ページ作ると全部やり直しになる。

---

## Phase 5. ページ実装（2.7人日）

```
1. /company    2. /service    3. /recruit
4. /news       5. /notice     6. /privacy-policy
7. /           HOME（最後）
```

**動的ルートには `generateStaticParams` が必須。** 静的エクスポートでは
実装漏れがビルドエラーになるので、記事追加時に気づける。

下書きプレビューは静的エクスポートでは動かない。microCMS の画面プレビュー機能で
代替するか、必要なら `/api/preview` を Worker に追加する。

---

## Phase 6. フォームとメール到達（0.7人日）

### 6-1. Resend のドメイン認証（先に着手）

**DNS の反映に最大48時間かかる。Phase 3 と並行して始めること。**

```
TXT   send.maskoff.co.jp                SPF
TXT   resend._domainkey.maskoff.co.jp   DKIM
TXT   _dmarc.maskoff.co.jp              v=DMARC1; p=none; rua=mailto:dmarc@maskoff.co.jp
```

**SPF / DKIM / DMARC の3点が揃わないと Gmail に届かない。**
DMARC は Resend の表示に含まれないことがあるので手動で追加する。

DNS を Cloudflare で管理する場合、**該当レコードはプロキシ（オレンジ雲）を OFF に**。

### 6-2. フォーム UI

`components/sections/ContactForm.tsx`（`"use client"`）

- `src/lib/schema/contact.ts` の zod をクライアント検証に使う
- ハニーポット（`name="website"`、`position:absolute; left:-9999px`。`display:none` は不可）
- Turnstile ウィジェット
- **同意チェックまで送信ボタンを `disabled`（`--color-disabled`）**
- 文字数カウンター

送信先 `/api/contact`。`worker/index.ts` がルーティングする。

**`worker/contact.ts` の `validate()` と `src/lib/schema/contact.ts` の zod は
同じ条件を保つこと。** 片方だけ直すと、開発者ツールから制限を回避できてしまう。

### 6-3. 到達テスト

- [ ] Gmail（迷惑メール判定されないか）
- [ ] Outlook / Microsoft 365
- [ ] キャリアメール（docomo / au / SoftBank）
- [ ] 管理者通知と自動返信の両方
- [ ] 10分に4回で 429 になるか
- [ ] ハニーポットに値を入れると 200 が返りメールは飛ばないか
- [ ] Turnstile 無しで直接叩くと 400 か
- [ ] ブラウザ側の文字数制限を外してもサーバーで弾かれるか
- [ ] `/api/rebuild` を署名なしで叩くと 403 か

---

## Phase 7. SEO・構造化データ（0.5人日）

```
app/sitemap.ts    ※ 静的エクスポートでは全URLを絶対URLにすること
app/robots.ts
lib/jsonld.ts     Organization / BreadcrumbList / Article
                  JobPosting / FAQPage
```

**参考サイトが取りこぼしている `FAQPage` と `JobPosting` は必ず入れる。**
リッチリザルトテストで検証すること。

OGP 画像は動的生成できないので `public/images/og/` に固定画像を置く。

---

## Phase 8. アニメーション（3.2人日）

**全ページのマークアップ完成後に着手。** 先にやるとレイアウト変更のたびに
発火位置の再調整が発生する。

```
1. SmoothScroll  2. ScrollReveal  3. Marquee  4. Marker（#2E891E）
5. RollText      6. Collage       7. ScrollBgSection
```

**7番の前に、参考サイトをゆっくりスクロールして背景色が本当に変化するか確認。**
変化しないなら不要。0.5人日削減できる。

実装後、`prefers-reduced-motion: reduce` で全アニメーションが停止することを確認。

---

## Phase 9. 検証（1.5人日）

```
Lighthouse（モバイル）
  Performance 90+ / Accessibility 95+ / Best Practices 95+ / SEO 100
```

**iOS Safari の実機確認は必須。** `100vh` のずれ（`100dvh` を使う）、
追従CTAの `position: fixed`、Lenis と `overflow: hidden` の競合が問題になりやすい。

- [ ] キーボードのみで全導線を辿れる
- [ ] フォーカスリングが見える
- [ ] CLS 0.1 以下（`Picture.tsx` の width/height 指定漏れ）
- [ ] 404 が `out/404.html` で返る（`not_found_handling = "404-page"`）

---

## Phase 10. 公開・DNS切替（0.3人日）

### 10-1. URL の差分を確認

現行 STUDIO サイトと URL 構造が変わるなら **301 リダイレクトが必須**。
怠ると既存の被リンクと検索順位を失う。

静的エクスポートでは `next.config.ts` の `redirects()` が効かない。
`public/_redirects` に書く。

```
/旧パス    /新パス    301
```

### 10-2. 切替

1. **24時間前に現行DNSの TTL を 300秒 に下げる**
2. Cloudflare ダッシュボード > Workers & Pages > maskoff-web > Settings >
   Domains & Routes で `maskoff.co.jp` を Custom Domain として追加
3. ネームサーバーを Cloudflare に向ける
4. 証明書の自動発行を確認
5. `workers_dev = false` になっていることを確認
6. **旧サイト（STUDIO）は1〜2週間残す**

### 10-3. 公開後

- [ ] Search Console 登録、sitemap.xml 送信
- [ ] **URL検査 > レンダリング済みHTML に本文が入っているか確認**
      （現行サイトの懸念点だった箇所。静的エクスポートなら確実に入る）
- [ ] GA4 の計測確認
- [ ] 主要ページの OGP を SNS で共有して確認
- [ ] 本番からフォームを1通送って到達確認
- [ ] microCMS で記事を1件更新し、2分以内に反映されるか確認

---

## 工数サマリ

| Phase | 内容 | 人日 |
|---|---|---|
| 0 | アカウント準備 | 0.2 |
| 1 | プロジェクト初期化 | 0.3 |
| 2 | Workers 疎通・CI設定 | 0.4 |
| 3 | microCMS セットアップ | 0.4 |
| 4 | 基盤実装（Picture.tsx 含む） | 0.9 |
| 5 | ページ実装 | 2.7 |
| 6 | フォーム・メール | 0.7 |
| 7 | SEO・構造化データ | 0.5 |
| 8 | アニメーション | 3.2 |
| 9 | 検証 | 1.5 |
| 10 | 公開・DNS切替 | 0.3 |
| | **実装計** | **11.1** |
| | 要件定義 / デザイン / 素材 | 6.3 |
| | **総計** | **17.4人日** |

Pages 構成（17.3人日）との差は 0.1人日。`/api/rebuild` の自作分だけ増える。
その代わり、将来の Pages → Workers 移行が発生しない。
