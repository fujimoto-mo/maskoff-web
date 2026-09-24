/**
 * sitemap の lastmod に使う日付。公開日と microCMS の最終更新（revisedAt / updatedAt）のうち最も新しいものを返す。
 * 公開日より前の更新日（下書き時の編集）は無視する。日付として読めない値は捨てる。
 * @example lastModifiedOf({ publishedDate: "2026-09-01T00:00:00.000Z", revisedAt: "2026-09-10T03:00:00.000Z" }) // → 2026-09-10 の Date
 */
export function lastModifiedOf(item: { publishedDate: string; revisedAt?: string; updatedAt?: string }): Date {
  const published = new Date(item.publishedDate);
  let latest = published;
  for (const v of [item.revisedAt, item.updatedAt]) {
    if (!v) continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime()) && d > latest) latest = d;
  }
  return latest;
}
