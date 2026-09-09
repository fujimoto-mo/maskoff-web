import type { CSSProperties } from "react";
import { cubeGeometry } from "@/components/motion/cube-geometry";
import { LEADS_PC, LEADS_SP, SP, pointsAttr } from "@/components/motion/vision-leads";
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
/** 事業名ブロックの位置（PC / タブレット。引き出し線は vision-leads.ts の LEADS_PC）。引き出し線が届く内側の端を基準にする（% は viewBox 540x440 に対する比率。423/540、173/540、355/540、354/440） */
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
 * SP は HR を右上（幅 40% を右寄せ、SVG の上端に 11% 重ねる）、IT / RC を立方体の下の 2 列（各 49%、SVG 下端から 12% 引き上げ）に置き、
 * SP 用の引き出し線（LEADS_SP）でつなぐ。配置比率は vision-leads.ts の SP を CSS 変数で渡し、線の座標と同じ値を使う。
 * 出現後は 3 面が 9s 周期で順に明るくなり（vd-glow）、7s ごとに斜めの光が立方体を横切る（vd-sheen）。
 * 面の中は写真（Picture を六角形に clip-path）。膜・稜線・ラベルはトークン / currentColor で、
 * VISION の黒反転に追従する。reduced-motion では常時アニメを止める。
 * @example <VisionDiagram />
 */
const pct = (ratio: number) => `${Math.round(ratio * 1000) / 10}%`;

export default function VisionDiagram() {
  const Y = [CUBE.upperLeft, CUBE.upperRight, CUBE.bottom];
  /** 事業名ブロック。i = 0: HR / 1: IT / 2: RC（VISION_FACES・LEADS の順） */
  const block = (i: number) => {
    const face = VISION_FACES[i];
    return (
      <div
        key={face.code}
        className={cn(
          // PC: 文字は幅に比例（540px で 13px）だが 15px で頭打ち。内側の端を基準に置くので、頭打ち後も引き出し線とはずれない
          "vd-lbl absolute whitespace-nowrap text-[min(2.4cqw,15px)] leading-[2.2] font-medium text-fg-muted",
          BLOCK_POS[i],
          // SP: 12px（390px 幅で長い事業名が 2 列に収まる上限）。幅は CSS 変数（vision-leads.ts の SP）
          "max-sp:static max-sp:whitespace-normal max-sp:text-[12px] max-sp:[text-wrap:balance]",
          i === 0
            ? "max-sp:order-first max-sp:w-[var(--vd-hr-w)] max-sp:self-end max-sp:mb-[var(--vd-hr-mb)]"
            : "max-sp:w-[var(--vd-col-w)]",
        )}
        style={{ "--ni": i } as CSSProperties}
      >
        {/* 面の英字。立方体の面と引き出し線で対応が分かるので読み上げ専用 */}
        <p className="sr-only">{face.code}</p>
        <ul>
          {face.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };
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
      className="@container relative w-full max-w-[756px] self-center justify-self-center max-tab:order-last max-tab:mt-2.5 max-sp:flex max-sp:flex-col"
      style={
        {
          "--vd-hr-w": pct(1 - SP.hrLeft),
          "--vd-hr-mb": pct(-SP.hrBottom),
          "--vd-row-mt": pct(-SP.rowTop),
          "--vd-col-w": pct(SP.col),
        } as CSSProperties
      }
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
          {/* 引き出し線。PC / タブレットと SP で経路が違うので 2 組を持ち CSS で出し分ける */}
          {(
            [
              ["max-sp:hidden", LEADS_PC],
              ["hidden max-sp:block", LEADS_SP],
            ] as const
          ).map(([cls, leads]) => (
            <g key={cls} aria-hidden className={cls}>
              {leads.map((lead, i) => (
                <polyline
                  key={i}
                  className="vd-lead"
                  points={pointsAttr(lead)}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.55"
                  strokeWidth="1.25"
                  pathLength={1}
                  style={{ "--ni": i } as CSSProperties}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
      {/* HR（上面）。SP では order-first で SVG の上に回り、右寄せ 40% 幅で右上の空きに重なる */}
      {block(0)}
      {/* IT / RC（左面・右面）。PC は contents で包みを消し container 基準の absolute のまま。SP は 2 列の行 */}
      <div className="contents max-sp:flex max-sp:justify-between max-sp:mt-[var(--vd-row-mt)]">
        {block(1)}
        {block(2)}
      </div>
    </div>
  );
}
