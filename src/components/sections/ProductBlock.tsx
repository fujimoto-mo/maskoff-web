import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/site";

const COPY = [
  `${SITE.product}は、未経験の方でも即戦力のエンジニアを目指せるプログラミングスクールです。`,
  "PHP、HTML/CSS、JavaScript、インフラを学べ、オンラインでアクセスして学習していきます。",
  "エンジニアのサポート、カスタマイズ可能なカリキュラムなどスキルアップ環境が充実しています。",
] as const;

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * HOME の PRODUCT（VISION と SERVICE の間）。自社プロダクト（SITE.product）の紹介。
 * PC は左に画面イメージ・右に文章の 2 カラム、960px 以下は縦積み（画像 → 文章）。文章側の背景にロゴ画像を 30% 透過で枠の端まで敷く（PC は cover、960px 以下は contain + 黒地）。
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
          <div className="relative flex flex-col justify-center self-stretch">
            {/* 右カラムの背景: TECH MASK LAB. のロゴ画像を 30% の透過で枠の端まで敷く。self-stretch で行の高さ（左の画像と同じ高さ）に揃えたうえで、枠を文章カラムより上下 40px・左右 24px（960px 以下は上下 32px・左右 12px。ページ余白の内側に収める）広げる。PC は object-cover（枠の縦横比 1.4〜1.6 に対し画像は 1.17 なので、切れるのは上下の黒い余白だけでロゴ本体は全部残る）。960px 以下は枠が横長（タブレット）／縦長（SP）になり cover だとロゴが切れるため object-contain にし、余った帯は黒地（bg-bg-dark）で埋めて枠全体を 1 枚の画像に見せる。画像の地は #000 で bg-bg-dark（#0A0A0A）とわずかに違うため、img を mix-blend-lighten で地に合わせて帯との境目を消す。opacity は帯も含めて薄くするため picture 側に付ける。装飾のため alt は空 */}
            <Picture
              src="/images/product/techmasklab-logo.jpg"
              alt=""
              sizes="(max-width: 960px) 100vw, 50vw"
              className="absolute -inset-x-6 -inset-y-10 block bg-bg-dark opacity-30 max-pc:-inset-x-3 max-pc:-inset-y-8"
              imgClassName="size-full object-cover mix-blend-lighten max-pc:object-contain"
            />
            <div className="relative">
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
                <Button href="/service/tech-education/" variant="liquid">
                  詳しく見る
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
