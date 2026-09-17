import SectionHeading from "@/components/ui/SectionHeading";

/**
 * SERVICE 詳細の案内帯（SUBSIDY: 補助金の活用）。罫線囲み + 注記。
 * @example <ServiceNotice en="SUBSIDY" ja="補助金の活用" title="…" text="…" note="採択を保証するものではありません。" />
 */
export default function ServiceNotice({ en, ja, title, text, note }: { en: string; ja: string; title: string; text: string; note?: string }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div data-reveal="up" className="mt-[clamp(32px,4vw,48px)] border-y border-border py-8 pc:grid pc:grid-cols-[1fr_2fr] pc:gap-gap-cols">
        <h3 className="text-[20px] font-bold leading-[1.6] text-fg max-sp:text-[17px]">{title}</h3>
        <div>
          <p className="text-body leading-[2] text-fg-body max-pc:mt-4">{text}</p>
          {note && <small className="mt-3 block text-caption text-fg-muted">※ {note}</small>}
        </div>
      </div>
    </section>
  );
}
