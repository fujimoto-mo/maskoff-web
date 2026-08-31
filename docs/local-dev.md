# 開発手順（Windows / WSL2）

日々の作業手順。プロジェクト全体の進行は `docs/setup-workers.md` を参照。

---

## 1. 初回セットアップ（1回だけ）

### 1-1. WSL2

PowerShell を管理者権限で開く。

```powershell
wsl --install -d Ubuntu-24.04
```

再起動後、Ubuntu のターミナルで Node を入れる。

```bash
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc
# リポジトリ直下の .node-version / .mise.toml を自動で読む
cd ~/maskoff-web && mise install
node -v    # v24.17.0
```

VS Code は Windows 側にインストールし、**WSL 拡張機能**を入れる。

### 1-2. リポジトリ

**必ず WSL のホームディレクトリに置く。**

```bash
cd ~
git clone git@github.com:＜owner＞/maskoff-web.git
cd maskoff-web
code .          # WSL 拡張で VS Code が開く
```

`/mnt/c/` 配下に置くと I/O が10倍以上遅くなる。`npm install` が数分かかり、
HMR も体感で遅れる。エクスプローラーからは
`\\wsl$\Ubuntu-24.04\home\<user>\maskoff-web` で開ける。

### 1-3. 改行コード

**プロジェクト開始時に必ず設定する。** 後から直すと全ファイルが差分になる。

```bash
git config --global core.autocrlf input
```

リポジトリ直下に `.gitattributes`：

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.woff2 binary
```

### 1-4. 依存関係

```bash
npm ci
```

`npm install` ではなく `npm ci` を使う。`package-lock.json` どおりに入るので
CI と完全に一致する。

### 1-5. 環境変数（2ファイルある）

**混同しやすい。用途が違う。**

| ファイル | 読む人 | 用途 |
|---|---|---|
| `.env.local` | Next.js | ビルド時。microCMS の取得など |
| `.dev.vars` | Wrangler | Worker 実行時。Resend / Turnstile など |

```bash
cp .env.example .env.local
```

`.dev.vars` を新規作成する。**WSL 内の VS Code で作ること。**
Windows 側のエディタだと BOM 付きになり、Wrangler が値を読み違える。

```bash
# .dev.vars
RESEND_API_KEY="re_xxx"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
MICROCMS_WEBHOOK_SECRET="local-dummy"
GITHUB_DISPATCH_TOKEN=""
SLACK_WEBHOOK_URL=""
SITE_URL="http://localhost:8787"
CONTACT_FROM_EMAIL="noreply@maskoff.co.jp"
CONTACT_TO_EMAIL="dev@example.com"
GITHUB_REPO="＜owner＞/maskoff-web"
```

Turnstile は Cloudflare のテスト用キーを使う。本物のキーで localhost を
登録するより確実。

```
常に成功  サイトキー 1x00000000000000000000AA
          シークレット 1x0000000000000000000000000000000AA
常に失敗  2x00000000000000000000AB / 2x0000000000000000000000000000000AA
```

`.gitignore` に両方入っていることを確認する。

```
.env.local
.dev.vars
.wrangler/
```

### 1-6. Cloudflare ログインと KV

```bash
npx wrangler login
npx wrangler kv namespace create RATE_LIMIT
npx wrangler kv namespace create RATE_LIMIT --preview
```

出力された id を `wrangler.toml` に貼る。

### 1-7. 疎通確認

```bash
npm run dev        # http://localhost:3000 が開けば OK
```

---

## 2. 日々の開発ループ

### 2つのモードを使い分ける

```bash
npm run dev        # localhost:3000  HMR あり。/api は動かない
npm run preview    # localhost:8787  HMR なし。/api も KV も動く
```

| 作業 | 使うモード |
|---|---|
| ページ実装 | `dev` |
| コンポーネント作成 | `dev` |
| アニメーション調整 | `dev` |
| microCMS の表示確認 | `dev` |
| **フォーム送信** | **`preview`** |
| **レート制限の確認** | **`preview`** |
| **404 の挙動** | **`preview`** |

`npm run dev` で `/api/contact` が404になるのは正常。`worker/` は Next.js の
管轄外なので、Wrangler を通さないと動かない。

### 基本の流れ

```bash
git switch -c feat/section-service
# ... 実装 ...
npm run dev              # 見た目を確認
npm run preview          # Worker が絡むなら
npx tsc --noEmit         # 型チェック
npm run lint
git add -A && git commit -m "feat: SERVICE セクションを実装"
git push -u origin feat/section-service
```

main にマージすると GitHub Actions が走り、自動でデプロイされる。

---

## 3. コンポーネントを1つ作る手順

`SectionHeading` を例に、実際の流れ。

### ① CLAUDE.md で仕様を確認する

書く前に必ず読む。特にこの3点。

```
§4-1  色は定義トークンのみ（Tailwind の gray-500 等は禁止）
§4-3  英字が主・和文が従の見出しパターン
§8    1ファイル1コンポーネント / Server Component が既定
```

### ② Claude Code に指示する

**1コンポーネント1指示にする。** 「7ページ全部作って」は精度が落ちる。

```
CLAUDE.md のトークンに従って components/ui/SectionHeading.tsx を作って。
props は en / ja / as / invert。
PC 38px / SP 27px、和文は 11px で #6B6B68。
max-width コンテナは使わない。
```

### ③ ブラウザで実測する

**目視で合わせない。検証ツールで測る。**

```
見出し           PC 38px  /  SP 27px
和文             11px、色 #6B6B68
左右パディング    PC 35px  /  SP 19px
```

ここがズレたまま7ページ作ると全部やり直しになる。
最初の1つだけは特に丁寧に確認する。

### ④ 型チェックとコミット

```bash
npx tsc --noEmit
git add src/components/ui/SectionHeading.tsx
git commit -m "feat: SectionHeading を追加"
```

---

## 4. 実装の順番

`docs/setup-workers.md` の Phase 4〜8 に対応。依存の少ない順。

```
基盤
  1. types/microcms.ts
  2. lib/microcms.ts
  3. lib/works.ts
  4. components/ui/Picture.tsx      ← next/image の代替
  5. components/ui/SectionHeading.tsx
  6. components/ui/Button.tsx
  7. components/layout/ 一式

