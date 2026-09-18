import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Marker from "@/components/ui/Marker";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Segment } from "@/content/service-details";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;
const PARA = "text-[15px] leading-[2.1] whitespace-pre-line text-fg-body max-sp:text-body-sp";

const paragraphs = (paras: readonly (readonly Segment[])[], offset: number) =>
  paras.map((para, i) => (
    <p key={i} data-reveal="up" style={rd(offset + i)} className={PARA}>
      {para.map((seg, k) => (typeof seg === "string" ? <span key={k}>{seg}</span> : <Marker key={k}>{seg.marker}</Marker>))}
    </p>
  ));

/**
 * SERVICE 詳細のブランドストーリー（STORY: DotHyphen）。PC は左にコンセプト、右にストーリーの 2 カラム。SP は縦積み。
 * 文字列の "\n" は全幅で改行として効く（詩的な行分けなので OVERVIEW と違い SP でも改行する）。{ marker } は蛍光ペン。
 * @example <ServiceStory en="STORY" ja="ブランドストーリー" concept={[["…"]]} body={[["…"]]} note="2025 年 7 月 7 日" />
 */
export default function ServiceStory({
  en,
  ja,
  concept,
  body,
  note,
}: {
  en: string;
  ja: string;
  concept: readonly (readonly Segment[])[];
  body: readonly (readonly Segment[])[];
  note?: string;
}) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div className="mt-[clamp(32px,4vw,48px)] grid gap-x-gap-cols gap-y-10 pc:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-5">
          <p data-reveal="up" style={rd(0)} className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">
            CONCEPT
          </p>
          {paragraphs(concept, 1)}
        </div>
        <div className="space-y-5 border-border pc:border-l pc:pl-[clamp(32px,4vw,64px)]">
          {paragraphs(body, concept.length + 1)}
          {note && (
            <p data-reveal="up" style={rd(concept.length + body.length + 1)} className="text-caption text-fg-muted">
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
