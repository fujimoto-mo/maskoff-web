import Link from "next/link";
import Button from "@/components/ui/Button";
import CarouselDots from "@/components/ui/CarouselDots";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { SERVICES, type Service } from "@/lib/services";

type Props = {
  services?: readonly Service[];
  /** HOME は先頭 6 件（3 列 × 2 行） */
  limit?: number;
};

/**
 * PC: 3 列グリッド（≤960 は 2 列）/ SP: CSS scroll-snap カルーセル + ドット。
 * 両方を同じマークアップにして CSS で出し分ける（ハイドレーション不一致と CLS を避ける）。
 * @example <ServiceGrid limit={6} />
 */
export default function ServiceGrid({ services = SERVICES, limit = 6 }: Props) {
  const items = services.slice(0, limit);
  return (
    <section id="service" aria-labelledby="service-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="SERVICE" ja="事業内容" id="service-title" />
        <ul id="service-track" className="mt-[clamp(56px,7vw,88px)] grid grid-cols-3 gap-x-gap-service-col gap-y-gap-service-row max-pc:grid-cols-2 max-sp:carousel">
          {items.map((s) => (
            <li key={s.slug}>
              <Link href={`/service/${s.slug}/`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-visual bg-surface">
                  <Picture
                    src={s.image}
                    alt=""
                    sizes="(max-width: 600px) 80vw, (max-width: 960px) 50vw, 33vw"
                    className="block size-full"
                    imgClassName="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden
                    className="absolute top-[10%] right-[8%] flex size-[86px] items-center justify-center rounded-full bg-fg text-[14px] font-bold text-fg-invert max-sp:size-[74px] max-sp:text-[13px]"
                  >
                    {s.verb}
                  </span>
                </div>
                <h3 className="mt-[22px] mb-3 text-center text-card-title text-fg max-tab:text-card-title-sp">{s.title}</h3>
                <p className="text-[13.5px] leading-[1.8] text-fg-body max-tab:text-[11.5px]">{s.lead}</p>
              </Link>
            </li>
          ))}
        </ul>
        <CarouselDots trackId="service-track" count={items.length} label="事業カード" />
        <p className="mt-10 text-center">
          <Button href="/service/" variant="line">
            事業一覧を見る
          </Button>
        </p>
      </div>
    </section>
  );
}
