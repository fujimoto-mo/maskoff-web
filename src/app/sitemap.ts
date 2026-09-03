import type { MetadataRoute } from "next";
import { getNews, getNotice } from "@/lib/microcms";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notices = await getNotice();
  const news = await getNews();
  return [
    { url: `${SITE.url}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/company/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/service/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...SERVICES.map((s) => ({ url: `${SITE.url}/service/${s.slug}/`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE.url}/contact/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/recruit/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/news/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...news.map((n) => ({ url: `${SITE.url}/news/${n.slug}/`, lastModified: new Date(n.publishedDate), changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${SITE.url}/notice/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    ...notices.map((n) => ({ url: `${SITE.url}/notice/${n.slug}/`, lastModified: new Date(n.publishedDate), changeFrequency: "monthly" as const, priority: 0.4 })),
    { url: `${SITE.url}/transaction/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacypolicy/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
