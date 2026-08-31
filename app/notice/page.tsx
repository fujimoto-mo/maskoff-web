import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { cms, fmtDate } from "@/lib/cms";

export const metadata: Metadata = { title: "お知らせ", description: "営業日・メンテナンスなど、MasKOFFからのお知らせ。" };

export default async function NoticeIndex() {
  const items = await cms.notice();
  return (
    <>
      <PageHead en="NOTICE" ja="お知らせ" crumbs={[{ label: "NOTICE" }]} />
      <section className="section wrap" style={{ borderTop: 0 }}>
        <ul className="list">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={`/notice/${n.id}/`} className="list-row two">
                <time dateTime={n.publishedAt}>{fmtDate(n.publishedAt)}</time>
                <span className="title">{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
