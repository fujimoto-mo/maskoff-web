import type { CSSProperties } from "react";
import { duplicate, type MarqueeCell, type MarqueeRow } from "@/components/motion/marquee-cells";
import Picture from "@/components/ui/Picture";

type Props = {
  rows: MarqueeRow[];
  /** 各行の初期表示セルの先頭から何枚を eager / fetchPriority=high にするか（LCP 対策） */
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
  if (cell.type === "video") {
    // React は SSR で muted 属性を出さないため、再生前に MarqueeDrag が v.muted = true を設定する
    return (
      <div className="mq-vid size-full overflow-hidden rounded-[22%] bg-surface">
        <video data-mq-video className="block size-full object-cover" poster={cell.poster} muted loop playsInline preload="metadata" aria-label={cell.alt} tabIndex={-1}>
          <source src={cell.src} type="video/mp4" />
        </video>
      </div>
    );
  }
  if (cell.type === "logo") {
    return (
      <div className="flex size-full items-center justify-center">
        <div data-lead-box className="flex size-[62%] items-center justify-center rounded-[22%] bg-fg">
          <Picture
            src="/images/logo-wordmark.png"
            alt="MasKOFF"
            sizes="(max-width: 600px) 30vw, 12vw"
            priority={priority}
            className="block size-[76%]"
            imgClassName="block size-full object-contain"
          />
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
 * JS が動くと MarqueeDrag が data-js を付けて rAF 駆動に切り替え、セルを中央から順に pop させる。
 * prefers-reduced-motion では globals.css の一括停止で静止画になる。
 * @example <Marquee rows={[{ cells: [img, img, { type: "text", lines: ["TAKE THE", "MASK", "OFF"] }] }]} />
 */
export default function Marquee({ rows, eagerCount = 3 }: Props) {
  return (
    <div data-marquee className="flex flex-col gap-mq-gap overflow-hidden max-sp:gap-5">
      {rows.map((row, r) => {
        const start = row.reverse ? row.cells.length : 0;
        return (
          <div
            key={r}
            data-row
            data-reverse={row.reverse ? "" : undefined}
            data-duration={row.duration ?? 60}
            className="overflow-hidden"
          >
            <div
              className="mq-track flex w-max gap-mq-gap max-sp:gap-5"
              style={{ "--d": `${row.duration ?? 60}s` } as CSSProperties}
            >
              {duplicate(row.cells).map((cell, i) => {
                const clone = i >= row.cells.length;
                const priority = i >= start && i < start + eagerCount && cell.type === "image";
                return (
                  <div
                    key={i}
                    data-cell
                    data-lead={cell.type === "logo" && !clone ? "" : undefined}
                    aria-hidden={clone || undefined}
                    className="size-mq-cell flex-none max-sp:size-[max(160px,calc((100svh-176px)/3))]"
                  >
                    <Cell cell={cell} priority={priority} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
