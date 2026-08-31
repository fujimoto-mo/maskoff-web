import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { JsonLd } from "@/components/JsonLd";
import { cms, fmtDate } from "@/lib/cms";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await cms.news()).map((n) => ({ id: n.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await cms.newsById((await params).id);
  return { title: n?.title, openGraph: n?.thumbnail ? { images: [n.thumbnail.url] } : undefined };
}

export default async function NewsDetail({ params }: Props) {
  const n = await cms.newsById((await params).id);
  if (!n) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "NewsArticle", headline: n.title, datePublished: n.publishedAt, publisher: { "@type": "Organization", name: SITE.name }, image: n.thumbnail?.url }} />
      <PageHead en="NEWS" ja="ニュース" crumbs={[{ href: "/news/", label: "NEWS" }, { label: n.title }]} />
      <article className="section wrap article" style={{ borderTop: 0 }}>
        <div className="article-meta">
          <time dateTime={n.publishedAt}>{fmtDate(n.publishedAt)}</time>
          {n.category && <Link href={`/news/category/${n.category.slug}/`} className="cat" style={{ color: "var(--accent)", fontWeight: 700 }}>{n.category.name}</Link>}
        </div>
        <h1>{n.title}</h1>
        {n.thumbnail && <img src={n.thumbnail.url} alt="" width={n.thumbnail.width} height={n.thumbnail.height} style={{ marginBottom: 40 }} />}
        <div className="prose" dangerouslySetInnerHTML={{ __html: n.body }} />
        <div className="article-foot"><Link href="/news/" className="link-more">ニュース一覧へ</Link></div>
      </article>
    </>
  );
}
