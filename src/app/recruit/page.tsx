import type { Metadata } from "next";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "採用情報",
  description: "株式会社MasKOFFの採用情報。肩書きより、感性。経歴より、偏愛。素顔のまま働ける仲間を募集しています。",
  alternates: { canonical: "/recruit/" },
};

// SAMPLE: 職種は仮データ（design_handoff_recruit_page 由来）。フェーズ②で microCMS（jobs）に差し替える
const CULTURE = [
  { title: "NO MASK", body: "服装・髪型・タトゥー自由。素の自分で働ける環境です。" },
  { title: "FLAT TEAM", body: "企画会議は全員参加。ジュニアの案がそのまま製品になることも。" },
  { title: "SIDE WORKS", body: "個人の制作・アーティスト活動との両立を歓迎しています。" },
];
const JOBS = [
  { type: "正社員", title: "ファッションデザイナー", desc: "オリジナルブランドの企画・デザイン。コンセプトメイクからサンプル監修まで。" },
  { type: "正社員", title: "生産管理 / パタンナー", desc: "提携工場との折衝、品質・納期管理。ものづくりの現場を支えるポジション。" },
  { type: "業務委託", title: "グラフィックデザイナー", desc: "ブランドビジュアル、グッズ、コラボ案件のグラフィック制作。" },
  { type: "業務委託", title: "アーティストリレーション / PR", desc: "アーティスト支援事業の窓口。イベント・SNS・コミュニティ運営。" },
];

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as React.CSSProperties;

/** RECRUIT。design_handoff_recruit_page を当サイトのトークン・部品に調整（ヘッダー・フッターは共通レイアウト） */
export default function RecruitPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "採用情報", path: "/recruit/" }], SITE.url)} />

      {/* ヒーロー: RECRUIT の 4 行スタック */}
      <section className="wrap overflow-hidden pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">MASKOFF.CO.JP / RECRUIT</p>
        <h1 aria-label="RECRUIT" className="mt-4 font-display text-[clamp(60px,10vw,140px)] font-extrabold leading-[.9] tracking-[-.04em] text-fg">
          <span aria-hidden className="block">RECRUIT</span>
          <span aria-hidden className="block opacity-40">RECRUIT</span>
          <span aria-hidden className="block opacity-[.18]">RECRUIT</span>
          <span aria-hidden className="-mb-[.35em] block opacity-[.08]">RECRUIT</span>
        </h1>
        <p className="mt-10 text-[16px] font-medium text-fg-body max-sp:text-[14px]">採用情報 — 素顔のまま、働く。</p>
      </section>

      <section className="wrap section-pad border-t border-border">
        <SectionHeading en="CULTURE" ja="私たちの働き方" />
        <p data-reveal="up" className="text-[clamp(24px,3.4vw,40px)] font-bold leading-[1.5] tracking-[-.02em] text-fg">
          肩書きより、感性。
          <br />
          経歴より、偏愛。
        </p>
        <p data-reveal="up" style={rd(1)} className="mt-8 max-w-[640px] text-body leading-[2.1] text-fg-body">
          MasKOFFは少数精鋭のチームです。役職や年次に関係なく、良いと思ったものを「良い」と言える人。自分の好きを言語化できる人。つくることを、人生の真ん中に置いている人。そんな仲間を探しています。
        </p>
        <ul className="mt-14 grid gap-4 pc:grid-cols-3">
          {CULTURE.map((c, i) => (
            <li key={c.title} data-reveal="up" style={rd(i)} className="border border-border p-7 pr-6">
              <p className="font-display text-[22px] font-extrabold tracking-[-.02em] text-marker">{c.title}</p>
              <p className="mt-3.5 text-caption leading-[2] text-fg-body">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section-pad pt-0">
        <SectionHeading en="OPENINGS" ja="募集職種" />
        <ul className="border-t border-border">
          {JOBS.map((j, i) => (
            <li key={j.title} data-reveal="up" style={rd(i)}>
              <a href="#entry" className="grid grid-cols-[120px_1fr_auto] items-center gap-6 border-b border-border px-2 py-8 transition-colors hover:bg-surface max-tab:grid-cols-[1fr_auto] max-tab:gap-3">
                <span className="font-display text-caption text-fg-muted max-tab:col-span-2">{j.type}</span>
                <span>
                  <span className="block text-[20px] font-bold text-fg max-sp:text-[17px]">{j.title}</span>
                  <span className="mt-2 block text-caption leading-[1.9] text-fg-muted">{j.desc}</span>
                </span>
                <span aria-hidden className="font-display text-[20px] font-bold text-marker">→</span>
              </a>
            </li>
          ))}
        </ul>
        <p data-reveal="up" className="mt-8 text-caption text-fg-muted">
          エントリーは
          <a href="/contact/" className="text-marker underline underline-offset-4">
            お問い合わせフォーム
          </a>
          より、ポートフォリオまたはSNSのURLを添えてご応募ください。
        </p>
      </section>

      {/* CTA 帯 */}
      <section id="entry" className="wrap section-pad border-t border-border text-center">
        <p data-reveal="up" className="font-display text-[clamp(40px,7vw,88px)] font-extrabold leading-none tracking-[-.04em] text-fg">JOIN THE CREW.</p>
        <div data-reveal="up" style={rd(1)} className="mt-8">
          <Button href="/contact/" dot className="px-10 py-3.5 text-[14px]">
            ENTRY
          </Button>
        </div>
      </section>
    </>
  );
}
