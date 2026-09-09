import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/ui/JsonLd";
import Marker from "@/components/ui/Marker";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  CAREER_LEAD,
  CAREER_NOTE,
  CAREER_PATHS,
  CAREER_STEPS,
  CULTURE,
  DAILY_FLOW,
  JOBS,
  MESSAGE_BODY,
  MESSAGE_HEADING,
  ROADMAP,
  ROADMAP_LEAD,
  ROADMAP_NOTE,
  STATS,
  STATS_BODY,
  STATS_NOTES,
  SUPPORT_BODY,
  SUPPORT_CLOSE,
  SUPPORT_HEADING,
  SUPPORT_NOTES,
  SUPPORT_QUESTIONS,
  WHY_FORMULA,
  WHY_HEADING,
  WHY_INTRO,
  WHY_ITEMS,
  WHY_NOTE,
  WHY_OUTRO,
} from "@/content/recruit";
import type { Segment } from "@/content/vision-copy";
import { cn } from "@/lib/cn";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "採用情報",
  description:
    "株式会社MasKOFFの採用情報。未経験から、経験をつくる。数字で見るMasKOFF、私たちの考え方、キャリアのロードマップ、専任担当者の伴走、その先の3つのキャリア、募集職種。",
  alternates: { canonical: "/recruit/" },
};

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;
/** 英字ラベル（ハンドオフの mono 小文字）。Inter Tight の小サイズ＋字間広めで置き換え */
const LABEL = "font-display text-[11px] font-medium tracking-[.15em] text-fg-muted";
/** 欄外の注記（集計条件・保証しない旨） */
const NOTE = "text-caption leading-[1.9] text-fg-muted";
const pad2 = (n: number) => String(n).padStart(2, "0");
/** 本文セグメント（文字列 or マーカー）を描画 */
const segments = (segs: readonly Segment[]) =>
  segs.map((s, i) =>
    typeof s === "string" ? (
      <Fragment key={i}>{s}</Fragment>
    ) : (
      <Marker key={i}>{s.marker}</Marker>
    ),
  );

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

      {/* INFORMATION: 数字で見る（集計条件は STATS_NOTES） */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="INFORMATION" ja="数字で見るMasKOFF" />
        <ul className="grid grid-cols-3 gap-4 max-sp:grid-cols-1">
          {STATS.map((s, i) => (
            <li
              key={s.label}
              data-reveal="up"
              style={rd(i)}
              className="min-h-[140px] border border-border px-6 py-7"
            >
              <p className={LABEL}>{s.label}</p>
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
        <p
          data-reveal="up"
          className="mt-10 max-w-[720px] text-body leading-[2.1] text-fg-body"
        >
          {STATS_BODY}
        </p>
        <ul data-reveal="up" className={cn("mt-6 max-w-[860px] space-y-1.5", NOTE)}>
          {STATS_NOTES.map((n) => (
            <li key={n}>※{n}</li>
          ))}
        </ul>
      </section>

      {/* WHY MASKOFF: 未経験から、経験をつくる。 */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en={"WHY\nMASKOFF"} ja="私たちの考え方" />
        <h3
          data-reveal="up"
          className="text-[clamp(24px,3.4vw,40px)] font-bold leading-[1.5] tracking-[-.02em] text-fg"
        >
          {WHY_HEADING[0]}
          <br />
          {WHY_HEADING[1]}
        </h3>
        <p
          data-reveal="up"
          style={rd(1)}
          className="mt-8 max-w-[640px] text-body leading-[2.1] text-fg-body"
        >
          {WHY_INTRO}
        </p>
        <p
          data-reveal="up"
          style={rd(2)}
          aria-label={WHY_FORMULA.join("、")}
          className="mt-6 text-[clamp(20px,2.8vw,32px)] font-bold tracking-[-.02em] text-fg"
        >
          {WHY_FORMULA.map((w, i) => (
            <Fragment key={w}>
              {i > 0 && (
                <span aria-hidden className="mx-3 font-display text-marker">
                  ×
                </span>
              )}
              {w}
            </Fragment>
          ))}
        </p>
        <p
          data-reveal="up"
          style={rd(3)}
          className="mt-6 max-w-[640px] text-body leading-[2.1] text-fg-body"
        >
          {WHY_OUTRO}
        </p>
        <p data-reveal="up" style={rd(4)} className={cn("mt-4 max-w-[860px]", NOTE)}>
          ※{WHY_NOTE}
        </p>
        <div className="mt-14 border-t border-border">
          {WHY_ITEMS.map((item, i) => (
            <article
              key={item.title}
              data-reveal="up"
              style={rd(i)}
              className="grid gap-x-gap-cols gap-y-5 border-b border-border py-10 pc:grid-cols-[minmax(0,360px)_1fr]"
            >
              <h4 className="text-[20px] font-bold leading-[1.6] text-fg [text-wrap:pretty] max-sp:text-[17px]">
                {item.title}
              </h4>
              <div className="max-w-[720px]">
                {item.body.map((para, pi) => (
                  <p
                    key={pi}
                    className={cn(
                      "text-body leading-[2.1] text-fg-body",
                      pi > 0 && "mt-4",
                    )}
                  >
                    {segments(para)}
                  </p>
                ))}
                {item.link && (
                  <p className="mt-6">
                    <Button href={item.link.href} variant="liquid">
                      {item.link.label}
                    </Button>
                  </p>
                )}
                {item.note && <p className={cn("mt-5", NOTE)}>※{item.note}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* DAILY FLOW: 縦タイムライン */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en={"DAILY\nFLOW"} ja="試用期間中の1日の流れ" />
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

      {/* ROADMAP: 未経験 → 育成 → 経験 → 経歴 → 市場価値 → キャリアアップ */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="ROADMAP" ja="キャリアのロードマップ" />
        <p
          data-reveal="up"
          className="mb-12 max-w-[640px] text-body leading-[2] text-fg-body"
        >
          {ROADMAP_LEAD}
        </p>
        <ol className="grid grid-cols-3 gap-4 max-pc:grid-cols-2 max-sp:grid-cols-1">
          {ROADMAP.map((r, i) => (
            <li
              key={r.step}
              data-reveal="up"
              style={rd(i)}
              className="border border-border px-6 py-7"
            >
              <p className={`${LABEL} text-marker`}>{r.step}</p>
              <p className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] tracking-[-.02em] text-fg">
                {r.en}
              </p>
              <p className="mt-3.5 text-[16px] font-bold text-fg">{r.title}</p>
              <p className="mt-2.5 text-caption leading-[1.9] text-fg-muted">
                {r.desc}
              </p>
            </li>
          ))}
        </ol>
        <p data-reveal="up" className={cn("mt-8 max-w-[860px]", NOTE)}>
          ※{ROADMAP_NOTE}
        </p>
      </section>

      {/* SUPPORT: 専任担当者と月 1 回のオンライン面談 */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="SUPPORT" ja="専任担当者の伴走" />
        <div className="grid gap-x-gap-cols gap-y-10 pc:grid-cols-2">
          <div>
            <h3
              data-reveal="up"
              className="text-[clamp(24px,3.4vw,40px)] font-bold leading-[1.5] tracking-[-.02em] text-fg"
            >
              {SUPPORT_HEADING[0]}
              <br />
              {SUPPORT_HEADING[1]}
            </h3>
            {SUPPORT_BODY.map((para, i) => (
              <p
                key={i}
                data-reveal="up"
                style={rd(i + 1)}
                className="mt-6 max-w-[640px] text-body leading-[2.1] text-fg-body"
              >
                {segments(para)}
              </p>
            ))}
          </div>
          <div>
            <p data-reveal="up" className={LABEL}>
              MONTHLY ONLINE MEETING
            </p>
            <ol className="mt-4 border-t border-border">
              {SUPPORT_QUESTIONS.map((q, i) => (
                <li
                  key={q}
                  data-reveal="up"
                  style={rd(i)}
                  className="flex items-baseline gap-5 border-b border-border py-5"
                >
                  <span className="font-display text-[22px] font-extrabold leading-none tracking-[-.04em] text-marker">
                    {pad2(i + 1)}
                  </span>
                  <span className="text-[16px] font-bold text-fg max-sp:text-[15px]">
                    {q}
                  </span>
                </li>
              ))}
            </ol>
            <p
              data-reveal="up"
              style={rd(5)}
              className="mt-6 text-body leading-[2.1] text-fg-body"
            >
              {SUPPORT_CLOSE}
            </p>
          </div>
        </div>
        <ul data-reveal="up" className={cn("mt-10 max-w-[860px] space-y-1.5", NOTE)}>
          {SUPPORT_NOTES.map((n) => (
            <li key={n}>※{n}</li>
          ))}
        </ul>
      </section>

      {/* CAREER MAP: 横タイムライン + その先の 3 つのキャリア */}
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
              <p className="mt-3 text-[18px] font-black text-fg">{p.title}</p>
              <p className="mt-2.5 text-caption leading-[1.9] text-fg-body">
                {p.desc}
              </p>
            </li>
          ))}
        </ul>
        <p data-reveal="up" className={cn("mt-8 max-w-[860px]", NOTE)}>
          ※{CAREER_NOTE}
        </p>
      </section>

      {/* MESSAGE: 「今の経歴」で、未来を決めない。 */}
      <section className="wrap section-pad pt-0">
        <SectionHeading en="MESSAGE" ja="メッセージ" />
        <div className="grid gap-x-gap-cols gap-y-8 pc:grid-cols-2">
          <h3
            data-reveal="up"
            className="text-[clamp(26px,3.8vw,44px)] font-bold leading-[1.45] tracking-[-.02em] text-fg"
          >
            {MESSAGE_HEADING[0]}
            <br />
            {MESSAGE_HEADING[1]}
          </h3>
          <div>
            {MESSAGE_BODY.map((para, i) => (
              <p
                key={i}
                data-reveal="up"
                style={rd(i)}
                className={cn(
                  "text-[16px] font-medium leading-[2.2] text-fg-body max-sp:text-[15px]",
                  i > 0 && "mt-6",
                )}
              >
                {para.map((line, li) => (
                  <Fragment key={line}>
                    {li > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>
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
        <p data-reveal="up" style={rd(1)} className="mt-6 text-body text-fg-muted">
          エントリーはお問い合わせフォームから。
        </p>
        <div data-reveal="up" style={rd(2)} className="mt-10">
          <Button
            href="/contact/"
            variant="liquid"
            size="md"
            className="min-w-[214px] max-sp:w-full max-sp:min-w-0"
          >
            ENTRY
          </Button>
        </div>
      </section>
    </>
  );
}
