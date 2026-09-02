import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/company/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/contact/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/recruit/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/TRANSACTIONACT/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/PRIVACYPOLICY/`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
