import type { CSSProperties } from "react";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { revealDelay } from "@/components/motion/reveal-delay";
import { faqPageJsonLd } from "@/lib/jsonld";
import type { Faq } from "@/types/microcms";

/**
 * <details>/<summary> を閉じた状態で SSR。PC は globals.css の ::details-content で常時展開、SP は「＋」で開閉。
 * JS を使わないので JS 無効環境とクローラの双方で読める。FAQPage JSON-LD も同じデータから出す。
 * @example <FaqList items={await getFaq()} />
 */
export default function FaqList({ items }: { items: Faq[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad">
      <JsonLd data={faqPageJsonLd(items)} />
      <div className="wrap">
        <SectionHeading en="FAQ" ja="よくあるご質問" id="faq-title" />
        <ul className="grid grid-cols-3 gap-gap-card max-pc:grid-cols-2 max-sp:grid-cols-1 max-sp:gap-3">
          {items.map((f, i) => (
            <li key={f.id} className="faq-card rounded-card bg-surface px-[22px] py-6" data-reveal="up" style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}>
              <details className="group">
                <summary className="flex cursor-default list-none items-baseline gap-2.5 text-[16px] font-bold leading-[1.55] tracking-[.01em] text-fg max-sp:cursor-pointer max-sp:text-[14.5px] [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="font-display text-[17px] max-sp:text-[15.5px]">
                    Q
                  </span>
                  <span className="flex-1">{f.question}</span>
                  <span
                    aria-hidden
                    className="relative ml-auto hidden size-4 shrink-0 self-center transition-transform duration-300 ease-sym group-open:rotate-45 max-sp:block before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-full before:-translate-y-1/2 before:bg-fg after:absolute after:top-0 after:left-1/2 after:h-full after:w-[1.5px] after:-translate-x-1/2 after:bg-fg"
                  />
                </summary>
                <p className="mt-2.5 text-caption text-fg-body">{f.answer}</p>
                {f.note && <small className="mt-2 block text-caption text-fg-muted">{f.note}</small>}
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
