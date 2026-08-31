import type { CSSProperties } from "react";
import { duplicate, type MarqueeCell, type MarqueeRow } from "@/components/motion/marquee-cells";
import Picture from "@/components/ui/Picture";
import { cn } from "@/lib/cn";

type Props = {
  rows: MarqueeRow[];
  /** 先頭行の先頭から何枚を eager / fetchPriority=high にするか（LCP 対策） */
  eagerCount?: number;
};

function Cell({ cell, priority }: { cell: MarqueeCell; priority: boolean }) {
  if (cell.type === "image") {
    return (
      <Picture
        src={cell.src}
        alt={cell.alt ?? ""}
        sizes="(max-width: 600px) 45vw, 20vw"
        priority={priority}
        className="block size-full"
        imgClassName="size-full object-contain"
      />
    );
  }
  if (cell.type === "logo") {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="flex size-[62%] items-center justify-center rounded-[22%] bg-fg font-display text-[min(3.4vw,28px)] font-extrabold tracking-[-.04em] text-fg-invert">
          MasKOFF
        </div>
      </div>
    );
  }
  return (
    <div className="flex size-full flex-col items-center justify-center text-center font-display text-[min(6.6vw,30px)] font-bold uppercase leading-[.92] tracking-[-.012em] text-fg">
      {cell.lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </div>
  );
}

/**
 * 横無限マーキー。各行の cells を 2 回描画して translateX(-50%) でループする。
 * prefers-reduced-motion では globals.css の一括停止で静止画になる。
 * @example <Marquee rows={[{ cells: [img, img, { type: "text", lines: ["TAKE THE", "MASK", "OFF"] }] }]} />
 */
export default function Marquee({ rows, eagerCount = 3 }: Props) {
  return (
    <div className="flex flex-col gap-mq-gap overflow-hidden max-sp:gap-5">
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <div
            className={cn(
              "flex w-max gap-mq-gap max-sp:gap-5",
              row.reverse ? "animate-[drift-rev_var(--d)_linear_infinite]" : "animate-[drift_var(--d)_linear_infinite]",
            )}
            style={{ "--d": `${row.duration ?? 60}s` } as CSSProperties}
          >
            {duplicate(row.cells).map((cell, i) => {
              const clone = i >= row.cells.length;
              return (
                <div key={i} aria-hidden={clone || undefined} className="size-mq-cell flex-none max-sp:size-[max(160px,calc((100svh-176px)/3))]">
                  <Cell cell={cell} priority={r === 0 && !clone && i < eagerCount && cell.type === "image"} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
