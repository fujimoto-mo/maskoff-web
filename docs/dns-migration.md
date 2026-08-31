# ドメイン設定手順（maskoff.co.jp）

Workers Custom Domain を使うには、**ドメインのネームサーバーを Cloudflare に
向ける必要がある**。DNS の管理をレジストラから Cloudflare へ移す作業になる。

ドメイン自体の移管（レジストラの変更）は不要。Cloudflare Registrar は
`.co.jp` に対応していないので、**ドメインは今のレジストラのまま、
ネームサーバーだけを変更する。**

---

## ⚠️ 最大のリスクはメールが止まること

ネームサーバーを切り替えた瞬間、**Cloudflare に登録していないレコードは
すべて消滅する。**

`info@maskoff.co.jp` などでメールを運用している場合、MX レコードを
移し忘れると**その瞬間から受信が止まる**。しかも送信側にはエラーが返らず、
数日気づかないことがある。

Cloudflare にはサイト追加時の自動スキャン機能があるが、**完璧ではない。**
特に以下は取りこぼしやすい。

- TXT レコード（SPF、ドメイン所有権確認、各種サービスの認証）
- `_dmarc` / `_domainkey` などのアンダースコア付きサブドメイン
- 使っていないつもりのサブドメイン（`mail.` `smtp.` `webmail.` など）
- SRV レコード

**必ず手動で照合すること。** 手順1がこの作業。

---

## 手順1. 現行DNSレコードを全件控える（切替の1週間前）

現在のレジストラまたはDNS管理画面から、**全レコードをスクリーンショットか
テキストで保存する。** 特にメール系は1件も落とさない。

コマンドでも確認できる。

```bash
# ネームサーバーを確認（どこでDNSを管理しているか）
dig NS maskoff.co.jp +short

# メール系（★最重要）
dig MX  maskoff.co.jp +short
dig TXT maskoff.co.jp +short
dig TXT _dmarc.maskoff.co.jp +short

# サイト本体
dig A     maskoff.co.jp +short
dig CNAME www.maskoff.co.jp +short
```

### 記録用チェックリスト

| 種別 | ホスト名 | 値 | 用途 | 移行済 |
|---|---|---|---|---|
| A / CNAME | `@` | | 現行サイト（STUDIO） | ☐ |
| CNAME | `www` | | | ☐ |
| **MX** | `@` | | **メール受信** | ☐ |
| **TXT** | `@` | `v=spf1 ...` | **SPF** | ☐ |
| TXT | `_dmarc` | | DMARC | ☐ |
| TXT | `*._domainkey` | | DKIM | ☐ |
| TXT | `@` | `google-site-verification=...` | Search Console | ☐ |
| その他 | | | | ☐ |

**メール系（MX / SPF / DKIM / DMARC）は全社の業務に直結する。**
社内で他に使っているサービス（グループウェア、SFA、eKYC等）がドメイン認証を
していないかも確認すること。

---

## 手順2. Cloudflare にサイトを追加（切替の3日前）

**この段階ではまだ何も切り替わらない。** 安全に準備できる。

1. Cloudflare ダッシュボード > Add a site
2. `maskoff.co.jp` を入力
3. プランは **Free** を選択
4. 自動スキャンが走り、検出できたレコードが一覧表示される
5. **手順1のチェックリストと1件ずつ照合し、不足分を手動で追加する**

### プロキシ設定（オレンジ雲）の判断

| レコード | プロキシ | 理由 |
|---|---|---|
| `@` / `www`（サイト本体） | **ON**（オレンジ） | Worker で配信するため |
| **MX** | 設定不可 | Cloudflare はメールをプロキシしない |
| **メール系の A / CNAME**<br>（`mail.` など） | **OFF**（グレー） | ONにするとメールが届かなくなる |
| **SPF / DKIM / DMARC の TXT** | 該当なし | TXT にプロキシ設定はない |

**メール関連のホストは必ずグレー（DNS only）にすること。**
オレンジにするとCloudflareのIPが返り、メールサーバーに到達しなくなる。

6. 画面に表示される**Cloudflare のネームサーバー2つを控える**

```
例）
  xxxx.ns.cloudflare.com
  yyyy.ns.cloudflare.com
```

---

## 手順3. TTL を下げる（切替の24時間前）

**現行のDNS管理画面**で、主要レコードの TTL を `300`（5分）に下げる。

切り戻しが必要になったとき、これをやっておくかどうかで復旧時間が
数時間変わる。

---

## 手順4. レジストラでネームサーバーを変更（切替当日）

**ここが実際の切替ポイント。** ドメインを取得したレジストラの管理画面で行う。

