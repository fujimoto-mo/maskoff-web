import Link from "next/link";
import type { CSSProperties } from "react";
import { cubeGeometry } from "@/components/motion/cube-geometry";
import { LEADS_PC, LEADS_SP, SP, pointsAttr } from "@/components/motion/vision-leads";
import Picture from "@/components/ui/Picture";
import { VISION_FACES } from "@/content/vision-diagram";
import { cn } from "@/lib/cn";

// viewBox 540x440。中心 (270,200) / 半径 150 の等角立方体。上面 = HR、左面 = MK（Marketing）、右面 = CR（Creative）（VISION_FACES の順）
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
/**
 * 領域ブロックの位置（PC / タブレット。引き出し線は vision-leads.ts の LEADS_PC）。横は引き出し線が届く内側の端を基準にする（% は viewBox 540 に対する比率。423/540、173/540、355/540）。
 * 縦は引き出し線の水平な末尾（y = 43 / 368、440 に対し 9.8% / 83.6%）が 1 行目の見出し（22px × 1.25 = 27.5px）の中心に来るよう、見出しの半分（13.75px / 616px ≒ 2.2%）だけ上げる
 */
const BLOCK_POS = [
  "top-[7.5%] left-[78.3%]",
  "top-[81.4%] right-[68%]",
  "top-[81.4%] left-[65.7%]",
] as const;
/** 領域名と矢印の色（HR / MK / CR）。tokens.css の --color-accent-*（白地用）を ScrollTheme が黒地用へ補間する。面の英字と項目は無彩色のまま */
const ACCENT = ["text-accent-hr", "text-accent-mk", "text-accent-cr"] as const;

/**
 * 相関図。等角の立方体を 3 面（HR / MK / CR）に分け、各面から引き出し線で領域ブロック（英字の領域名 → 和文の事業名 → サービス 4 つ）につなぐ。
 * data-reveal="diagram" が in になると、面が順にフェード → 中央から Y 字の稜線を線描画 →
 * 面ラベルがぼかしから出現 → 引き出し線を描いてブロックがフェード。
 * ブロックは HTML（検索・読み上げに乗せる）。PC では @container の cqw 単位で文字を立方体と同率に拡縮させ
 * （見出し 22px / 本文 15px で頭打ち）、引き出し線が届く内側の端を基準に置くので SVG 座標の引き出し線とズレない。
 * ブロックは参考図に倣いセリフ体（tokens.css の --font-serif。OS 標準の Georgia + 明朝）で、英字の領域名 → 和文の事業名（事業一覧へのリンク。丸囲みの矢印付き）→ サービス項目の 3 段。
 * 領域名と矢印だけ参考図の 3 色（ACCENT。CLAUDE.md §4-1 の例外）で、面の英字・事業名・項目は無彩色。
 * SP は HR を右上（幅 45% を右寄せ、SVG の上端に 11% 重ねる）、MK / CR を立方体の下の 2 列（各 49%、SVG 下端から 12% 引き上げ）に置き、
 * SP 用の引き出し線（LEADS_SP）でつなぐ。配置比率は vision-leads.ts の SP を CSS 変数で渡し、線の座標と同じ値を使う。
 * 出現後は 3 面が 9s 周期で順に明るくなり（vd-glow）、7s ごとに斜めの光が立方体を横切る（vd-sheen）。
 * 面の中は写真（Picture を六角形に clip-path）。膜・稜線・ラベルはトークン / currentColor で、
 * VISION の黒反転に追従する。reduced-motion では常時アニメを止める。
 * @example <VisionDiagram />
 */
const pct = (ratio: number) => `${Math.round(ratio * 1000) / 10}%`;

export default function VisionDiagram() {
  const Y = [CUBE.upperLeft, CUBE.upperRight, CUBE.bottom];
  /** 領域ブロック。i = 0: HR / 1: MK / 2: CR（VISION_FACES・LEADS の順） */
  const block = (i: number) => {
    const face = VISION_FACES[i];
    return (
      <div
        key={face.code}
        className={cn(
          // PC: 文字は幅に比例（540px で 13px）だが 15px で頭打ち。内側の端を基準に置くので、頭打ち後も引き出し線とはずれない
          "vd-lbl absolute whitespace-nowrap font-serif text-[min(2.4cqw,15px)] leading-[2.1] tracking-[.03em] text-fg-muted",
          BLOCK_POS[i],
          // SP: 12〜13px を幅に比例させる（390px で 13px、360px で 12.2px。下段の列幅 49% に 12 文字の項目が 1 行で入る）。幅は CSS 変数（vision-leads.ts の SP）
          "max-sp:static max-sp:whitespace-normal max-sp:text-[clamp(12px,3.4vw,13px)] max-sp:[text-wrap:balance]",
          i === 0
            ? "max-sp:order-first max-sp:w-[var(--vd-hr-w)] max-sp:self-end max-sp:mb-[var(--vd-hr-mb)]"
            : "max-sp:w-[var(--vd-col-w)]",
        )}
        style={{ "--ni": i } as CSSProperties}
      >
        {/* 領域名（セリフ体・細め・大きめ）。引き出し線の水平な末尾は 1 行目の中心に届く（BLOCK_POS）。上面ブロックは 1440px で列の右端まで 164px しかないため 22px が上限 */}
        <p className={cn("text-[min(3cqw,22px)] leading-[1.25] tracking-[.01em] max-sp:text-[17px]", ACCENT[i])}>{face.en}</p>
        {/* 和文の事業名。参考図の丸囲みの矢印を添えて事業一覧へリンクする（矢印は装飾なので aria-hidden）。矢印は文中に流し込み、折り返しても最後の文字に付いて回る */}
        <p className="mt-1.5 leading-[1.6]">
          <Link
            href="/service/"
            className="group/lnk text-[min(2.2cqw,14px)] tracking-[.06em] text-fg max-sp:text-[12px] max-sp:tracking-[.04em]"
          >
            {face.ja}
            <span
              aria-hidden
              className={cn(
                "ml-1.5 inline-grid size-4 place-items-center rounded-full border border-current align-middle opacity-80 transition-opacity duration-300 group-hover/lnk:opacity-100",
                ACCENT[i],
              )}
            >
              <svg viewBox="0 0 10 10" className="size-2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 5h6M5 2l3 3-3 3" />
              </svg>
            </span>
          </Link>
        </p>
        <ul className="mt-3">
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
          aria-label="HR・Marketing・Creative の 3 領域がひとつの立方体をなす関係図"
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
              strokeWidth="2.5"
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
      {/* MK / CR（左面・右面）。PC は contents で包みを消し container 基準の absolute のまま。SP は 2 列の行 */}
      <div className="contents max-sp:flex max-sp:justify-between max-sp:mt-[var(--vd-row-mt)]">
        {block(1)}
        {block(2)}
      </div>
    </div>
  );
}
