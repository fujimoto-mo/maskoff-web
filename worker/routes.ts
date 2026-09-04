/**
 * Pages の _routes.json と Worker 内の判定の単一ソース。
 * - STATIC_PREFIXES: Function（_worker.js）を通さず Pages の静的配信に任せる（無課金・メンテ中も配信）
 * - LEGACY_PATHS: 旧 URL。Function を通すと public/_redirects が効かないため除外し、静的側の 301 に任せる
 * scripts/build-worker.mjs がこの定義から out/_routes.json を生成する（exclude は include より常に優先）。
 */
export const STATIC_PREFIXES = ["/_next/", "/images/", "/fonts/", "/videos/"] as const;
export const STATIC_FILES = ["/favicon.ico", "/robots.txt", "/sitemap.xml"] as const;
export const LEGACY_PATHS = ["/PRIVACYPOLICY", "/PRIVACYPOLICY/", "/TRANSACTIONACT", "/TRANSACTIONACT/", "/privacy-policy", "/privacy-policy/"] as const;

/** 静的アセットか（メンテナンス中も 503 にせず配信する対象） */
export function isStaticAsset(pathname: string): boolean {
  return STATIC_PREFIXES.some((p) => pathname.startsWith(p)) || (STATIC_FILES as readonly string[]).includes(pathname);
}

/** out/_routes.json の内容（Pages Functions の適用範囲） */
export function routesJson() {
  return {
    version: 1,
    include: ["/*"],
    exclude: [...STATIC_PREFIXES.map((p) => `${p}*`), ...STATIC_FILES, ...LEGACY_PATHS],
  };
}

/**
 * www → apex の 301 先。正規 URL（NEXT_PUBLIC_SITE_URL）の "www." 付きホストで来たときだけ返す。
 * プレビュー（*.pages.dev）やローカルはそのまま。
 */
export function canonicalRedirect(requestUrl: URL, siteUrl: string | undefined): string | null {
  if (!siteUrl) return null;
  let canonical: URL;
  try {
    canonical = new URL(siteUrl);
  } catch {
    return null;
  }
  if (requestUrl.hostname !== `www.${canonical.hostname}`) return null;
  return `${canonical.origin}${requestUrl.pathname}${requestUrl.search}`;
}
