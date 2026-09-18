import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import ServiceVideo from "@/components/sections/ServiceVideo";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Img } from "@/content/service-details";
import { cn } from "@/lib/cn";
import manifest from "@/lib/images/manifest.json";

const MANIFEST = manifest as Record<string, { width: number; height: number } | undefined>;

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細のプロダクト紹介（PRODUCT: TiPLY / CASE: OMIKUJI BOX・DotHyphen）。左に画像、右に要点 3 つ。
 * links があれば要点の下に外部サイト・SNS へのボタンを横に並べる（http なら Button が別タブで開く）。icon はラベルの前に載せる小さなロゴ（Instagram など。マニフェスト経由の Picture）。
 * video があれば画像の代わりに縦型の動画（音なし・ループ、画面内だけ再生）を置き、image をポスターにする。縦型なので PC の左列は 360px に絞る。
 * @example <ServiceProduct en="PRODUCT" ja="TiPLY とは" image={img} points={[{ title, text }]} />
 * @example <ServiceProduct en="CASE" ja="自社ブランド" image={img} points={pts} links={[{ href: "https://dothyphen.store/", label: "サイトを見る" }, { href: "https://www.instagram.com/…", label: "Instagram", icon: { src: "/images/icons/instagram.png", alt: "" } }]} />
 */
export default function ServiceProduct({ en, ja, image, points, links, video }: { en: string; ja: string; image: Img; points: readonly { title: string; text: string }[]; links?: readonly { href: string; label: string; icon?: Img }[]; video?: { src: string } }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const poster = video ? MANIFEST[image.src] : undefined; // ポスターの寸法（video の width / height、CLS 対策）。manifest に無ければ Picture 側が投げる
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div className={cn("mt-[clamp(32px,4vw,48px)] grid gap-gap-cols pc:items-center", video ? "pc:grid-cols-[minmax(0,360px)_1fr]" : "pc:grid-cols-[3fr_2fr]")}>
        <div data-reveal="blur" className={cn("overflow-hidden rounded-visual bg-surface [perspective:1200px]", video && "mx-auto w-full max-w-[360px] pc:mx-0")}>
          {video && poster ? (
            <ServiceVideo src={video.src} poster={image.src} width={poster.width} height={poster.height} label={image.alt} />
          ) : (
            <Picture src={image.src} alt={image.alt} sizes="(max-width: 960px) 100vw, 60vw" className="block w-full" imgClassName="h-auto w-full" />
          )}
        </div>
        <div>
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
        {links && links.length > 0 && (
          <p data-reveal="up" style={rd(points.length + 1)} className="mt-8 flex flex-wrap gap-3">
            {links.map((l) => (
              <Button key={l.href} href={l.href}>
                {l.icon ? (
                  <span className="inline-flex items-center gap-2">
                    <Picture src={l.icon.src} alt={l.icon.alt} sizes="20px" className="block size-5 shrink-0" imgClassName="size-5 rounded-[4px]" />
                    {l.label}
                  </span>
                ) : (
                  l.label
                )}
              </Button>
            ))}
          </p>
        )}
        </div>
      </div>
    </section>
  );
}
