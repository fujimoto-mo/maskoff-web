import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/date";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getNews, NEWS_CATEGORY_LABELS } from "@/lib/microcms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "ニュース一覧",
  description: "株式会社MasKOFFのニュース。ブランド情報・インタビュー・お知らせの一覧。",
  alternates: { canonical: "/news/" },
};

/** NEWS 一覧。microCMS `news`（未設定時はサンプル）を新しい順にすべて表示 */
export default async function NewsIndexPage() {
  const items = await getNews();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "ニュース", path: "/news/" }], SITE.url)} />
      <section className="wrap section-pad">
        <SectionHeading en="NEWS" ja="ニュース" />
        <ul className="border-t border-border">
          {items.map((n) => (
            <li key={n.id} className="border-b border-border">
              <Link href={`/news/${n.slug}/`} className="group grid grid-cols-[auto_auto_1fr] items-baseline gap-x-5 py-6 max-sp:grid-cols-[auto_auto] max-sp:gap-y-1.5">
                <time dateTime={n.publishedDate} className="font-display text-caption tabular-nums text-fg-muted">
                  {formatDate(n.publishedDate)}
                </time>
                <span className="rounded-pill border border-border px-2 py-0.5 text-[10px] font-bold tracking-[.06em] text-fg-muted">{NEWS_CATEGORY_LABELS[n.category[0] ?? "press"]}</span>
                <span className="text-body font-bold text-fg transition-colors group-hover:text-fg-muted max-sp:col-span-2">{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