| レジストラ | 画面の場所 |
|---|---|
| お名前.com | ドメイン設定 > ネームサーバーの変更 > その他のサービス |
| ムームードメイン | ドメイン操作 > ネームサーバ設定変更 > GMOペパボ以外 |
| Xserverドメイン | ドメイン一覧 > ネームサーバー設定 > その他のサービスで利用 |
| さくらインターネット | ドメイン/SSL > ネームサーバ変更 |
| GMOブランドセキュリティ等 | 担当者へ依頼 |

手順2で控えた Cloudflare のネームサーバー2つを設定する。

### `.co.jp` の反映時間

`.co.jp` は属性型JPドメインで、変更が JPRS を経由する。
**汎用ドメインより反映が遅く、数時間〜24時間かかることがある。**
金曜夕方や連休前の作業は避けること。

```bash
# 反映確認
dig NS maskoff.co.jp +short
# → xxxx.ns.cloudflare.com が返れば完了
```

Cloudflare ダッシュボード上でも、ステータスが「Active」になる。

---

## 手順5. Worker にカスタムドメインを設定

ネームサーバーの反映が完了してから行う。

1. Cloudflare > Workers & Pages > `maskoff-web`
2. Settings > Domains & Routes > Add > Custom domain
3. `maskoff.co.jp` を追加
4. `www.maskoff.co.jp` も追加（またはリダイレクト設定）

**追加すると Cloudflare が自動でDNSレコードを作成する。**
手順2で登録した現行サイト（STUDIO）向けの A / CNAME と衝突するので、
**古い方を削除する。**

証明書は自動発行される。反映まで数分。

### wrangler.toml の確認

```toml
workers_dev = false   # 公開後は false のままにする
```

`true` のままだと `maskoff-web.<account>.workers.dev` でも同じ内容が
公開され、重複コンテンツとして扱われる可能性がある。

---

## 手順6. Resend のDNSレコードを追加

Cloudflare DNS に登録する。**すべてプロキシ OFF（グレー）。**

```
TXT   send.maskoff.co.jp                v=spf1 include:amazonses.com ~all
TXT   resend._domainkey.maskoff.co.jp   （Resend が表示する値）
TXT   _dmarc.maskoff.co.jp              v=DMARC1; p=none; rua=mailto:dmarc@maskoff.co.jp
```

**既に SPF レコードがある場合、2つ目を追加してはいけない。**
SPF はドメインに1つしか置けず、2つあると両方無効になる。既存の値に
`include:` を追記して1行にまとめる。

```
❌ v=spf1 include:_spf.google.com ~all
   v=spf1 include:amazonses.com ~all     ← 2行あるとSPF全体が壊れる

✅ v=spf1 include:_spf.google.com include:amazonses.com ~all
```

---

## 手順7. 切替後の確認（当日中）

### サイト

- [ ] `https://maskoff.co.jp` が新サイトを表示する
- [ ] `https://www.maskoff.co.jp` が正しく動く
- [ ] `http://` でアクセスすると `https://` にリダイレクトされる
- [ ] 証明書が有効（ブラウザの鍵マーク）
- [ ] `/api/contact` からフォームが送信できる
- [ ] 404 ページが表示される

### メール（★最優先で確認）

- [ ] **外部から `info@maskoff.co.jp` 宛にメールを送り、受信できる**
- [ ] `info@maskoff.co.jp` から外部へ送信できる
- [ ] フォームの管理者通知が届く
- [ ] フォームの自動返信が Gmail に届く（迷惑メール判定されないか）

```bash
# SPF が1行にまとまっているか確認
dig TXT maskoff.co.jp +short | grep spf
```

### SEO

- [ ] Search Console のプロパティが引き続き有効
- [ ] `sitemap.xml` を送信
- [ ] URL検査 > レンダリング済みHTML に本文が入っている
- [ ] 旧URLからのリダイレクトが効く（`public/_redirects`）

---

## 手順8. 後片付け（1〜2週間後）

- [ ] 問題がないことを確認してから、**STUDIO を解約する**
- [ ] TTL を通常値（3600 など）に戻す
- [ ] Search Console でカバレッジエラーが増えていないか確認

**STUDIO はすぐ解約しないこと。** 切り戻しが必要になったとき、
契約が残っていれば数分で復旧できる。

---

## 切り戻し手順

サイトに致命的な問題が出た場合。

1. レジストラでネームサーバーを**元の値に戻す**
2. TTL を下げてあれば5〜30分で復旧
3. `.co.jp` は反映が遅いので、数時間かかる可能性を見込む

**メールが止まった場合は切り戻しではなく、Cloudflare DNS に
MX レコードを追加するほうが速い。** 数分で復旧する。
手順1のチェックリストがここで効く。
