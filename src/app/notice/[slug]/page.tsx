import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import { formatDate } from "@/lib/date";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { getNotice } from "@/lib/microcms";
import { SITE } from "@/lib/site";
import { decodeSlug } from "@/lib/slug";

type Params = { slug: string };

/** 静的エクスポート必須（CLAUDE.md §2-5） */
export async function generateStaticParams(): Promise<Params[]> {
  return (await getNotice()).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const item = (await getNotice()).find((n) => n.slug === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: `${item.title}（${formatDate(item.publishedDate)}）— 株式会社MasKOFFからのお知らせ。`,
    alternates: { canonical: `/notice/${encodeURIComponent(slug)}/` },
  };
}

/** NOTICE 詳細。本文は microCMS のリッチテキスト（HTML）をそのまま描画する */
export default async function NoticeDetailPage({ params }: { params: Promise<Params> }) {
  const slug = decodeSlug((await params).slug);
  const item = (await getNotice()).find((n) => n.slug === slug);
  if (!item) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "HOME", path: "/" },
            { name: "お知らせ", path: "/notice/" },
            { name: item.title, path: `/notice/${slug}/` },
          ],
          SITE.url,
        )}
      />
      <article className="wrap section-pad">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">NOTICE / お知らせ</p>
        <time dateTime={item.publishedDate} className="mt-6 block font-display text-caption tabular-nums text-fg-muted">
          {formatDate(item.publishedDate)}
        </time>
        <h1 className="mt-2 max-w-[820px] text-[clamp(22px,3vw,34px)] font-bold leading-[1.5] tracking-[-.02em] text-fg">{item.title}</h1>
        <div
          className="mt-10 max-w-[720px] text-body leading-[2.1] text-fg-body [&_p]:mt-4 [&_p:first-child]:mt-0 [&_strong]:font-bold [&_strong]:text-fg"
          dangerouslySetInnerHTML={{ __html: item.body }}
        />
        <div className="mt-14">
          <Button href="/notice/" variant="line">
            お知らせ一覧へ戻る
          </Button>
        </div>
      </article>
    </>
  );
}
