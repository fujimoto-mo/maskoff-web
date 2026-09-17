import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { faqPageJsonLd } from "@/lib/jsonld";

/**
 * SERVICE 詳細の FAQ（3 問）。FaqList と同じ <details> マークアップ（PC は ::details-content で常時展開、SP は「＋」で開閉）で、
 * FAQPage JSON-LD を同じデータから出す。FaqList は microCMS の Faq 型（id / order）に依存するため静的データ用に分けている。
 * @example <ServiceFaq items={getServiceDetail("sns").faq} />
 */
export default function ServiceFaq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="sv-faq" className="wrap section-pad pt-0">
      <JsonLd data={faqPageJsonLd(items.map((f) => ({ question: f.q, answer: f.a })))} />
      <SectionHeading en="FAQ" ja="よくあるご質問" id="sv-faq" />
      <ul className="mt-[clamp(32px,4vw,48px)] grid grid-cols-3 gap-gap-card max-pc:grid-cols-1 max-sp:gap-3">
        {items.map((f, i) => (
          <li key={f.q} className="faq-card rounded-card bg-surface px-[22px] py-6" data-reveal="up" style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}>
            <details className="group">
              <summary className="flex cursor-default list-none items-baseline gap-2.5 text-[16px] font-bold leading-[1.55] tracking-[.01em] text-fg max-sp:cursor-pointer max-sp:text-[14.5px] [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="font-display text-[17px] max-sp:text-[15.5px]">Q</span>
                <span className="flex-1">{f.q}</span>
                <span
                  aria-hidden
                  className="relative ml-auto hidden size-4 shrink-0 self-center transition-transform duration-300 ease-sym group-open:rotate-45 max-sp:block before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-full before:-translate-y-1/2 before:bg-fg after:absolute after:top-0 after:left-1/2 after:h-full after:w-[1.5px] after:-translate-x-1/2 after:bg-fg"
                />
              </summary>
              <p className="mt-2.5 text-caption leading-[1.9] text-fg-body">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
