import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * SERVICE 詳細のタイル（STACK: 学べる技術）。英字は font-display。
 * @example <ServiceTiles en="STACK" ja="学べる技術" items={["PHP", "JavaScript"]} />
 */
export default function ServiceTiles({ en, ja, items }: { en: string; ja: string; items: readonly string[] }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <ul className="mt-[clamp(32px,4vw,48px)] grid grid-cols-4 gap-gap-card max-pc:grid-cols-3 max-sp:grid-cols-2 max-sp:gap-3">
        {items.map((t, i) => (
          <li
            key={t}
            data-reveal="up"
            style={{ "--rd": `${revealDelay(i)}ms` } as CSSProperties}
            className="flex aspect-[4/3] items-center justify-center rounded-card bg-surface px-4 text-center font-display text-[clamp(16px,1.6vw,22px)] font-bold tracking-[-.02em] text-fg"
          >
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
