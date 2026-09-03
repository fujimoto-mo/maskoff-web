import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import ServiceCta from "@/components/sections/ServiceCta";
import JsonLd from "@/components/ui/JsonLd";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "事業内容",
  description:
    `株式会社MasKOFFの8つの事業。${SITE.product} エンジニアカリキュラム、求人広告代理店、WEBアプリ開発、キャリア支援、BPO、アパレルコンサルティング、海外越境EC導入支援、中小向けIT導入支援。`,
  alternates: { canonical: "/service/" },
};

const FLOW = [
  { title: "ご相談", text: "フォームからお気軽に。ヒアリングは無料です。" },
  {
    title: "ヒアリング・提案",
    text: "課題を整理し、最適なプランとお見積りをご提案。",
  },
  { title: "ご契約", text: "内容にご納得いただけたら契約を締結します。" },
  { title: "実行・開発", text: "専任チームが設計・制作・運用構築を進めます。" },
  { title: "運用・改善", text: "納品後も効果検証と改善までサポートします。" },
] as const;

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/** SERVICE 一覧。ヘッダー・フッターは共通レイアウト側。デザインは docs/design_handoff_service_page を当サイトのトークンに合わせて調整 */
export default function ServicePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "HOME", path: "/" },
            { name: "事業内容", path: "/service/" },
          ],
          SITE.url,
        )}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "株式会社MasKOFF の事業",
          itemListElement: SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.title,
            url: `${SITE.url}/service/${s.slug}/`,
          })),
        }}
      />

      {/* ヒーロー: SERVICE の 4 行スタック（COMPANY と同じモチーフ） */}
      <section className="wrap overflow-hidden pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
          MASKOFF.CO.JP / SERVICE
        </p>
        <h1
          aria-label="SERVICE"
          className="mt-4 font-display text-[clamp(60px,10vw,140px)] font-extrabold leading-[.9] tracking-[-.04em] text-fg"
        >
          <span aria-hidden className="block">
            SERVICE
          </span>
          <span aria-hidden className="block opacity-40">
            SERVICE
          </span>
          <span aria-hidden className="block opacity-[.18]">
            SERVICE
          </span>
          <span aria-hidden className="-mb-[.35em] block opacity-[.08]">
            SERVICE
          </span>
        </h1>
        <p className="mt-10 text-[16px] font-medium text-fg-body max-sp:text-[14px]">
          事業内容 — 個性と技術で、人と事業を支える8つのサービス。
        </p>
      </section>

      {/* マーキー帯: 8 事業の英字ラベル */}
      <div
        aria-hidden
        className="overflow-hidden border-y border-border py-3 whitespace-nowrap"
      >
        <div className="inline-flex w-max animate-[drift_26s_linear_infinite]">
          {[0, 1].map((k) => (
            <span
              key={k}
              className="pr-6 font-display text-[20px] font-bold tracking-[.06em] text-fg"
            >
              {SERVICES.map((s) => s.en).join(" / ")} /{" "}
            </span>
          ))}
        </div>
      </div>

      {/* 事業一覧: 2 カラム・偶数行は左右反転。960px 以下は 1 カラム（文 → 画像） */}
      <section
        aria-label="事業一覧"
        className="wrap pt-[clamp(72px,9vw,110px)] pb-10"
      >
        {SERVICES.map((s, i) => {
          const reverse = i % 2 === 1;
          const href = `/service/${s.slug}/`;
          return (
            <article
              key={s.slug}
              id={`svc-${s.num}`}
              data-reveal="up"
              className="grid items-center gap-16 border-t border-border py-[70px] pc:grid-cols-2 max-pc:gap-8 max-pc:py-12"
            >
              <div className={cn(reverse && "pc:order-2")}>
                <p className="flex items-baseline gap-5">
                  <span className="font-display text-[64px] font-extrabold leading-none tracking-[-.04em] text-marker max-sp:text-[48px]">
                    {s.num}
                  </span>
                  <span className="font-display text-[13px] font-medium tracking-[.2em] text-fg-muted">
                    {s.en}
                  </span>
                </p>
                <h2 className="mt-6 text-[clamp(24px,3vw,34px)] font-black leading-[1.5] text-fg [text-wrap:pretty]">
                  {s.title}
                </h2>
                <p className="mt-6 text-body leading-[2.1] text-fg-body">
                  {s.description}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {s.tags.map((t) => (
                    <li
                      key={t}
                      className="border border-border px-3.5 py-1.5 font-display text-[11px] font-medium tracking-[.1em] text-fg-body"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className="mt-8 inline-flex items-center gap-3 border-b-2 border-marker pb-1.5 font-display text-[13px] font-medium tracking-[.15em] text-fg transition-colors hover:text-marker"
                >
                  VIEW MORE
                  <span aria-hidden className="text-marker">
                    →
                  </span>
                </Link>
              </div>
              <Link
                href={href}
                aria-label={`${s.title} の詳細`}
                className={cn(
                  "group block h-[380px] overflow-hidden bg-surface max-sp:h-[240px]",
                  reverse && "pc:order-1",
                )}
              >
                {/* SAMPLE: 仮画像。実写真に差し替える（正方形でなくても object-cover で収まる） */}
                <Picture
                  src={s.image}
                  alt=""
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="block size-full"
                  imgClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            </article>
          );
        })}
      </section>

      {/* FLOW: 5 カード。960px 以下は 2 列、SP は 1 列 */}
      <section className="wrap section-pad pt-10">
        <SectionHeading en="FLOW" ja="ご依頼の流れ" />
        <ol className="grid grid-cols-5 gap-4 max-pc:grid-cols-2 max-sp:grid-cols-1">
          {FLOW.map((f, i) => (
            <li
              key={f.title}
              data-reveal="up"
              style={rd(i)}
              className="min-h-[150px] border border-border px-[18px] py-6"
            >
              <span className="font-display text-[28px] font-extrabold leading-none text-marker">
                {i + 1}
              </span>
              <p className="mt-3.5 text-[14px] font-bold text-fg">{f.title}</p>
              <p className="mt-2 text-caption leading-[1.9] text-fg-muted">
                {f.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <ServiceCta />
    </>
  );
}
