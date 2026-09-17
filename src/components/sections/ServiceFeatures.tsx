import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import SectionHeading from "@/components/ui/SectionHeading";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細の FEATURES。3 カードが奥から blur 解除で順に出現（TOP の SERVICE と同じ演出）。
 * @example <ServiceFeatures items={getServiceDetail("sns").features} />
 */
export default function ServiceFeatures({ items }: { items: readonly { title: string; text: string }[] }) {
  return (
    <section aria-labelledby="sv-features" className="wrap section-pad pt-0">
      <SectionHeading en="FEATURES" ja="3つの特徴" id="sv-features" />
      <ol className="mt-[clamp(32px,4vw,48px)] grid grid-cols-3 gap-gap-card [perspective:1200px] max-pc:grid-cols-1">
        {items.map((f, i) => (
          <li key={f.title} data-reveal="blur" style={rd(i)} className="rounded-card bg-surface px-7 py-8 max-sp:px-5 max-sp:py-6">
            <span aria-hidden className="font-display text-[13px] font-bold tracking-[.2em] text-marker">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-[18px] font-bold leading-[1.5] text-fg max-sp:text-[16px]">{f.title}</h3>
            <p className="mt-3 text-caption leading-[1.9] text-fg-body">{f.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
