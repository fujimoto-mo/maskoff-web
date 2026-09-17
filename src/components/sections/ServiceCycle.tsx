import type { CSSProperties } from "react";
import { revealDelay } from "@/components/motion/reveal-delay";
import SectionHeading from "@/components/ui/SectionHeading";

const rd = (i: number) => ({ "--rd": `${revealDelay(i)}ms` }) as CSSProperties;
/** 4 ノードの位置（上 → 右 → 下 → 左）。viewBox 0 0 400 400、半径 140 */
const POS = [
  { x: 200, y: 60 },
  { x: 340, y: 200 },
  { x: 200, y: 340 },
  { x: 60, y: 200 },
] as const;

/**
 * SERVICE 詳細のループ図（CYCLE: 企画 → 設計 → 開発 → 改善）。PC は円環（弧を順に線描画）+ 各ノードの説明、≤960 は縦並び。
 * 弧とノードの演出は globals.css の .cyc-arc / .cyc-node（data-reveal="up" と連動）。
 * @example <ServiceCycle en="CYCLE" ja="育てる開発サイクル" items={[{ title: "企画", text: "…" }, …]} />
 */
export default function ServiceCycle({ en, ja, items }: { en: string; ja: string; items: readonly { title: string; text: string }[] }) {
  const id = `sv-${en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="wrap section-pad pt-0">
      <SectionHeading en={en} ja={ja} id={id} />
      <div className="mt-[clamp(32px,4vw,48px)] grid gap-gap-cols pc:grid-cols-[minmax(0,420px)_1fr] pc:items-center">
        <svg data-reveal="up" viewBox="0 0 400 400" role="img" aria-label={`${items.map((i) => i.title).join(" → ")} を繰り返すループ`} className="block w-full max-w-[420px] text-fg">
          {POS.map((p, i) => {
            const q = POS[(i + 1) % 4];
            return (
              <path
                key={i}
                className="cyc-arc"
                style={{ "--i": i } as CSSProperties}
                d={`M ${p.x} ${p.y} A 140 140 0 0 1 ${q.x} ${q.y}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                pathLength={1}
              />
            );
          })}
          {POS.map((p, i) => (
            <g key={items[i]?.title ?? i} className="cyc-node" style={{ "--i": i } as CSSProperties}>
              <circle cx={p.x} cy={p.y} r="34" fill="var(--color-fg)" />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-fg-invert)">
                {items[i]?.title}
              </text>
            </g>
          ))}
        </svg>
        <ol className="space-y-5">
          {items.map((it, i) => (
            <li key={it.title} data-reveal="up" style={rd(i + 1)} className="grid grid-cols-[26px_1fr] gap-4">
              <span aria-hidden className="flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert">
                {i + 1}
              </span>
              <div>
                <b className="block text-[16px] font-bold leading-[1.5] text-fg">{it.title}</b>
                <p className="mt-1.5 text-caption leading-[1.9] text-fg-body">{it.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
