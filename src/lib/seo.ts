import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/**
 * ページごとの Open Graph。Next の metadata は openGraph を丸ごと上書きする（浅いマージ）ため、
 * layout の共通値（siteName / locale / OGP 画像）をここで足して各ページの metadata に渡す。url を入れると og:url が出る。
 * @example export const metadata: Metadata = { title: "会社情報", description: "…", alternates: { canonical: "/company/" }, openGraph: openGraph("/company/") };
 * @example openGraph(`/news/${slug}/`, "article")  ← NEWS / NOTICE 詳細
 */
export function openGraph(path: string, type: "website" | "article" = "website"): NonNullable<Metadata["openGraph"]> {
  const base = { siteName: SITE.name, locale: "ja_JP", url: path, images: ["/images/ogp.png"] };
  return type === "article" ? { ...base, type: "article" } : { ...base, type: "website" };
}
