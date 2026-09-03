import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  CAREER_LEAD,
  CAREER_PATHS,
  CAREER_STEPS,
  CULTURE,
  DAILY_FLOW,
  JOBS,
  ROADMAP,
  ROADMAP_LEAD,
  STATS,
} from "@/content/recruit";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "採用情報",
  description:
    "株式会社MasKOFFの採用情報。肩書きより、感性。経歴より、偏愛。数字で見るMasKOFF、1日の流れ、techMaskLabのロードマップ、キャリアマップ、募集職種。",
  alternates: { canonical: "/recruit/" },
};

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;
/** 英字ラベル（ハンドオフの mono 小文字）。Inter Tight の小サイズ＋字間広めで置き換え */
const LABEL = "font-display text-[11px] font-medium tracking-[.15em]";

/** RECRUIT。docs/design_handoff_recruit_page を当サイトのトークン・部品に調整（ヘッダー・フッターは共通レイアウト）。内容は src/content/recruit.ts */
export default function RecruitPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "HOME", path: "/" },
            { name: "採用情報", path: "/recruit/" },
          ],
          SITE.url,
        )}
      />

      {/* ヒーロー: RECRUIT の 4 行スタック */}
      <section className="wrap overflow-hidden pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
          MASKOFF.CO.JP / RECRUIT
        </p>
        <h1
          aria-label="RECRUIT"
          className="mt-4 font-display text-[clamp(60px,10vw,140px)] font-extrabold leading-[.9] tracking-[-.04em] text-fg"
        >
          <span aria-hidden className="block">
            RECRUIT
          </span>
          <span aria-hidden className="block opacity-40">
            RECRUIT
          </span>
          <span aria-hidden className="block opacity-[.18]">
            RECRUIT
          </span>
          <span aria-hidden className="-mb-[.35em] block opacity-[.08]">
            RECRUIT
          </span>
        </h1>
        <p className="mt-10 text-[16px] font-medium text-fg-body max-sp:text-[14px]">
          採用情報 — 素顔のまま、働く。
        </p>
      </section>

      {/* CULTURE */}
      <section className="wrap section-pad border-t border-border">
        <SectionHeading en="CULTURE" ja="私たちの働き方" />
        <p
          data-reveal="up"
          className="text-[clamp(24px,3.4vw,40px)] font-bold leading-[1.5] tracking-[-.02em] text-fg"
        >
          肩書きより、感性。
          <br />
          経歴より、偏愛。
        </p>
        <p
          data-reveal="up"
          style={rd(1)}
          className="mt-8 max-w-[640px] text-body leading-[2.1] text-fg-body"
        >
          MasKOFFは少数精鋭のチームです。役職や年次に関係なく、良いと思ったものを「良い」と言える人。自分の好きを言語化できる人。つくることを、人生の真ん中に置いている人。そんな仲間を探しています。
        </p>
        <ul className="mt-14 grid gap-4 pc:grid-cols-3">
          {CULTURE.map((c, i) => (
            <li
              key={c.title}
              data-reveal="up"
              style={rd(i)}
              className="border border-border p-7 pr-6"
            >
              <p className="font-display text-[22px] font-extrabold tracking-[-.02em] text-marker">
                {c.title}
              </p>
              <p className="mt-3.5 text-caption leading-[2] text-fg-body">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* INFORMATION: 数字で見る（SAMPLE: 数値は仮） */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="INFORMATION" ja="数字で見るMasKOFF" />
        <ul className="grid grid-cols-4 gap-4 max-pc:grid-cols-2">
          {STATS.map((s, i) => (
            <li
              key={s.label}
              data-reveal="up"
              style={rd(i)}
              className="min-h-[140px] border border-border px-6 py-7"
            >
              <p className={`${LABEL} text-fg-muted`}>{s.label}</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-[48px] font-extrabold leading-none tracking-[-.04em] text-fg max-sp:text-[40px]">
                  {s.value}
                </span>
                <span className="font-display text-[20px] font-extrabold text-marker">
                  {s.unit}
                </span>
              </p>
              <p className="mt-3 text-caption text-fg-body">{s.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* DAILY FLOW: 縦タイムライン */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en={"DAILY\nFLOW"} ja="ある1日の流れ" />
        <ol className="ml-2 border-l-2 border-marker">
          {DAILY_FLOW.map((d, i) => (
            <li
              key={d.time}
              data-reveal="up"
              style={rd(i)}
              className="relative grid grid-cols-[110px_1fr] gap-6 py-5 pl-7 max-sp:grid-cols-1 max-sp:gap-1.5"
            >
              <span
                aria-hidden
                className="absolute top-[26px] -left-1.5 size-2.5 rounded-full bg-marker"
              />
              <time className="font-display text-[15px] font-medium tabular-nums text-fg">
                {d.time}
              </time>
              <div>
                <p className="text-[15px] font-bold text-fg">{d.title}</p>
                <p className="mt-1 text-[13px] leading-[1.9] text-fg-muted">
                  {d.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ROADMAP: techMaskLab */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="ROADMAP" ja="techMaskLab 学びのロードマップ" />
        <p
          data-reveal="up"
          className="mb-12 max-w-[640px] text-body leading-[2] text-fg-body"
        >
          {ROADMAP_LEAD}
        </p>
        <ol className="grid grid-cols-4 gap-4 max-pc:grid-cols-2 max-sp:grid-cols-1">
          {ROADMAP.map((r, i) => (
            <li
              key={r.phase}
              data-reveal="up"
              style={rd(i)}
              className="border border-border px-6 py-7"
            >
              <p className={`${LABEL} text-marker`}>{r.period}</p>
              <p className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] tracking-[-.02em] text-fg">
                {r.phase}
              </p>
              <p className="mt-3.5 text-[14px] font-bold text-fg">{r.title}</p>
              <p className="mt-2.5 text-caption leading-[1.9] text-fg-muted">
                {r.desc}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {r.skills.map((sk) => (
                  <li
                    key={sk}
                    className="border border-border px-2.5 py-1 font-display text-[10px] font-medium tracking-[.08em] text-fg-body"
                  >
                    {sk}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* CAREER MAP: 横タイムライン + 3 コース */}
      <section className="wrap section-pad pt-0">
        <SectionHeading
          en={"CAREER\nMAP"}
          ja="キャリアのイメージロードマップ"
        />
        <p
          data-reveal="up"
          className="mb-12 max-w-[640px] text-body leading-[2] text-fg-body"
        >
          {CAREER_LEAD}
        </p>
        <div className="relative pb-2">
          {/* 水平線は PC のみ（960px 以下は 2 列になるので消す） */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-[34px] hidden h-0.5 bg-border pc:block"
          />
          <ol className="grid grid-cols-4 gap-4 max-pc:grid-cols-2">
            {CAREER_STEPS.map((c, i) => (
              <li
                key={c.year}
                data-reveal="up"
                style={rd(i)}
                className="relative"
              >
                <p className="flex h-[68px] items-center gap-3">
                  <span
                    aria-hidden
                    className="relative z-[1] size-3.5 rounded-full bg-marker"
                  />
                  <span className="font-display text-caption font-medium tracking-[.15em] text-fg-muted">
                    {c.year}
                  </span>
                </p>
                <p className="font-display text-[22px] font-extrabold leading-[1.3] tracking-[-.02em] text-fg">
                  {c.en}
                </p>
                <p className="mt-2 text-[15px] font-bold text-fg">{c.title}</p>
                <p className="mt-2.5 text-caption leading-[1.9] text-fg-muted">
                  {c.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <ul className="mt-14 grid grid-cols-3 gap-4 max-pc:grid-cols-1">
          {CAREER_PATHS.map((p, i) => (
            <li
              key={p.en}
              data-reveal="up"
              style={rd(i)}
              className="border border-border px-6 py-7"
            >
              <p className={`${LABEL} text-marker`}>{p.en}</p>
              <p className="mt-3 text-[16px] font-black text-fg">{p.title}</p>
              <p className="mt-2.5 text-caption leading-[1.9] text-fg-body">
                {p.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* OPENINGS: 行全体がエントリー導線（/contact/） */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="OPENINGS" ja="募集職種" />
        <ul className="border-t border-border">
          {JOBS.map((j, i) => (
            <li key={j.title} data-reveal="up" style={rd(i)}>
              <Link
                href="/contact/"
                className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border px-2 py-8 transition-colors hover:bg-surface"
              >
                <span>
                  <span className="block text-[20px] font-black text-fg max-sp:text-[17px]">
                    {j.title}
                  </span>
                  <span className="mt-2 block text-caption leading-[1.9] text-fg-muted">
                    {j.desc}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="font-display text-[20px] font-bold text-marker"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p data-reveal="up" className="mt-8 text-caption text-fg-muted">
          エントリーは
          <Link
            href="/contact/"
            className="text-marker underline underline-offset-4"
          >
            お問い合わせフォーム
          </Link>
          より、ポートフォリオまたはSNSのURLを添えてご応募ください。
        </p>
      </section>

      {/* CTA 帯 */}
      <section
        id="entry"
        className="wrap section-pad border-t border-border text-center"
      >
        <p
          data-reveal="up"
          className="font-display text-[clamp(40px,7vw,88px)] font-extrabold leading-none tracking-[-.04em] text-fg"
        >
          JOIN THE CREW.
        </p>
        <div data-reveal="up" style={rd(1)} className="mt-8">
          <Button href="/contact/" dot className="px-10 py-3.5 text-[14px]">
            ENTRY
          </Button>
        </div>
      </section>
    </>
  );
}
