/**
 * メンテナンス画面（HTTP 503）。wrangler.toml の [vars] MAINTENANCE を "1" にして push すると
 * index.ts が /api/* 以外の全リクエストにこれを返す（Google は一時停止と解釈しインデックスを保つ）。
 *
 * Next のビルドに依存しない自己完結 HTML にしている（ビルドが壊れている時こそ出したい画面のため）。
 * ロゴとフォントは /images/* /fonts/* から読む。どちらも _routes.json（worker/routes.ts）で Function の対象外なので
 * メンテ中も Worker を通らずそのまま配信される。色・余白の値は src/styles/tokens.css と同じ。
 */
export function maintenanceHtml(email: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>メンテナンス中｜株式会社MasKOFF</title>
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/inter-tight/latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:"Inter Tight";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/inter-tight/latin.woff2) format("woff2")}
:root{--pad:32px;--fg:#0A0A0A;--body:#444444;--muted:#6B6B68}
@media (width<601px){:root{--pad:20px}}
*{box-sizing:border-box;margin:0}
html{background:#fff;color:var(--body);-webkit-font-smoothing:antialiased}
body{min-height:100dvh;display:flex;flex-direction:column;justify-content:space-between;padding:20px var(--pad);font:400 14px/1.8 "Noto Sans JP",system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif}
@media (width<601px){body{font-size:13px}}
.logo{display:flex;align-items:center;gap:8px;font:800 20px/1 "Inter Tight",system-ui,sans-serif;letter-spacing:-.04em;color:var(--fg)}
.logo img{display:block;width:28px;height:28px;border-radius:22%}
.sec{padding:clamp(80px,10vw,132px) 0 clamp(92px,11vw,144px)}
h1{margin-left:-.045em;font:700 clamp(27px,4.8vw,46px)/1 "Inter Tight",system-ui,sans-serif;letter-spacing:-.045em;color:var(--fg)}
@media (width<601px){h1{font-size:min(13vw,60px)}}
.ja{margin:6px 0 40px 3px;font-size:14px;font-weight:500;color:var(--muted)}
@media (width<601px){.ja{margin-bottom:32px;font-size:13px}}
p+p{margin-top:16px}
a{color:var(--fg);text-decoration:underline;text-underline-offset:4px;transition:opacity .2s}
a:hover{opacity:.7}
.copy{font:400 12px/1.8 "Inter Tight",system-ui,sans-serif;letter-spacing:.06em;color:var(--muted)}
</style>
</head>
<body>
<p class="logo"><img src="/images/logo-mark.png" alt="" width="28" height="28">MasKOFF</p>
<main class="sec">
<h1>MAINTENANCE</h1>
<p class="ja">ただいまメンテナンス中です</p>
<p>現在、サイトのメンテナンスを行っております。<br>ご不便をおかけしますが、しばらく経ってから再度アクセスしてください。</p>
<p>お急ぎのご用件は <a href="mailto:${email}">${email}</a> までご連絡ください。</p>
</main>
<p class="copy">© 株式会社MasKOFF</p>
</body>
</html>
`;
}

/** 503 + Retry-After（1 時間）+ no-store。CDN・ブラウザにメンテ画面をキャッシュさせない */
export function maintenanceResponse(email: string): Response {
  return new Response(maintenanceHtml(email), {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "3600",
      "cache-control": "no-store",
    },
  });
}
