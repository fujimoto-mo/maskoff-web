import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import Marker from "@/components/ui/Marker";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Segment } from "@/content/service-details";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;

/**
 * SERVICE 詳細の OVERVIEW。段落が順にフェードし、{ marker } は蛍光ペン（background-size 方式）。
 * max-w は段落の読みやすさのための本文幅（コンテナの中央寄せではない。既存 OVERVIEW と同じ扱い）。
 * @example <ServiceOverview intro={getServiceDetail("sns").intro} />
 */
export default function ServiceOverview({ intro }: { intro: readonly (readonly Segment[])[] }) {
  return (
    <section aria-labelledby="sv-overview" className="wrap section-pad">
      <SectionHeading en="OVERVIEW" ja="事業概要" id="sv-overview" />
      <div className="mt-[clamp(32px,4vw,48px)] max-w-[760px] space-y-6">
        {intro.map((para, i) => (
          <p key={i} data-reveal="up" style={rd(i)} className="text-[15px] leading-[2.1] text-fg-body max-sp:text-body-sp">
            {para.map((seg, k) => (typeof seg === "string" ? <span key={k}>{seg}</span> : <Marker key={k}>{seg.marker}</Marker>))}
          </p>
        ))}
      </div>
    </section>
  );
}
