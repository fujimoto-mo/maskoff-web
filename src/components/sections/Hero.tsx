import Marquee from "@/components/motion/Marquee";
import MarqueeDrag from "@/components/motion/MarqueeDrag";
import type { MarqueeRow } from "@/components/motion/marquee-cells";
import { SITE } from "@/lib/site";

// SAMPLE: public/images/hero/ の透過 PNG は仮素材。実素材に差し替えたら枚数と配置を見直す。
const img = (n: number) => ({ type: "image" as const, src: `/images/hero/hero-${String(n).padStart(2, "0")}.png` });
const TEXT = { type: "text" as const, lines: ["TAKE THE", "MASK", "OFF"] };
// SAMPLE: 動画セル。参考サイトは各行 1 つを動画風（アニメ WebP）にしている。実素材は正方形・数秒ループ・音なし・~500KB 以下の MP4 を推奨
const VIDEO = { type: "video" as const, src: "/videos/hero/sample-01.mp4", poster: "/images/hero/sample-01-poster.png" };

const ROWS: MarqueeRow[] = [
  { cells: [img(1), img(2), img(3), TEXT, VIDEO, img(5)], duration: 60 },
  { cells: [img(6), img(7), img(8), { type: "logo" }, img(9), img(10)], reverse: true, duration: 72 },
  { cells: [img(11), img(12), TEXT, img(13), img(14), img(15)], duration: 66 },
];

/** HOME ヒーロー。h1 は視覚非表示、マーキーは装飾として aria-hidden。 */
export default function Hero() {
  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col justify-center pt-[clamp(30px,4vw,50px)] pb-[clamp(38px,5.2vw,64px)] sp:min-h-[calc(100svh-var(--spacing-header-h))]"
      >
        <h1 id="hero-title" className="sr-only">
          {SITE.name} — {SITE.tagline}｜アパレル企画・製造販売 / アーティスト活動支援 / ホームページ制作
        </h1>
        <div aria-hidden>
          <Marquee rows={ROWS} />
          <MarqueeDrag />
        </div>
      </section>
      <div aria-hidden className="h-fv-gap" />
    </>
  );
}
