import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Img } from "@/content/service-details";

/**
 * SERVICE 詳細のロゴ帯（MEDIA: 取扱媒体）。画像 1 枚を bg-surface の帯に contain で収める（ロゴが切れないように。画像の地色は bg-surface とほぼ同じ）。
 * @example <ServiceMedia en="MEDIA" ja="取扱媒体" image={{ src: "/images/service/svc-02.png", alt: "取扱媒体のロゴ" }} note="取扱媒体の一例です。" />
 */
export default function ServiceMedia({ en, ja, image, note }: { en: string; ja: string; image: Img; note?: string }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div data-reveal="up" className="mt-[clamp(32px,4vw,48px)] overflow-hidden rounded-visual bg-surface">
        <Picture src={image.src} alt={image.alt} sizes="100vw" className="block aspect-[16/9] w-full max-sp:aspect-square" imgClassName="size-full object-contain" />
      </div>
      {note && (
        <p data-reveal="up" className="mt-4 text-caption text-fg-muted">
          {note}
        </p>
      )}
    </section>
  );
}
