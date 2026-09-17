import type { CSSProperties } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * SERVICE 詳細の FLOW。PC は横並びで線（::before）が左→右に伸び、番号バッジが順に点灯。≤960 は縦並びで上→下。
 * 線の初期状態と遷移は globals.css の [data-reveal="flow"]。
 * @example <ServiceFlow steps={getServiceDetail("sns").flow} />
 */
export default function ServiceFlow({ steps }: { steps: readonly { title: string; text: string }[] }) {
  return (
    <section aria-labelledby="sv-flow" className="wrap section-pad pt-0">
      <SectionHeading en="FLOW" ja="ご依頼の流れ" id="sv-flow" />
      <ol
        data-reveal="flow"
        className="relative mt-[clamp(32px,4vw,48px)] grid gap-x-6 gap-y-8 pc:auto-cols-fr pc:grid-flow-col before:absolute before:bg-border before:content-[''] pc:before:top-[13px] pc:before:right-0 pc:before:left-0 pc:before:h-px pc:before:origin-left max-pc:before:top-0 max-pc:before:bottom-0 max-pc:before:left-[13px] max-pc:before:w-px max-pc:before:origin-top"
      >
        {steps.map((s, i) => (
          <li key={s.title} style={{ "--i": i } as CSSProperties} className="relative pl-[42px] pc:pt-11 pc:pl-0">
            <span
              aria-hidden
              className="absolute top-0 left-0 flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert"
            >
              {i + 1}
            </span>
            <b className="block text-[15px] font-bold leading-[1.55] text-fg">{s.title}</b>
            <span className="mt-1.5 block text-caption leading-[1.8] text-fg-muted">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
