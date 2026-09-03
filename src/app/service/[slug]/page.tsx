import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import ServiceCta from "@/components/sections/ServiceCta";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

type Params = { slug: string };

/** 静的エクスポート必須（CLAUDE.md §2-5） */
export function generateStaticParams(): Params[] {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.lead,
    alternates: { canonical: `/service/${slug}/` },
  };
}

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/** SERVICE 詳細。一覧（/service/）と HOME のカードから遷移。前後の事業へ回遊できる */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const idx = SERVICES.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const s = SERVICES[idx];
  const prev = SERVICES[(idx + SERVICES.length - 1) % SERVICES.length];
  const next = SERVICES[(idx + 1) % SERVICES.length];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.description,
          url: `${SITE.url}/service/${s.slug}/`,
          provider: {
            "@type": "Organization",
            name: SITE.name,
            url: `${SITE.url}/`,
          },
          areaServed: "JP",
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "HOME", path: "/" },
            { name: "事業内容", path: "/service/" },
            { name: s.title, path: `/service/${s.slug}/` },
          ],
          SITE.url,
        )}
      />

      {/* ヒーロー */}
      <section className="wrap pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
          MASKOFF.CO.JP / SERVICE / {s.en}
        </p>
        <p className="mt-8 flex items-baseline gap-5">
          <span className="font-display text-[64px] font-extrabold leading-none tracking-[-.04em] text-marker max-sp:text-[48px]">
            {s.num}
          </span>
          <span className="font-display text-[13px] font-medium tracking-[.2em] text-fg-muted">
            {s.en}
          </span>
        </p>
        <h1 className="mt-5 text-[clamp(30px,4.5vw,56px)] font-black leading-[1.35] tracking-[-.02em] text-fg [text-wrap:pretty]">
          {s.title}
        </h1>
        <p className="mt-6 max-w-[720px] text-[16px] font-medium leading-[1.9] text-fg-body max-sp:text-[14px]">
          {s.lead}
        </p>
      </section>

      {/* キービジュアル（SAMPLE: 仮画像。実写真に差し替える） */}
      <div className="wrap">
        <div
          data-reveal="up"
          className="h-[clamp(240px,40vw,520px)] overflow-hidden bg-surface"
        >
          <Picture
            src={s.image}
            alt=""
            sizes="100vw"
            priority
            className="block size-full"
            imgClassName="size-full object-cover"
          />
        </div>
      </div>

      <section className="wrap section-pad">
        <SectionHeading en="OVERVIEW" ja="事業概要" />
        <div className="grid gap-12 pc:grid-cols-[1fr_320px]">
          <p
            data-reveal="up"
            className="max-w-[720px] text-body leading-[2.2] text-fg-body"
          >
            {s.description}
          </p>
          <div data-reveal="up" style={rd(1)}>
            <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
              KEYWORDS
            </p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {s.tags.map((t) => (
                <li
                  key={t}
                  className="border border-border px-3.5 py-1.5 font-display text-[11px] font-medium tracking-[.1em] text-fg-body"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 前後の事業 */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en={"OTHER\nSERVICES"} ja="その他の事業" />
        <nav
          aria-label="前後の事業"
          className="grid border-t border-border pc:grid-cols-2 pc:gap-x-12"
        >
          {[
            { label: "PREV", item: prev },
            { label: "NEXT", item: next },
          ].map(({ label, item }, i) => (
            <Link
              key={label}
              href={`/service/${item.slug}/`}
              data-reveal="up"
              style={rd(i)}
              className="group flex items-center gap-5 border-b border-border py-6 transition-colors hover:text-marker"
            >
              <span className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
                {label}
              </span>
              <span className="font-display text-[22px] font-extrabold leading-none tracking-[-.04em] text-marker">
                {item.num}
              </span>
              <span className="text-[15px] font-bold text-fg transition-colors group-hover:text-marker">
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
        <p data-reveal="up" style={rd(2)} className="mt-10">
          <Button href="/service/" variant="line">
            事業一覧へ戻る
          </Button>
        </p>
      </section>

      <ServiceCta />
    </>
  );
}
