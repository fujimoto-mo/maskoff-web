import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細の GALLERY。2 枚が blur 解除で出現し、hover でわずかにズーム（TOP のカードと同じ）。
 * 画像は public/images/service/detail/（仮画像。同名で上書きすれば差し替え完了）。
 * @example <ServiceGallery items={getServiceDetail("sns").gallery} />
 */
export default function ServiceGallery({ items }: { items: readonly { src: string; alt: string }[] }) {
  return (
    <section aria-labelledby="sv-gallery" className="wrap section-pad pt-0">
      <SectionHeading en="GALLERY" ja="イメージ" id="sv-gallery" />
      <ul className="mt-[clamp(32px,4vw,48px)] grid grid-cols-2 gap-gap-card [perspective:1200px] max-sp:grid-cols-1">
        {items.map((g, i) => (
          <li key={g.src} data-reveal="blur" style={rd(i)} className="group aspect-[3/2] overflow-hidden rounded-visual bg-surface">
            <Picture
              src={g.src}
              alt={g.alt}
              sizes="(max-width: 600px) 100vw, 50vw"
              className="block size-full"
              imgClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
