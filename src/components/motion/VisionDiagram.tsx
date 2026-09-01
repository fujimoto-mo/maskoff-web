import type { CSSProperties } from "react";

// SAMPLE: 事業の関係図。文言は仮
const NODES = [
  { x: 270, y: 60, r: 56, label: "BRAND" },
  { x: 120, y: 330, r: 56, label: "ARTIST" },
  { x: 420, y: 330, r: 56, label: "CLIENT" },
  { x: 228, y: 220, r: 48, label: "WEB" },
  { x: 312, y: 220, r: 48, label: "EC" },
];

/**
 * 相関図。data-reveal="diagram" が in になると、点線リングがマスクで描かれ、ノードがぼかしから出現する。
 * 色はすべて変数参照なので黒反転に追従する。
 * @example <VisionDiagram />
 */
export default function VisionDiagram() {
  return (
    <div data-reveal="diagram" className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
      <svg viewBox="0 0 540 420" role="img" aria-label="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" className="vd block h-auto w-full font-display font-bold text-fg">
        <defs>
          <mask id="vd-mask">
            <circle className="vd-ringmask" cx="270" cy="210" r="150" fill="none" stroke="#fff" strokeWidth="6" pathLength={1} />
          </mask>
        </defs>
        <circle className="vd-ring" cx="270" cy="210" r="150" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" mask="url(#vd-mask)" />
        {NODES.map((n, i) => (
          <g key={n.label} className="vd-node" style={{ "--ni": i } as CSSProperties}>
            <circle cx={n.x} cy={n.y} r={n.r} className="fill-surface stroke-border" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fill="currentColor">
              {n.label}
            </text>
          </g>
        ))}
        <text className="vd-cap" x="270" y="400" textAnchor="middle" fontSize="17" letterSpacing="-0.5" fill="currentColor">
          TAKE THE MASK OFF
        </text>
      </svg>
    </div>
  );
}
