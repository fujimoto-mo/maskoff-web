import type { CSSProperties } from "react";
import Handwriting from "@/components/motion/Handwriting";
import ScrollTheme from "@/components/motion/ScrollTheme";
import Picture from "@/components/ui/Picture";
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
        <div className="grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-[76px]">
          <div className="marker-block relative" data-marker-block>
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
          <div className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
            <Picture src="/images/company/vision-diagram.svg" alt="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" width={540} height={420} className="block w-full" imgClassName="h-auto w-full" />
          </div>
        </div>
      </div>
      <ScrollTheme />
    </section>
  );
}
