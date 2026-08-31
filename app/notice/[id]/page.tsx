import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { cms, fmtDate } from "@/lib/cms";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await cms.notice()).map((n) => ({ id: n.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: (await cms.noticeById((await params).id))?.title };
}

export default async function NoticeDetail({ params }: Props) {
  const n = await cms.noticeById((await params).id);
  if (!n) notFound();
  return (
    <>
      <PageHead en="NOTICE" ja="お知らせ" crumbs={[{ href: "/notice/", label: "NOTICE" }, { label: n.title }]} />
      <article className="section wrap article" style={{ borderTop: 0 }}>
        <div className="article-meta"><time dateTime={n.publishedAt}>{fmtDate(n.publishedAt)}</time></div>
        <h1>{n.title}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: n.body }} />
        <div className="article-foot"><Link href="/notice/" className="link-more">お知らせ一覧へ</Link></div>
      </article>
    </>
  );
}
