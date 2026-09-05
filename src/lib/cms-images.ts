/**
 * microCMS の画像をビルド時に取得して public/images/cms/ に同梱するための純粋関数（CLAUDE.md §2-4: 画像を microCMS から直接配信しない）。
 * scripts/fetch-cms-images.mjs が cmsTargets() で取得先とファイル名を決め、src/lib/images/cms-manifest.json を書く。
 * getNews() が localizeImage() でサムネイルの URL をローカルパスに差し替える。
 */
export type CmsImage = { url: string; width: number; height: number; avif?: string; webp?: string };
export type CmsEntry = { src: string; width: number; height: number; avif: string; webp: string };
/** キーは microCMS 上の元 URL */
export type CmsManifest = Record<string, CmsEntry>;

export const CMS_DIR = "/images/cms";
/** 取得時の最大幅（詳細ページの表示幅 720px × 2 倍に余裕）。microCMS の画像 API（imgix）で縮小・変換する */
export const CMS_MAX_WIDTH = 1600;

function extOf(url: string): string {
  const m = new URL(url).pathname.match(/\.(jpe?g|png|gif|webp)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

/** 取得する 3 形式（AVIF / WebP / 元形式のフォールバック）と、同梱後の manifest エントリ */
export function cmsTargets(remoteUrl: string, name: string, width: number, height: number, maxWidth = CMS_MAX_WIDTH) {
  const scale = width > maxWidth ? maxWidth / width : 1;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const ext = extOf(remoteUrl);
  const base = `${CMS_DIR}/${name}`;
  const q = (params: string) => `${remoteUrl}?${params}&w=${w}`;
  const entry: CmsEntry = { src: `${base}.${ext}`, width: w, height: h, avif: `${base}.avif`, webp: `${base}.webp` };
  const downloads = [
    { url: q("fm=avif&q=55"), file: entry.avif },
    { url: q("fm=webp&q=78"), file: entry.webp },
    { url: q("q=85"), file: entry.src },
  ];
  return { entry, downloads };
}

/** manifest に載っていればローカルパスと AVIF / WebP に差し替え、無ければそのまま返す */
export function localizeImage(img: CmsImage | undefined, manifest: CmsManifest): CmsImage | undefined {
  if (!img) return undefined;
  const e = manifest[img.url];
  if (!e) return img;
  return { url: e.src, width: e.width, height: e.height, avif: e.avif, webp: e.webp };
}
