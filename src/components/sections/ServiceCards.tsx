import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Img } from "@/content/service-details";
import { cn } from "@/lib/cn";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;
type Props = { en: string; ja: string; items: readonly { title: string; text: string }[]; cols?: 3 | 4; numeral?: boolean; image?: Img };
const secId = (en: string) => `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/**
 * SERVICE 詳細のカード群（STRENGTH / SUPPORT / MENU / PILLARS / DELIVERABLES / APPROACH / BENEFITS）。
 * 奥から blur 解除で順に出現。numeral は大きな番号（APPROACH）、image は右に写真（SUPPORT。カードは縦 1 列）。
 * @example <ServiceCards en="STRENGTH" ja="3つの強み" items={items} />
 * @example <ServiceCards en="APPROACH" ja="成果までの進め方" items={items} numeral />
 */
export default function ServiceCards({ en, ja, items, cols = 3, numeral = false, image }: Props) {
  const id = secId(en);
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div className={cn("mt-[clamp(32px,4vw,48px)]", image && "grid gap-gap-cols pc:grid-cols-[3fr_2fr] pc:items-center")}>
        <ol className={cn("grid gap-gap-card [perspective:1200px]", image ? "grid-cols-1" : cols === 4 ? "grid-cols-4 max-pc:grid-cols-2 max-sp:grid-cols-1" : "grid-cols-3 max-pc:grid-cols-1")}>
          {items.map((f, i) => (
            <li key={f.title} data-reveal="blur" style={rd(i)} className="rounded-card bg-surface px-7 py-8 max-sp:px-5 max-sp:py-6">
              <span
                aria-hidden
                className={cn("block font-display font-bold text-marker", numeral ? "text-[clamp(40px,4vw,56px)] leading-none tracking-[-.04em]" : "text-[13px] tracking-[.2em]")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[18px] font-bold leading-[1.5] text-fg max-sp:text-[16px]">{f.title}</h3>
              <p className="mt-3 text-caption leading-[1.9] text-fg-body">{f.text}</p>
            </li>
          ))}
        </ol>
        {image && (
          <div data-reveal="blur" style={rd(items.length)} className="overflow-hidden rounded-visual bg-surface [perspective:1200px]">
            <Picture src={image.src} alt={image.alt} sizes="(max-width: 960px) 100vw, 40vw" className="block w-full" imgClassName="h-auto w-full" />
          </div>
        )}
      </div>
    </section>
  );
}
