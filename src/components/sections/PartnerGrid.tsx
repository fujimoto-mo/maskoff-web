import CarouselDots from "@/components/ui/CarouselDots";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTNERS, type Partner } from "@/lib/partners";

/**
 * PC: 4 列（≤960 は 2 列）/ SP: scroll-snap カルーセル + ドット。ホバーで画像 1.07 倍。
 * @example <PartnerGrid />
 */
export default function PartnerGrid({ partners = PARTNERS }: { partners?: readonly Partner[] }) {
  return (
    <section id="partners" aria-labelledby="partners-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="PARTNERS" ja="MasKOFFが支援する活動" id="partners-title" />
        {/* SAMPLE */}
        <p className="-mt-2 mb-11 text-body text-fg-body max-sp:text-body-sp">
          スポーツ・カルチャー・教育の現場を、ものづくりとテクノロジーで支えています。
          <br className="max-sp:hidden" />
          表現者が輝く場所に寄り添い、その未来を共につくる仲間であり続けます。
        </p>
        <ul id="partner-track" className="grid grid-cols-4 gap-gap-card max-pc:grid-cols-2 max-sp:carousel">
          {partners.map((p) => (
            <li key={p.id} className="group">
              <div className="relative mb-4 aspect-[21/13] overflow-hidden rounded-card bg-surface">
                <Picture
                  src={p.image}
                  alt=""
                  sizes="(max-width: 600px) 80vw, (max-width: 960px) 50vw, 25vw"
                  className="block size-full"
                  imgClassName="size-full object-cover transition-transform duration-[600ms] ease-out-quart group-hover:scale-[1.07]"
                />
                <span className="absolute top-3 left-3 rounded-pill bg-fg/55 px-3 py-1 font-display text-[10px] font-bold tracking-[.08em] text-fg-invert backdrop-blur-[8px] max-tab:text-[11px]">
                  {p.tag}
                </span>
                <Picture src={p.icon} alt="" sizes="44px" className="absolute right-2.5 bottom-2.5 block size-11 overflow-hidden rounded-[10px]" imgClassName="size-full" />
              </div>
              <h3 className="mb-1.5 text-[18px] font-bold leading-[1.55] tracking-[.01em] text-fg max-tab:mb-2 max-tab:text-[16px] max-tab:leading-[1.5]">{p.name}</h3>
              <p className="text-caption text-fg-body max-tab:text-[11.5px] max-tab:leading-[1.8]">{p.text}</p>
            </li>
          ))}
        </ul>
        <CarouselDots trackId="partner-track" count={partners.length} label="パートナー" />
      </div>
    </section>
  );
}
