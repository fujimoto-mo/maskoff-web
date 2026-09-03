import type { CSSProperties } from "react";
import Handwriting from "@/components/motion/Handwriting";
import MarkerLayer from "@/components/motion/MarkerLayer";
import ScrollTheme from "@/components/motion/ScrollTheme";
import VisionDiagram from "@/components/motion/VisionDiagram";
import SectionHeading from "@/components/ui/SectionHeading";
import { VISION_COPY } from "@/content/vision-copy";

/**
 * VISION。本文は行構造で出力し、RevealObserver が PC では段落単位・SP では行単位で in にする。
 * 背景反転は ScrollTheme、手書き線は Handwriting、マーカーは MarkerLayer、相関図は VisionDiagram。
 */
export default function VisionBlock() {
  return (
    <section id="vision" aria-labelledby="vision-title" className="section-pad">
      <div className="wrap">
        <SectionHeading en="VISION" ja="私たちの想い" id="vision-title" />
        {/* 右カラムを 1.35 倍取り、相関図（max 756px）が 1440px で列いっぱいに入るようにする */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-gap-cols max-tab:grid-cols-1 max-tab:gap-[76px]">
          <div className="marker-block relative" data-marker-block>
            <MarkerLayer />
            <Handwriting />
            <div className="relative z-[1] space-y-[22px] text-body leading-[2] text-fg max-sp:text-body-sp [&>p]:max-w-[560px]">
              {VISION_COPY.map((paragraph, pi) => (
                <p key={pi} data-reveal="para">
                  {paragraph.map((line, li) => (
                    <span key={li} className="vln">
                      <span className="vlt" data-reveal="line" style={{ "--li": li } as CSSProperties}>
                        {line.map((seg, si) =>
                          typeof seg === "string" ? (
                            seg
                          ) : (
                            <span key={si} className="marker-target">
                              {seg.marker}
                            </span>
                          ),
                        )}
                      </span>
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
          <VisionDiagram />
        </div>
      </div>
      <ScrollTheme />
    </section>
  );
}
