import InterviewSchedule from "@/components/sections/InterviewSchedule";
import InterviewStaff from "@/components/sections/InterviewStaff";
import Picture from "@/components/ui/Picture";
import { INTERVIEW, type InterviewKind } from "@/content/interview";

/** 赤い筆記体の飾り（「Recruit Event」「Flow」など）。読み上げない */
function Script({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span aria-hidden className={`block w-fit origin-bottom-left -rotate-6 pb-2 font-script text-[46px] leading-[1.15] text-marker ${className}`}>
      {children}
    </span>
  );
}

const H2 = "mt-3 text-[clamp(24px,3.4vw,30px)] font-bold tracking-[.04em] text-fg";

/**
 * 面接の案内ページの本文（/interview/ と /interview/second/ で共用）。応募者へのメールの「当日の流れや担当者は、こちらのページで」からリンクされる。
 * 固定内容は content/interview.ts。日時は URL の ?k=（スプレッドシートの式で作る）または ?d=（InterviewSchedule）、担当者は ?s=（InterviewStaff。無ければ全員）。
 * @example <InterviewGuide kind="second" />
 */
export default function InterviewGuide({ kind }: { kind: InterviewKind }) {
  const { flow, prepare, titles, secondJoinNote, tagline, hero, teamHeading, staffIntro } = INTERVIEW;
  return (
    <div className="bg-surface pb-section-b" data-hide-header data-hide-footer>
      {/* 本文幅（読みやすさのため。中央寄せはしない） */}
      <div className="wrap max-w-[1000px]">
        <header className="flex items-center gap-5 pt-8">
          <a href={prepare.href} className="font-display text-[24px] font-bold tracking-[.08em] text-fg">
            MasKOFF
          </a>
          <span className="whitespace-pre-line font-display text-[9px] leading-[1.5] font-medium tracking-[.16em] text-fg-muted">{tagline}</span>
        </header>

        {/* キャッチ */}
        <div className="pt-14 pb-10 max-sp:pt-10">
          <Script className="ml-1">{hero.script}</Script>
          <p className="mt-4 text-[clamp(32px,5.4vw,48px)] leading-[1.35] font-bold tracking-[.06em] text-fg">
            {hero.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </p>
          <p className="mt-5 text-[15px] tracking-[.08em] text-fg-body">{hero.sub}</p>
        </div>

        <InterviewSchedule title={titles[kind]} joinNote={kind === "second" ? secondJoinNote : undefined} />

        {/* 当日の流れ */}
        <section aria-labelledby="iv-flow" className="mt-20">
          <Script>Flow</Script>
          <h2 id="iv-flow" className={H2}>
            当日の流れ
          </h2>
          <ol className="mt-8 grid grid-cols-4 gap-6 max-pc:grid-cols-2 max-pc:gap-y-8">
            {flow.map((step, i) => (
              <li key={step} className="relative">
                <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-bg font-display text-[16px] font-semibold text-fg shadow-[0_4px_16px_color-mix(in_srgb,var(--color-fg)_7%,transparent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* 次のステップへの矢印（PC の横並びのときだけ） */}
                {i < flow.length - 1 && (
                  <svg aria-hidden viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="absolute top-[19px] right-[-2px] h-3.5 w-2 text-fg-muted max-pc:hidden">
                    <path d="m1 1 6 6-6 6" />
                  </svg>
                )}
                <p className="mt-4 pr-6 text-[15px] leading-[1.75] text-fg">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 面接対応者 */}
        <section aria-labelledby="iv-staff" className="mt-20">
          <Script>Team</Script>
          <h2 id="iv-staff" className="mt-3 text-[13px] font-bold tracking-[.12em] text-fg-muted">
            面接対応者
          </h2>
          <p className="mt-2 whitespace-pre-line text-[clamp(24px,3.4vw,30px)] leading-[1.6] font-bold tracking-[.04em] text-fg">{teamHeading}</p>
          <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.9] text-fg-body">{staffIntro.text}</p>
          <InterviewStaff />
        </section>

        {/* 面接の前に（HP への誘導カード） */}
        <section aria-labelledby="iv-prepare" className="relative mt-20 overflow-hidden rounded-[20px] bg-bg px-10 pt-12 pb-10 shadow-[0_12px_40px_color-mix(in_srgb,var(--color-fg)_6%,transparent)] max-sp:px-6 max-sp:pt-9 max-sp:pb-7">
          {/* 右上の斜めのグレーの面（飾り） */}
          <span aria-hidden className="absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(115deg,transparent_0_28%,color-mix(in_srgb,var(--color-fg)_5%,transparent)_28%_60%,color-mix(in_srgb,var(--color-fg)_11%,transparent)_60%)]" />
          {/* PC: 左に見出し・説明、右にマーク（2 行分の高さで中央）。SP: 見出しの右上にマーク、説明は横幅いっぱい */}
          <div className="relative grid grid-cols-[1fr_auto] gap-x-8 max-sp:gap-x-4">
            <div>
              <span aria-hidden className="block h-[3px] w-12 bg-marker" />
              <h2 id="iv-prepare" className="mt-6 text-[clamp(28px,5vw,46px)] leading-[1.3] font-bold tracking-[.02em] text-fg">
                面接の前に
                <br />
                ご覧ください
              </h2>
            </div>
            <Picture src="/images/logo-mark.png" alt="" sizes="(max-width: 600px) 76px, 150px" className="row-span-2 block size-[150px] self-center overflow-hidden rounded-[22%] shadow-[0_14px_30px_color-mix(in_srgb,var(--color-fg)_28%,transparent)] max-sp:row-span-1 max-sp:size-[76px] max-sp:self-start" imgClassName="size-full object-cover" />
            <p className="mt-5 whitespace-pre-line text-[15px] leading-[1.9] text-fg-body max-sp:col-span-2 max-sp:text-[14px]">{prepare.text}</p>
          </div>
          <a href={prepare.href} target="_blank" rel="noopener" className="group relative mt-8 flex items-center justify-between gap-4 rounded-[14px] bg-fg py-4 pr-4 pl-8 text-[18px] font-bold text-fg-invert transition-opacity hover:opacity-90 max-sp:mt-6 max-sp:gap-2 max-sp:pr-2.5 max-sp:pl-4 max-sp:text-[13.5px]">
            <span className="whitespace-nowrap">
              {prepare.label}
            </span>
            <span aria-hidden className="flex size-12 flex-none items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-marker)_88%,black)] transition-transform group-hover:translate-x-1 max-sp:size-9">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </span>
          </a>
        </section>
      </div>
    </div>
  );
}
