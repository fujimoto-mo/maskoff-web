import type { Metadata } from "next";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import Marker from "@/components/ui/Marker";
import SectionHeading from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "会社情報",
  description: "株式会社MasKOFFの会社概要・代表メッセージ・沿革・アクセス。仮面の下の、私たちについて。",
  alternates: { canonical: "/company/" },
};

// SAMPLE: 会社データは仮（design_handoff_company_page 由来）。実データ確定時に差し替える
const PROFILE = [
  { dt: "社名", dd: ["株式会社MasKOFF（マスクオフ）"] },
  { dt: "設立", dd: ["2025年4月"] },
  { dt: "代表者", dd: ["代表取締役 藤本 ツヨシ"] },
  { dt: "所在地", dd: ["〒150-0021 東京都渋谷区恵比寿西1-33-6-216"] },
  { dt: "事業内容", dd: ["ホームページ制作、デザインの制作", "キャリア支援事業", "Bアパレル製品の企画・製造・販売", "デザイン及びコンサルタント業務", "アーティストの活動支援"] },
  { dt: "資本金", dd: ["3,000,000円"] },
];
const HISTORY = [
  { dt: "2025.04", dd: "東京・渋谷にて株式会社MasKOFFを設立" },
  { dt: "2025.09", dd: "オリジナルファッションブランド 1st コレクションを発表" },
  { dt: "2026.06", dd: "デザイン・コンサルティング事業を開始" },
];

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as React.CSSProperties;

