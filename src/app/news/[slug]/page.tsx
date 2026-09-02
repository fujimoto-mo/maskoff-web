import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import { formatDate } from "@/lib/date";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getNews, NEWS_CATEGORY_LABELS } from "@/lib/microcms";
import { SITE } from "@/lib/site";

type Params = { slug: string };

/** 静的エクスポート必須（CLAUDE.md §2-5） */
export async function generateStaticParams(): Promise<Params[]> {
  return (await getNews()).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = (await getNews()).find((n) => n.slug === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: `${item.title}（${formatDate(item.publishedDate)}）— 株式会社MasKOFFのニュース。`,
    alternates: { canonical: `/news/${slug}/` },
  };
}

/** NEWS 詳細。Article 構造化データ付き（CLAUDE.md §10） */
export default async function NewsDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = (await getNews()).find((n) => n.slug === slug);
  if (!item) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.title,
          datePublished: item.publishedDate,
          dateModified: item.updatedAt ?? item.publishedDate,
          mainEntityOfPage: `${SITE.url}/news/${slug}/`,
          author: { "@type": "Organization", name: SITE.name, url: `${SITE.url}/` },
          publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/images/logo.png` } },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "HOME", path: "/" },
            { name: "ニュース", path: "/news/" },
            { name: item.title, path: `/news/${slug}/` },
          ],
          SITE.url,
        )}
      />
      <article className="wrap section-pad">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">NEWS / {NEWS_CATEGORY_LABELS[item.category[0] ?? "press"]}</p>
        <time dateTime={item.publishedDate} className="mt-6 block font-display text-caption tabular-nums text-fg-muted">
          {formatDate(item.publishedDate)}
        </time>
        <h1 className="mt-2 max-w-[860px] text-[clamp(22px,3vw,34px)] font-bold leading-[1.5] tracking-[-.02em] text-fg">{item.title}</h1>
        <div
          className="mt-10 max-w-[720px] text-body leading-[2.1] text-fg-body [&_p]:mt-4 [&_p:first-child]:mt-0 [&_strong]:font-bold [&_strong]:text-fg [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-marker"
          dangerouslySetInnerHTML={{ __html: item.body }}
        />
        <div className="mt-14">
          <Button href="/news/" variant="line">
            ニュース一覧へ戻る
          </Button>
        </div>
      </article>
    </>
  );
}
