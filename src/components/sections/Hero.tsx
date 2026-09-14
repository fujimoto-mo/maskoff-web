import Marquee from "@/components/motion/Marquee";
import MarqueeDrag from "@/components/motion/MarqueeDrag";
import type { MarqueeRow } from "@/components/motion/marquee-cells";
import { SITE } from "@/lib/site";

// SAMPLE: public/images/hero/ の透過 PNG は仮素材。実素材に差し替えたら枚数と配置を見直す。
const img = (n: number) => ({ type: "image" as const, src: `/images/hero/hero-${String(n).padStart(2, "0")}.png` });
const TEXT = { type: "text" as const, lines: ["TAKE THE", "MASK", "OFF"] };
// MASK OFF の積み文字ロゴ（docs/maskoff.png）を黒い角丸タイルに載せ、タイルが左右に揺れて沈む透過アニメーション WebP（32f / 1.92s ループ、scripts 不要・生成物をコミット）。reduced-motion では maskoff.png の静止画
const LOGO_TILE = { type: "image" as const, src: "/images/hero/maskoff.png", anim: "/images/hero/maskoff-anim.webp" };
// グリッチ映像。元動画 MOHP素材 (4).mp4（960px / 60s / 170MB）の先頭 3.5s から、末尾 0.5s を先頭に溶かした 3s のシームレスループを切り出し、342px / 24fps / H.264 約290KB に圧縮（生成物をコミット）。poster は先頭フレームの WebP。セル内で 2/3 に縮めて表示
const GLITCH = { type: "video" as const, src: "/videos/hero/hero-01.mp4", poster: "/images/hero/hero-01-poster.webp", size: 2 / 3 };
// アプリタイルの映像。元動画 MOHP素材 (3).mp4（2378px / 15s / 18MB）の先頭 4.75s から、末尾 0.75s を先頭に溶かした 4s のシームレスループを切り出し、342px / 24fps / H.264 に圧縮（生成物をコミット）。poster は先頭フレームの WebP。セル内で 2/3 に縮めて表示
const TILES = { type: "video" as const, src: "/videos/hero/hero-07.mp4", poster: "/images/hero/hero-07-poster.webp", size: 2 / 3 };
// 白 T シャツ。透過アニメーション WebP（26f / 0.87s ループ、scripts 不要・生成物をコミット）。reduced-motion では hero-08.png の静止画
const TEE = { ...img(8), anim: "/images/hero/hero-08-anim.webp" };
// ノート PC の回転。透過アニメーション WebP（25f / 0.84s ループ、元動画 0912.mp4 の黒背景を抜き 2/3 に縮小、生成物をコミット）。reduced-motion では hero-14.png の静止画
const LAPTOP = { ...img(14), anim: "/images/hero/hero-14-anim.webp" };
// スマートフォンの回転。透過アニメーション WebP（25f / 0.84s ループ、元動画 0911 (1).mp4 の黒背景を抜き 2/3 に縮小、生成物をコミット）。reduced-motion では hero-05.png の静止画
const PHONE = { ...img(5), anim: "/images/hero/hero-05-anim.webp" };

const ROWS: MarqueeRow[] = [
  { cells: [GLITCH, img(2), img(3), TEXT, LOGO_TILE, PHONE], duration: 60 },
  { cells: [img(6), TILES, TEE, { type: "logo" }, img(9), img(10)], reverse: true, duration: 72 },
  { cells: [img(11), img(12), TEXT, img(13), LAPTOP, img(15)], duration: 66 },
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
