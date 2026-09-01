import type { CSSProperties } from "react";

// SAMPLE: 事業の関係図。文言は仮。3 つのノードはリング（中心 270,210 / r 150）の上に 120° 間隔で置く
const RING = { cx: 270, cy: 210, r: 150 };
const ORBIT_S = 18; // 玉が 1 周する秒数（CSS の vd-orbit / vd-ripple / vd-pulse と同じ周期）
const NODES = [
  { x: 270, y: 60, r: 50, label: "BRAND", t0: 0 }, // 上（玉の出発点）
  { x: 400, y: 285, r: 50, label: "CLIENT", t0: 6 }, // 30°（時計回りに 120° 進んだ位置）
  { x: 140, y: 285, r: 50, label: "ARTIST", t0: 12 }, // 150°
];
const HUBS = [
  { x: 228, y: 222, r: 46, label: "WEB" },
  { x: 312, y: 222, r: 46, label: "EC" },
];

/**
 * 相関図。data-reveal="diagram" が in になると、点線リングがマスクで描かれ、ノードがぼかしから出現する。
 * その後 2 つの玉（vd-sat）がリングを 18s で周回し、ノードを通過する瞬間（t0 / t0+9s）にノードが脈動して
 * 波紋（vd-ripple）が広がる — 参考サイトのエコシステム図と同じ仕掛け。周期は CSS 側の 18s と一致させること。
 * 色はすべて変数参照なので黒反転に追従する。reduced-motion では玉と波紋を出さない。
 * @example <VisionDiagram />
 */
export default function VisionDiagram() {
  return (
    <div data-reveal="diagram" className="w-full max-w-[540px] justify-self-center max-tab:order-last max-tab:mt-2.5">
      <svg viewBox="0 0 540 420" role="img" aria-label="ブランド・アーティスト・クライアントを Web と EC がつなぐ関係図" className="vd block h-auto w-full font-display font-bold text-fg">
        <defs>
          {/* mask 内の stroke="#fff" はマスクの輝度値（白 = 透過させる）であり色指定ではない。
              反転テーマでも変えないこと（変えるとリングが消える） */}
          <mask id="vd-mask">
            <circle className="vd-ringmask" cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke="#fff" strokeWidth="6" pathLength={1} />
          </mask>
        </defs>
        <circle className="vd-ring" cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" mask="url(#vd-mask)" />
        {/* 周回する玉。ノードの後ろを通る（DOM 順で先に描く） */}
        <circle className="vd-sat" cx={RING.cx} cy={RING.cy - RING.r} r="5.5" fill="currentColor" style={{ "--orbit": `${ORBIT_S}s` } as CSSProperties} />
        <circle className="vd-sat vd-sat2" cx={RING.cx} cy={RING.cy - RING.r} r="5.5" fill="currentColor" style={{ "--orbit": `${ORBIT_S}s` } as CSSProperties} />
        {HUBS.map((n, i) => (
          <g key={n.label} className="vd-node" style={{ "--ni": i } as CSSProperties}>
            <circle cx={n.x} cy={n.y} r={n.r} className="fill-surface stroke-border" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fill="currentColor">
              {n.label}
            </text>
          </g>
        ))}
        {NODES.map((n, i) => (
          <g key={n.label} className="vd-node" style={{ "--ni": i + HUBS.length, "--t0": `${n.t0}s`, "--orbit": `${ORBIT_S}s` } as CSSProperties}>
            {/* 波紋は 2 つ（玉ごとに 1 つ）。18s 周期の t0 / t0+9s に広がる */}
            <circle className="vd-ripple" cx={n.x} cy={n.y} r={n.r} />
            <circle className="vd-ripple vd-ripple2" cx={n.x} cy={n.y} r={n.r} />
            <g className="vd-pulse">
              <circle cx={n.x} cy={n.y} r={n.r} className="fill-surface stroke-border" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fill="currentColor">
                {n.label}
              </text>
            </g>
          </g>
        ))}
        <text className="vd-cap" x="270" y="400" textAnchor="middle" fontSize="17" letterSpacing="-0.5" fill="currentColor">
          TAKE THE MASK OFF
        </text>
      </svg>
    </div>
  );
}
