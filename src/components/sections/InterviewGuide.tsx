import InterviewSchedule from "@/components/sections/InterviewSchedule";
import InterviewStaff from "@/components/sections/InterviewStaff";
import Picture from "@/components/ui/Picture";
import { INTERVIEW, type InterviewKind } from "@/content/interview";

/** 英字ラベルの赤（小さい文字でも白地とのコントラストを取るため黒を 12% 混ぜる。Zoom ボタンと同じ） */
const RED_TEXT = "text-[color-mix(in_srgb,var(--color-marker)_88%,black)]";

/** 当日の流れのアイコン（24px グリッドの線、currentColor）。content/interview.ts の flow[].icon から引く */
const FLOW_ICON: Record<string, string> = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
  building: "M5 20.5V4.5h9v16M14 9.5h5v11M3 20.5h18M8 8h1M11 8h1M8 11.5h1M11 11.5h1M8 15h1M11 15h1M16.5 13h.5M16.5 16.5h.5",
  laptop: "M5 6.5h14v9.5H5zM2.5 19h19",
  chat: "M4 5.5h12v8H9l-3.5 3v-3H4zM16 9h4v8h-1.5v2.5L15.5 17H10v-3.5M7.5 9.5h.5M10 9.5h.5M12.5 9.5h.5",
};

/** カード見出し（赤い英字ラベル + 罫線、その下に和文の大見出し） */
function CardHeading({ en, ja, id }: { en: string; ja: string; id: string }) {
  return (
    <div>
      <p aria-hidden className={`flex items-center gap-3 font-display text-[11px] font-semibold tracking-[.22em] ${RED_TEXT}`}>
        {en}
        <span className="h-px w-16 bg-marker" />
      </p>
      <h2 id={id} className="mt-2 text-[clamp(24px,2.4vw,30px)] leading-[1.35] font-bold tracking-[.06em] text-fg">
        {ja}
      </h2>
    </div>
  );
}

/** 白いカード（日時・流れ・担当者・HP 誘導で共通の角丸と影）。SP は画面の端まで広げるので角丸なし */
const CARD = "rounded-[14px] bg-bg shadow-[0_10px_36px_color-mix(in_srgb,var(--color-fg)_7%,transparent)] max-sp:rounded-none";

/**
 * 面接の案内ページの本文（/interview/ と /interview/second/ で共用）。応募者へのメールの「当日の流れや担当者は、こちらのページで」からリンクされる。
 * 固定内容は content/interview.ts。日時は URL の ?k=（スプレッドシートの式で作る）または ?d=（InterviewSchedule）、担当者は ?s=（InterviewStaff。無ければ全員）。
 * PC は左に招待カード・HP 誘導、右に当日の流れ・面接対応者の 2 列。タブレット以下は 招待 → 流れ → 対応者 → HP 誘導 の 1 列（列の箱を contents にして order で並べ替える）。
 * @example <InterviewGuide kind="second" />
 */
