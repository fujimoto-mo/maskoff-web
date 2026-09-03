import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/site";

const COPY = [
  `${SITE.product}は、未経験の方でも即戦力のエンジニアを目指せるプログラミングスクールです。`,
  "PHP、HTML/CSS、JavaScript、インフラを学べ、オンラインとオフラインの両方でアクセス可能です。",
  "現役エンジニアのサポート、カスタマイズ可能なカリキュラムなどスキルアップ環境が充実しています。",
] as const;

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * HOME の PRODUCT（VISION と SERVICE の間）。自社プロダクト（SITE.product）の紹介。
 * PC は左に画面イメージ・右に文章の 2 カラム、960px 以下は縦積み（画像 → 文章）。
 * @example <ProductBlock />
 */
export default function ProductBlock() {
  return (
    <section
      id="product"
      aria-labelledby="product-title"
      className="section-pad"
    >
      <div className="wrap">
        <SectionHeading en="PRODUCT" ja="自社プロダクト" id="product-title" />
        <div className="grid items-center gap-gap-cols pc:grid-cols-2 max-pc:gap-12">
          <div data-reveal="blur">
            <Picture
              src="/images/product/techmasklab.png"
              alt="techMasKLab の学習管理画面（カリキュラムの進捗一覧）"
              sizes="(max-width: 960px) 100vw, 50vw"
              className="block w-full"
              imgClassName="h-auto w-full"
            />
          </div>
          <div>
            <h3
              data-reveal="up"
              className="font-display text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-.04em] text-fg"
            >
              {SITE.product}
            </h3>
            <div className="mt-6 space-y-2 text-body leading-[2.1] text-fg-body">
              {COPY.map((line, i) => (
                <p key={line} data-reveal="up" style={rd(i + 1)}>
                  {line}
                </p>
              ))}
            </div>
            <div data-reveal="up" style={rd(4)} className="mt-8">
              <Button href="/service/tech-education/" dot>
                詳しく見る
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