ページ
  8.  /company
  9.  /service
  10. /recruit
  11. /news（一覧・詳細・ページネーション）
  12. /notice
  13. /privacy-policy
  14. /contact
  15. /                             ← HOME は最後

仕上げ
  16. SEO・構造化データ
  17. アニメーション                ← ここまで手を付けない
  18. 実機確認
```

**HOME を最後にする。** 各セクションが揃ってから組み立てるほうが速い。

**アニメーションを最後にする。** 先に入れるとレイアウト変更のたびに
ScrollTrigger の発火位置を取り直すことになる。

---

## 5. 実機確認（iOS Safari）

Phase 9 で必須。ローカルの http では Turnstile が正しく動かないので、
`cloudflared` で https のトンネルを張る。

```bash
# 初回のみ
curl -L -o cloudflared \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared && sudo mv cloudflared /usr/local/bin/

# 使うとき
npm run preview                               # ターミナル1
cloudflared tunnel --url http://localhost:8787  # ターミナル2
# → https://xxx.trycloudflare.com が発行される
```

発行された URL を iPhone で開く。**以下は実機でしか再現しない。**

- `100vh` がアドレスバー分ずれる → `100dvh` を使う
- 追従CTAの `position: fixed` が慣性スクロール中に飛ぶ
- Lenis と `overflow: hidden` の競合

---

## 6. トラブルシュート

### `npm run dev` で `/api/contact` が 404

**正常。** `worker/` は Next.js が見ていない。`npm run preview` を使う。

### シークレットが undefined になる

`.env.local` に書いていないか確認する。Worker 用は `.dev.vars`。
Wrangler は `.env.local` を読まない。

### `.dev.vars` の値が正しく読めない

Windows 側のエディタで作って BOM が付いている。WSL 内で作り直す。

### CI だけ落ちる / 全ファイルが差分になる

改行コード。`.gitattributes` と `core.autocrlf input` を確認する。

### HMR が遅い、`npm install` が終わらない

プロジェクトが `/mnt/c/` 配下にある。`~/` に移動する。

### ビルドは通るがデプロイ後に404が増えた

動的ルートの `generateStaticParams` が漏れている。
静的エクスポートでは必須。

### レート制限が解除されない

KV の状態は `.wrangler/state/` に残る。消せばリセットされる。

```bash
rm -rf .wrangler/state
```

### メールが飛んでしまった

ローカルから実送信すると Resend の無料枠を消費する。
`worker/contact.ts` に分岐を入れる。

```ts
if (env.SITE_URL.includes("localhost")) {
  console.log("[mail]", { to, subject });
  return;
}
```

---

## 7. コマンド一覧

```bash
npm run dev            # 開発サーバー（HMR あり）
npm run preview        # build + wrangler dev（Worker 込み）
npm run build          # 本番ビルド（out/ を生成）
npm run deploy         # 手動デプロイ（通常は CI に任せる）
npm run cf-typegen     # wrangler.toml から型を再生成

npx tsc --noEmit       # 型チェック
npm run lint           # ESLint

npx wrangler tail      # 本番 Worker のログをリアルタイム表示
```

`npx wrangler tail` は本番でフォームの不具合を追うときに使う。
`worker/` の `console.log` がそのまま流れてくる。
