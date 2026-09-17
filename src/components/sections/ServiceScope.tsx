import type { CSSProperties } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * SERVICE 詳細の SCOPE。対応範囲のチップが 60ms 間隔でポップ。
 * @example <ServiceScope items={getServiceDetail("sns").scope} />
 */
export default function ServiceScope({ items }: { items: readonly string[] }) {
  return (
    <section aria-labelledby="sv-scope" className="wrap section-pad pt-0">
      <SectionHeading en="SCOPE" ja="対応範囲" id="sv-scope" />
      <ul className="mt-[clamp(32px,4vw,48px)] flex flex-wrap gap-3 max-sp:gap-2">
        {items.map((t, i) => (
          <li
            key={t}
            data-reveal="up"
            style={{ "--rd": `${i * 60}ms` } as CSSProperties}
            className="rounded-pill border border-border px-5 py-2.5 text-[14px] font-medium text-fg max-sp:px-4 max-sp:py-2 max-sp:text-[13px]"
          >
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