export default function InterviewGuide({ kind }: { kind: InterviewKind }) {
  const { flow, prepare, titles, secondJoinNote, hero, staffIntro } = INTERVIEW;
  return (
    <div className="relative overflow-hidden bg-surface pb-24 max-sp:pb-16" data-hide-header data-hide-footer>
      <div className="wrap relative">
        {/* 上部（社名・キャッチ）。背景の室内写真と手書きは別画像で重ねる（手書きの大きさ・位置を写真の拡縮と切り離すため） */}
        <div className="relative">
          {/* 室内写真（上の壁を延ばした縦長版。下端の机を基準に置く）。PC・タブレットは右寄せで左と下を背景色へ溶かす。SP は画面幅いっぱいに敷いて下は氏名の下（招待カードの上端）まで伸ばし、縮小して右端の机・椅子が見えるようにする */}
          <Picture
            src={hero.image.bg}
            alt=""
            sizes="(max-width: 600px) 100vw, 60vw"
            priority
            className="absolute top-0 right-[calc(var(--spacing-pad-x)*-1)] block h-[360px] w-[60vw] [mask-image:linear-gradient(to_right,transparent,black_26%),linear-gradient(to_top,transparent,black_30%)] [mask-composite:intersect] max-pc:h-[300px] max-sp:-inset-x-pad-x-sp max-sp:-bottom-[80px] max-sp:h-auto max-sp:w-auto max-sp:[mask-image:none]"
            imgClassName="size-full object-cover object-left-bottom max-sp:object-right-bottom"
          />
          {/* SP は見本どおり左側を白く溶かす（文字の下は白、右に行くほど写真が見える） */}
          <span aria-hidden className="absolute -inset-x-pad-x-sp top-0 -bottom-[80px] hidden bg-[linear-gradient(to_right,var(--color-bg)_0%,color-mix(in_srgb,var(--color-bg)_85%,transparent)_30%,color-mix(in_srgb,var(--color-bg)_35%,transparent)_62%,transparent_85%)] max-sp:block" />
          {/* 手書き「TAKE THE MASK OFF」（透過 PNG）。PC は写真の左寄り、SP はキャッチの右上 */}
          <Picture src={hero.image.hand} alt={hero.image.alt} sizes="(max-width: 600px) 104px, 14vw" priority className="absolute top-[86px] left-[calc(57vw-var(--spacing-pad-x))] block w-[13vw] max-pc:top-[70px] max-pc:left-auto max-pc:right-[14%] max-pc:w-[200px] max-sp:top-[44px] max-sp:right-0 max-sp:w-[104px]" imgClassName="block h-auto w-full" />

          <header className="relative flex items-center gap-x-8 pt-7 max-sp:pt-5">
            <a href={prepare.href} className="font-display text-[30px] leading-none font-bold tracking-[-.01em] text-fg max-sp:text-[26px]">
              MasKOFF
            </a>
            <p aria-hidden className={`flex flex-1 items-center gap-4 font-display text-[11px] font-semibold tracking-[.24em] max-pc:hidden ${RED_TEXT}`}>
              {hero.label}
              <span className="h-px flex-1 bg-marker" />
            </p>
          </header>

          {/* キャッチ */}
          <div className="relative pt-12 pb-10 max-pc:pt-10 max-sp:pt-3 max-sp:pb-2">
            {/* タブレット以下は社名の行に入りきらないのでキャッチの上に置く（PC は社名の右） */}
            <p aria-hidden className={`mb-4 flex items-center gap-4 font-display text-[10px] font-semibold tracking-[.22em] max-sp:mb-2 pc:hidden ${RED_TEXT}`}>
              {hero.label}
              <span className="h-px w-16 bg-marker" />
            </p>
            <h1 className="text-[clamp(30px,5vw,58px)] leading-[1.38] font-bold tracking-[.06em] text-fg">
              <span className="sr-only">{titles[kind]}のご案内 </span>
              {hero.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h1>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-[1.85] tracking-[.08em] text-fg-body max-sp:mt-2 max-sp:text-[13px]">{hero.sub}</p>
          </div>
        </div>

        {/* SP はカードを左右の余白（wrap の 20px）の外まで広げて画面幅いっぱいに */}
        <div className="flex flex-col gap-6 max-sp:-mx-pad-x-sp max-sp:gap-4 pc:grid pc:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] pc:items-start">
          <div className="flex flex-col gap-6 max-pc:contents">
            <div className="relative max-pc:order-1">
              <InterviewSchedule title={titles[kind]} joinNote={kind === "second" ? secondJoinNote : undefined} />
            </div>

            {/* 面接の前に（HP への誘導カード）。右半分に室内写真を敷き、社名とボタンを重ねる */}
            <section aria-labelledby="iv-prepare" className={`relative overflow-hidden ${CARD} max-pc:order-4`}>
              <Picture src={hero.image.bg} alt="" sizes="(max-width: 960px) 100vw, 30vw" className="absolute inset-y-0 right-0 block w-[48%] [mask-image:linear-gradient(to_right,transparent,black_40%)] max-sp:w-full max-sp:opacity-40" imgClassName="size-full object-cover object-right" />
              <div className="relative grid grid-cols-[1fr_auto] items-end gap-6 px-8 py-8 max-sp:grid-cols-1 max-sp:px-5 max-sp:py-7">
                <div>
                  <span aria-hidden className="block h-[3px] w-10 bg-marker" />
                  <h2 id="iv-prepare" className="mt-4 text-[clamp(26px,2.6vw,34px)] leading-[1.3] font-bold tracking-[.04em] text-fg">
                    面接の前に
                    <br />
                    ご覧ください
                  </h2>
                  <p className="mt-4 max-w-[26em] text-[13px] leading-[1.85] text-fg-body">{prepare.text}</p>
                </div>
                <div className="flex flex-col items-end gap-6 max-sp:items-stretch">
                  <p aria-hidden className="font-display text-[34px] leading-none font-bold tracking-[-.01em] text-fg max-sp:hidden">
                    MasKOFF
                  </p>
                  <a href={prepare.href} target="_blank" rel="noopener" className="group flex items-center justify-between gap-5 rounded-pill bg-fg py-2.5 pr-2.5 pl-7 text-[14px] font-bold whitespace-nowrap text-fg-invert shadow-[0_6px_20px_color-mix(in_srgb,var(--color-fg)_18%,transparent)] transition-opacity hover:opacity-90">
                    {prepare.label}
                    <span aria-hidden className="flex size-9 flex-none items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-marker)_88%,black)] text-fg-invert transition-transform group-hover:translate-x-1">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6 max-pc:contents">
            {/* 当日の流れ */}
            <section aria-labelledby="iv-flow" className={`${CARD} px-8 pt-7 pb-4 max-pc:order-2 max-sp:px-5`}>
              <CardHeading en="TODAY'S FLOW" ja="当日の流れ" id="iv-flow" />
              <ol className="relative mt-4">
                {/* 赤い点をつなぐ縦線（番号 52px + 間 16px の右に 16px 幅の列） */}
                <span aria-hidden className="absolute top-9 bottom-9 left-[75px] w-px bg-marker/50 max-sp:left-[59px]" />
                {flow.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[52px_16px_52px_1fr] items-center gap-x-4 py-2.5 max-sp:grid-cols-[44px_8px_1fr] max-sp:gap-x-3">
                    <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-surface-alt font-display text-[17px] font-semibold text-fg max-sp:size-11 max-sp:text-[15px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="relative mx-auto size-[7px] rounded-full bg-marker" />
                    {/* SP はアイコンと文を薄いグレーの箱にまとめる */}
                    <div className="contents max-sp:grid max-sp:grid-cols-[40px_1fr] max-sp:items-center max-sp:gap-x-3 max-sp:rounded-[10px] max-sp:bg-surface max-sp:p-3">
                      <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-surface-alt text-fg max-sp:size-10 max-sp:bg-bg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6 max-sp:size-5">
                          <path d={FLOW_ICON[s.icon]} />
                        </svg>
                      </span>
                      <div className={`py-2 ${i < flow.length - 1 ? "border-b border-border max-sp:border-b-0" : ""}`}>
                        <p className="text-[15px] leading-[1.5] font-bold tracking-[.04em] text-fg max-sp:text-[14px]">{s.title}</p>
                        <p className="mt-1 text-[13px] leading-[1.7] text-fg-muted max-sp:text-[12px]">{s.text}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 面接対応者 */}
            <section aria-labelledby="iv-staff" className={`@container ${CARD} px-8 pt-7 pb-8 max-pc:order-3 max-sp:px-5`}>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <CardHeading en="INTERVIEWERS" ja="面接対応者一覧" id="iv-staff" />
                <p className="whitespace-pre-line text-[12px] leading-[1.85] text-fg-body">{staffIntro.text}</p>
              </div>
              <InterviewStaff />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
