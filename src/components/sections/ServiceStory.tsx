import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Marker from "@/components/ui/Marker";
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
 * SERVICE 詳細のプロダクト紹介（ServiceProduct）の右カラムに入れるブランドストーリー（CASE: DotHyphen）。
 * 小さな「STORY」ラベルと和文の見出し → コンセプト → ストーリー → 注記の順に縦に並ぶ。
 * 文字列の "\n" は全幅で改行として効く（詩的な行分けなので OVERVIEW と違い SP でも改行する）。{ marker } は蛍光ペン。
 * @example <ServiceStory ja="DotHyphen のブランドストーリー" concept={[["…"]]} body={[["…"]]} note="2025 年 7 月 7 日" delay={0} />
 */
export default function ServiceStory({
  ja,
  concept,
  body,
  note,
  delay = 0,
}: {
  ja: string;
  concept: readonly (readonly Segment[])[];
  body: readonly (readonly Segment[])[];
  note?: string;
  /** リビールの開始インデックス（ServiceProduct 内の順番に合わせる） */
  delay?: number;
}) {
  return (
    <div className="space-y-5">
      <div data-reveal="up" style={rd(delay)}>
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">STORY</p>
        <p className="mt-1 text-[16px] font-bold leading-[1.5] text-fg">{ja}</p>
      </div>
      {paragraphs(concept, delay + 1)}
      {paragraphs(body, delay + 1 + concept.length)}
      {note && (
        <p data-reveal="up" style={rd(delay + 1 + concept.length + body.length)} className="text-caption text-fg-muted">
          {note}
        </p>
      )}
    </div>
  );
}
