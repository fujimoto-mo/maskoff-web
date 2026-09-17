import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import SectionHeading from "@/components/ui/SectionHeading";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細の ISSUES。左の課題が左から、右の解決が右から slide-in（data-reveal="slide"）。
 * @example <ServiceIssues items={getServiceDetail("sns").issues} />
 */
export default function ServiceIssues({ items }: { items: readonly { problem: string; solution: string }[] }) {
  return (
    <section aria-labelledby="sv-issues" className="wrap section-pad pt-0">
      <SectionHeading en="ISSUES" ja="こんな課題に" id="sv-issues" />
      <ul className="mt-[clamp(32px,4vw,48px)] divide-y divide-border border-y border-border">
        {items.map((it, i) => (
          <li key={it.problem} className="grid items-center gap-x-8 gap-y-3 py-6 pc:grid-cols-[1fr_28px_1fr]">
            <p data-reveal="slide" data-side="l" style={rd(i)} className="text-[15px] font-bold leading-[1.8] text-fg max-sp:text-[14px]">
              <span className="mr-2 font-display text-[11px] font-medium tracking-[.2em] text-fg-muted">ISSUE</span>
              {it.problem}
            </p>
            <svg aria-hidden viewBox="0 0 28 28" className="hidden size-7 text-fg-muted pc:block" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14h16M15 7l7 7-7 7" />
            </svg>
            <p data-reveal="slide" data-side="r" style={rd(i)} className="text-body leading-[1.9] text-fg-body">
              <span className="mr-2 font-display text-[11px] font-medium tracking-[.2em] text-marker">MASKOFF</span>
              {it.solution}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
