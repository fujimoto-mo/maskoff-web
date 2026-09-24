import type { Metadata } from "next";
import { openGraph } from "@/lib/seo";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/date";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getNotice } from "@/lib/microcms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "お知らせ一覧",
  description: "株式会社MasKOFFからのお知らせ一覧。システムメンテナンス、年末年始休業、重要なお知らせや注意喚起など、サービスのご利用に関わる情報を掲載しています。",
  alternates: { canonical: "/notice/" },
  openGraph: openGraph("/notice/"),
};

/** NOTICE 一覧。microCMS `notice`（未設定時はサンプル）を新しい順にすべて表示 */
export default async function NoticeIndexPage() {
  const items = await getNotice();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "お知らせ", path: "/notice/" }], SITE.url)} />
      <section className="wrap section-pad">
        <SectionHeading as="h1" en="NOTICE" ja="お知らせ" />
        <ul className="border-t border-border">
          {items.map((n) => (
            <li key={n.id} className="border-b border-border">
              <Link href={`/notice/${n.slug}/`} className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 py-6 max-sp:grid-cols-1 max-sp:gap-y-1.5">
                <time dateTime={n.publishedDate} className="font-display text-caption tabular-nums text-fg-muted">
                  {formatDate(n.publishedDate)}
                </time>
                <span className="text-body font-bold text-fg transition-colors group-hover:text-fg-muted">{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
