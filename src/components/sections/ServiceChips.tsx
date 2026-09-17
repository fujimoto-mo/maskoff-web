import type { CSSProperties } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * SERVICE 詳細のチップ一覧（MARKETS など）。60ms 間隔でポップ。
 * @example <ServiceChips en="MARKETS" ja="出店先のイメージ" items={["北米", "欧州"]} />
 */
export default function ServiceChips({ en, ja, items }: { en: string; ja: string; items: readonly string[] }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
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
