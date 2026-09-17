import type { CSSProperties } from "react";
import Picture from "@/components/ui/Picture";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Img } from "@/content/service-details";
import { cn } from "@/lib/cn";

type Step = { title: string; text: string; image?: Img };
type Props = { en: string; ja: string; steps: readonly Step[]; variant?: "horizontal" | "vertical" | "stairs" };

/**
 * SERVICE 詳細の手順（FLOW / CURRICULUM / PROCESS / STEPS / HOW IT WORKS）。
 * horizontal: PC は横並びで線（::before）が左→右に伸び番号が順に点灯（≤960 は縦）。
 * vertical: 常に縦タイムライン。stairs: PC は右上がりの階段（globals.css の .sv-stairs、線なし）。
 * steps[].image があれば PC で写真を上に置く（写真つきは線を出さない）。
 * @example <ServiceFlow en="FLOW" ja="ご依頼の流れ" steps={steps} />
 * @example <ServiceFlow en="STEPS" ja="理想のキャリアまで" steps={steps} variant="stairs" />
 */
export default function ServiceFlow({ en, ja, steps, variant = "horizontal" }: Props) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const horizontal = variant !== "vertical";
  const withImages = steps.some((s) => s.image);
  const noLine = variant === "stairs" || withImages;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <ol
        data-reveal="flow"
        data-variant={variant}
        style={{ "--n": steps.length } as CSSProperties}
        className={cn(
          "relative mt-[clamp(32px,4vw,48px)] grid gap-x-6 gap-y-8 before:absolute before:bg-border before:content-['']",
          "max-pc:before:top-0 max-pc:before:bottom-0 max-pc:before:left-[13px] max-pc:before:w-px max-pc:before:origin-top",
          horizontal && "pc:auto-cols-fr pc:grid-flow-col pc:before:top-[13px] pc:before:right-0 pc:before:left-0 pc:before:h-px pc:before:origin-left",
          !horizontal && "pc:before:top-0 pc:before:bottom-0 pc:before:left-[13px] pc:before:w-px pc:before:origin-top",
          variant === "stairs" && "sv-stairs pc:items-end",
          noLine && "pc:before:hidden",
        )}
      >
        {steps.map((s, i) => (
          <li key={s.title} style={{ "--i": i } as CSSProperties} className={cn("relative pl-[42px]", horizontal && !withImages && "pc:pt-11 pc:pl-0", horizontal && withImages && "pc:pl-0")}>
            {s.image && (
              <div className="mb-5 hidden overflow-hidden rounded-visual bg-surface pc:block">
                <Picture src={s.image.src} alt={s.image.alt} sizes="25vw" className="block aspect-[4/3] w-full" imgClassName="size-full object-cover" />
              </div>
            )}
            <span
              aria-hidden
              className={cn(
                "flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert",
                withImages ? "absolute left-0 pc:relative pc:mb-3" : "absolute top-0 left-0",
              )}
            >
              {i + 1}
            </span>
            <b className="block text-[15px] font-bold leading-[1.55] text-fg">{s.title}</b>
            <span className="mt-1.5 block text-caption leading-[1.8] text-fg-muted">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
