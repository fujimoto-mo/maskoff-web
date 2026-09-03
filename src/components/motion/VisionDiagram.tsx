import type { CSSProperties } from "react";
import { cubeGeometry } from "@/components/motion/cube-geometry";
import Picture from "@/components/ui/Picture";
import { VISION_FACES } from "@/content/vision-diagram";
import { cn } from "@/lib/cn";

// viewBox 540x440。中心 (270,200) / 半径 150 の等角立方体。上面 = HR、左面 = IT、右面 = RC（VISION_FACES の順）
const CUBE = cubeGeometry(270, 200, 150);
/** 写真の上に重ねる明るい膜（--color-dark-fg の透明度）。上面が最も明るく、右面は写真そのまま */
const FACE_TONE = [0.18, 0.07, 0] as const;
/** 立方体に敷く写真（外接矩形 260:300 に切り抜き済み）。六角形は clip-path で切る */
const PHOTO = "/images/vision/cube.jpg";
const PHOTO_BOX = {
  left: `${(CUBE.upperLeft.x / 540) * 100}%`,
  top: `${(CUBE.top.y / 440) * 100}%`,
  width: `${((CUBE.upperRight.x - CUBE.upperLeft.x) / 540) * 100}%`,
  height: `${((CUBE.bottom.y - CUBE.top.y) / 440) * 100}%`,
} as const;
/** 引き出し線（PC / タブレット）: 面の中 → 斜め → 事業名ブロックの端へ水平。始点は各面の内側 */
const LEADS = [
  "318,112 395,43 417,43",
  "232,270 196,368 179,368",
  "308,270 340,368 349,368",
] as const;
/** 事業名ブロックの位置。引き出し線が届く内側の端を基準にする（% は viewBox 540x440 に対する比率。423/540、173/540、355/540、354/440） */
const BLOCK_POS = [
  "top-0 left-[78.3%]",
  "top-[80.5%] right-[68%]",
  "top-[80.5%] left-[65.7%]",
] as const;

/**
 * 相関図。等角の立方体を 3 面（HR / IT / RC）に分け、各面から引き出し線で事業名につなぐ。
 * data-reveal="diagram" が in になると、面が順にフェード → 中央から Y 字の稜線を線描画 →
 * 面ラベルがぼかしから出現 → 引き出し線を描いて事業名がフェード。
 * 事業名は HTML（検索・読み上げに乗せる）。PC では @container の cqw 単位で文字を立方体と同率に拡縮させ
 * （15px で頭打ち）、引き出し線が届く内側の端を基準に置くので SVG 座標の引き出し線とズレない。
 * SP は引き出し線を消し、立方体の下に縦積み。
 * 出現後は 3 面が 9s 周期で順に明るくなり（vd-glow）、7s ごとに斜めの光が立方体を横切る（vd-sheen）。
 * 面の中は写真（Picture を六角形に clip-path）。膜・稜線・ラベルはトークン / currentColor で、
 * VISION の黒反転に追従する。reduced-motion では常時アニメを止める。
 * @example <VisionDiagram />
 */
export default function VisionDiagram() {
  const Y = [CUBE.upperLeft, CUBE.upperRight, CUBE.bottom];
  const HEX = [
    CUBE.top,
    CUBE.upperRight,
    CUBE.lowerRight,
    CUBE.bottom,
    CUBE.lowerLeft,
    CUBE.upperLeft,
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  return (
    <div
      data-reveal="diagram"
      className="@container relative w-full max-w-[756px] self-center justify-self-center max-tab:order-last max-tab:mt-2.5 max-sp:flex max-sp:flex-col max-sp:gap-6"
    >
      {/* 写真と SVG を同じ箱に入れる（SP では外側が flex-col になり高さが変わるため、% の基準をここに固定） */}
      <div className="relative">
        <div
          className="vd-photo absolute [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"
          style={PHOTO_BOX}
          aria-hidden
        >
          <Picture
            src={PHOTO}
            alt=""
            sizes="(max-width: 600px) 45vw, 260px"
            className="block size-full"
            imgClassName="size-full object-cover"
          />
        </div>
        <svg
          viewBox="0 0 540 440"
          role="img"
          aria-label="HR・IT・RC の 3 領域がひとつの立方体をなす関係図"
          className="relative block h-auto w-full font-display font-bold text-fg"
        >
          <defs>
            <clipPath id="vd-clip">
              <polygon points={HEX} />
            </clipPath>
            {/* stop-color は currentColor（黒反転に追従）。opacity だけで光を作る */}
            <linearGradient id="vd-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {CUBE.faces.map((f, i) => (
            <polygon
              key={f.key}
              className="vd-face"
              points={f.pointsAttr}
              fill="var(--color-dark-fg)"
              fillOpacity={FACE_TONE[i]}
              style={{ "--ni": i, "--tone": FACE_TONE[i] } as CSSProperties}
            />
          ))}
          {/* 立方体の中だけを斜めの光が横切る（参考図の光の筋のニュアンス）。vd-sheen が 7s 周期で左→右へ */}
          <g clipPath="url(#vd-clip)" aria-hidden>
            <rect
              className="vd-sheen"
              x="-140"
              y="-60"
              width="120"
              height="560"
              fill="url(#vd-grad)"
            />
          </g>
          {/* 中央から 3 方向へ伸びる稜線。pathLength=1 で 3 本を同時に外向きに描く */}
          {Y.map((p) => (
            <line
              key={`${p.x},${p.y}`}
              className="vd-edge"
              x1={CUBE.center.x}
              y1={CUBE.center.y}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={1}
            />
          ))}
          {/* 写真の明るい部分でも読めるよう、外側の g で影を付ける（vd-node 側は blur → none を遷移するため分ける） */}
          <g className="vd-shadow">
            {CUBE.faces.map((f, i) => (
              <text
                key={f.key}
                className="vd-node"
                x={f.centroid.x}
                y={f.centroid.y + 16}
                textAnchor="middle"
                fontSize="46"
                letterSpacing="-1.5"
                fill="currentColor"
                style={{ "--ni": i + 6 } as CSSProperties}
              >
                {VISION_FACES[i].code}
              </text>
            ))}
          </g>
          <g aria-hidden className="max-sp:hidden">
            {LEADS.map((pts, i) => (
              <polyline
                key={pts}
                className="vd-lead"
                points={pts}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.55"
                strokeWidth="1.25"
                pathLength={1}
                style={{ "--ni": i } as CSSProperties}
              />
            ))}
          </g>
        </svg>
      </div>
      {VISION_FACES.map((face, i) => (
        <div
          key={face.code}
          className={cn(
            // 文字は幅に比例（540px で 13px）だが 15px で頭打ち。内側の端を基準に置くので、頭打ち後も引き出し線とはずれない
            "vd-lbl absolute whitespace-nowrap text-[min(2.4cqw,15px)] leading-[2.2] font-medium text-fg-muted max-sp:static max-sp:whitespace-normal max-sp:text-[13px]",
            BLOCK_POS[i],
            // SP: viewBox 下部の引き出し線用の空き（約 20%）を詰める
            i === 0 && "max-sp:-mt-9",
          )}
          style={{ "--ni": i } as CSSProperties}
        >
          {/* 面の英字。PC では立方体の面と引き出し線で対応が分かるので読み上げ専用、SP では見出しとして表示 */}
          <p className="sr-only font-display text-[16px] font-bold text-fg max-sp:not-sr-only max-sp:mb-1">
            {face.code}
          </p>
          <ul>
            {face.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
