import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Img } from "@/content/service-details";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細のプロダクト紹介（PRODUCT: TiPLY）。左に画像、右に要点 3 つ。
 * @example <ServiceProduct en="PRODUCT" ja="TiPLY とは" image={img} points={[{ title, text }]} />
 */
export default function ServiceProduct({ en, ja, image, points }: { en: string; ja: string; image: Img; points: readonly { title: string; text: string }[] }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div className="mt-[clamp(32px,4vw,48px)] grid gap-gap-cols pc:grid-cols-[3fr_2fr] pc:items-center">
        <div data-reveal="blur" className="overflow-hidden rounded-visual bg-surface [perspective:1200px]">
          <Picture src={image.src} alt={image.alt} sizes="(max-width: 960px) 100vw, 60vw" className="block w-full" imgClassName="h-auto w-full" />
        </div>
        <ol className="space-y-6">
          {points.map((p, i) => (
            <li key={p.title} data-reveal="up" style={rd(i + 1)} className="grid grid-cols-[26px_1fr] gap-4">
              <span aria-hidden className="flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert">
                {i + 1}
              </span>
              <div>
                <b className="block text-[16px] font-bold leading-[1.5] text-fg">{p.title}</b>
                <p className="mt-1.5 text-caption leading-[1.9] text-fg-body">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
