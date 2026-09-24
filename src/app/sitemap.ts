import type { MetadataRoute } from "next";
import { getNews, getNotice } from "@/lib/microcms";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { lastModifiedOf } from "@/lib/sitemap-date";

export const dynamic = "force-static";

/**
 * sitemap.xml（https://www.maskoff.co.jp/sitemap.xml。Search Console にはこの URL を送信する。robots.txt にも記載）。
 * 静的ページは lastModified を出さない（ビルド日を毎回入れると更新の合図にならない）。NEWS / NOTICE は公開日と microCMS の更新日の新しい方。
 * noindex のページ（/contact/thanks/）と 404 は載せない。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notices = await getNotice();
  const news = await getNews();
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/company/`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/service/`, changeFrequency: "monthly", priority: 0.8 },
    ...SERVICES.map((s) => ({ url: `${SITE.url}/service/${s.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE.url}/contact/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/recruit/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/news/`, changeFrequency: "weekly", priority: 0.6 },
    ...news.map((n) => ({ url: `${SITE.url}/news/${encodeURIComponent(n.slug)}/`, lastModified: lastModifiedOf(n), changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${SITE.url}/notice/`, changeFrequency: "weekly", priority: 0.5 },
    ...notices.map((n) => ({ url: `${SITE.url}/notice/${encodeURIComponent(n.slug)}/`, lastModified: lastModifiedOf(n), changeFrequency: "monthly" as const, priority: 0.4 })),
    { url: `${SITE.url}/transaction/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacypolicy/`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