/** COMPANY。ヘッダー・フッターは共通レイアウト側。デザインは docs/design_handoff_company_page を当サイトのトークンに合わせて調整 */
export default function CompanyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: `${SITE.url}/`,
          address: {
            "@type": "PostalAddress",
            postalCode: "150-0021",
            addressRegion: "東京都",
            addressLocality: "渋谷区",
            streetAddress: "東京都渋谷区恵比寿西1-33-6-216",
          },
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "会社情報", path: "/company/" }], SITE.url)} />

      {/* ヒーロー: COMPANY の 4 行スタック（ロゴの重ね文字モチーフ） */}
      <section className="wrap overflow-hidden pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">MASKOFF.CO.JP / COMPANY</p>
        <h1 aria-label="COMPANY" className="mt-4 font-display text-[clamp(60px,10vw,140px)] font-extrabold leading-[.9] tracking-[-.04em] text-fg">
          <span aria-hidden className="block">COMPANY</span>
          <span aria-hidden className="block opacity-40">COMPANY</span>
          <span aria-hidden className="block opacity-[.18]">COMPANY</span>
          <span aria-hidden className="-mb-[.35em] block opacity-[.08]">COMPANY</span>
        </h1>
        <p className="mt-10 text-[16px] font-medium text-fg-body max-sp:text-[14px]">会社情報 — 仮面の下の、私たちについて。</p>
      </section>

      {/* マーキー帯 */}
      <div aria-hidden className="overflow-hidden border-y border-border py-3 whitespace-nowrap">
        <div className="inline-flex w-max animate-[drift_26s_linear_infinite]">
          {[0, 1].map((k) => (
            <span key={k} className="pr-6 font-display text-[20px] font-bold tracking-[.06em] text-fg">
              {Array.from({ length: 4 }, () => "MASK OFF — 素顔で生きろ。").join("　")}　
            </span>
          ))}
        </div>
      </div>

      <section className="wrap section-pad">
        <SectionHeading en="MISSION" ja="私たちの理念" />
        <p data-reveal="up" className="text-[clamp(26px,3.8vw,44px)] font-bold leading-[1.45] tracking-[-.02em] text-fg">
          仮面を外した先に、
          <br />
          まだ見ぬ個性がある。
        </p>
        <p data-reveal="up" style={rd(1)} className="mt-8 max-w-[640px] text-body leading-[2.1] text-fg-body">
          MASK OFFには「仮面を外す」「素の自分」という意味があります。誰もが空気を読み、誰かの正解をなぞるこの時代に、自分だけの感性をさらけ出すこと。株式会社MasKOFFは、
          <Marker>進化したこの時代で新たな個性をさらけ出す</Marker>
          という理念のもと、オリジナルファッションブランドの企画・デザインを軸に、クリエイティブサービスを提供しています。
        </p>
      </section>

      <section className="wrap section-pad pt-0">
        <SectionHeading en="MESSAGE" ja="代表メッセージ" />
        <div className="grid gap-14 pc:grid-cols-[320px_1fr]">
          <div data-reveal="up">
            {/* SAMPLE: 代表ポートレート（実画像に差し替え → Picture を使う） */}
            <div className="flex h-[400px] w-full items-center justify-center bg-placeholder font-display text-caption text-fg-muted pc:w-[320px]">CEO PORTRAIT</div>
            <p className="mt-3 font-display text-caption tracking-[.15em] text-fg-muted">CEO / FOUNDER</p>
          </div>
          <div>
            <h3 data-reveal="up" className="text-[26px] font-bold leading-[1.6] text-fg max-sp:text-[22px]">
              かっこつけるな。
              <br />
              かっこよくあれ。
            </h3>
            <p data-reveal="up" style={rd(1)} className="mt-7 text-body leading-[2.2] text-fg-body">
              服は、いちばん身近な自己表現だと思っています。だからこそ、流行や数字に合わせて「らしさ」を削るのではなく、着る人の素顔がそのまま滲み出るプロダクトをつくりたい。MasKOFFは小さなチームですが、デザインの一本の線、生地の一枚まで、ストーリーを持たせることに妥協しません。
            </p>
            <p data-reveal="up" style={rd(2)} className="mt-5 text-body leading-[2.2] text-fg-body">
              ブランドとして、パートナーとして、そしてアーティストの伴走者として。仮面を外したすべての表現者と、新しいカルチャーをつくっていきます。
            </p>
            <p data-reveal="up" style={rd(3)} className="mt-9 text-[13px] text-fg-muted">株式会社MasKOFF 代表取締役</p>
            <p data-reveal="up" style={rd(3)} className="mt-1.5 text-[20px] font-bold text-fg">
              藤本 ツヨシ<span className="ml-3 font-display text-caption font-normal tracking-[.1em] text-fg-muted">TSUYOSHI FUJIMOTO</span>
            </p>
          </div>
        </div>
      </section>

      <section className="wrap section-pad pt-0">
        <SectionHeading en="PROFILE" ja="会社概要" />
        <dl className="border-t border-border">
          {PROFILE.map((row, i) => (
            <div key={row.dt} data-reveal="up" style={rd(i)} className="grid grid-cols-[200px_1fr] border-b border-border px-2 py-[22px] text-body max-sp:grid-cols-[110px_1fr]">
              <dt className="text-fg-muted">{row.dt}</dt>
              <dd className="m-0 leading-[2] text-fg-body">
                {row.dd.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="wrap section-pad pt-0">
        <SectionHeading en="HISTORY" ja="沿革" />
        <dl className="border-t border-border">
          {HISTORY.map((row, i) => (
            <div key={row.dt} data-reveal="up" style={rd(i)} className="grid grid-cols-[200px_1fr] border-b border-border px-2 py-[22px] text-body max-sp:grid-cols-[110px_1fr]">
              <dt className="font-display font-bold tracking-[.08em] text-marker">{row.dt}</dt>
              <dd className="m-0 leading-[2] text-fg-body">{row.dd}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="wrap section-pad pt-0">
        <SectionHeading en="ACCESS" ja="アクセス" />
        <div className="grid gap-12 pc:grid-cols-2">
          <div data-reveal="up">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d240.97967914897538!2d139.70419425656917!3d35.646872776174085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b000ae3df1b%3A0x3b1830550a4f4bea!2zSlAgbm9pZSDmgbXmr5Tlr7_opb8!5e0!3m2!1sja!2sjp!4v1788333407248!5m2!1sja!2sjp"
              title="株式会社MasKOFF の地図（Google マップ）"
              className="h-80 w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div data-reveal="up" style={rd(1)} className="text-body leading-[2.1] text-fg-body">
            <p className="text-[16px] font-bold text-fg">株式会社MasKOFF</p>
            <p className="mt-4">
              〒150-0021
              <br />
              東京都渋谷区恵比寿西1-33-6-216
            </p>
            <p className="mt-4">
              東京メトロ「恵比寿」駅 徒歩5分
              <br />
              JR「恵比寿」駅 徒歩8分
            </p>
          </div>
        </div>
      </section>

      {/* CTA 帯 */}
      <section className="wrap section-pad border-t border-border text-center">
        <p data-reveal="up" className="font-display text-[clamp(40px,7vw,88px)] font-extrabold leading-none tracking-[-.04em] text-fg">TAKE OFF YOUR MASK.</p>
        <p data-reveal="up" style={rd(1)} className="mt-6 text-body text-fg-muted">協業・取材・その他のご相談はお気軽に。</p>
        <div data-reveal="up" style={rd(2)} className="mt-8">
          <Button href="/contact/" dot className="px-10 py-3.5 text-[14px]">
            CONTACT
          </Button>
        </div>
      </section>
    </>
  );
}
