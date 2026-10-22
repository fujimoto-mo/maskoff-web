import InterviewSchedule from "@/components/sections/InterviewSchedule";
import InterviewStaff from "@/components/sections/InterviewStaff";
import { INTERVIEW, type InterviewKind } from "@/content/interview";

const CARD = "rounded-card border border-border bg-surface px-6 py-6";
const CARD_TITLE = "text-[18px] font-bold leading-[1.5] text-fg";

/**
 * 面接の案内ページの本文（/interview/ と /interview/second/ で共用）。応募者へのメールの「当日の流れや担当者は、こちらのページで」からリンクされる。
 * 固定内容は content/interview.ts。日時は URL の ?k=（スプレッドシートの式で作る）または ?d=（InterviewSchedule）、担当者は ?s=（InterviewStaff。無ければ全員）。
 * @example <InterviewGuide kind="second" />
 */
export default function InterviewGuide({ kind }: { kind: InterviewKind }) {
  const { flow, prepare, titles, secondJoinNote } = INTERVIEW;
  return (
    <section className="wrap pt-8 pb-section-b" data-hide-header data-hide-footer>
      {/* 本文幅（読みやすさのため。中央寄せはしない） */}
      <div className="max-w-[560px]">
        <p className="mb-6 font-display text-caption font-medium tracking-[.2em] text-fg-muted">MASKOFF.CO.JP / INTERVIEW</p>
        <InterviewSchedule title={titles[kind]} joinNote={kind === "second" ? secondJoinNote : undefined} />

        <section aria-labelledby="iv-flow" className={`mt-8 ${CARD}`}>
          <h2 id="iv-flow" className={CARD_TITLE}>
            当日の流れ
          </h2>
          <ol className="mt-4 space-y-3">
            {flow.map((step, i) => (
              <li key={step} className="grid grid-cols-[26px_1fr] items-center gap-4 text-[15px] text-fg-body">
                <span aria-hidden className="flex size-[26px] items-center justify-center rounded-full bg-fg font-display text-[12px] font-bold text-fg-invert">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="iv-staff" className={`mt-5 ${CARD}`}>
          <h2 id="iv-staff" className={CARD_TITLE}>
            面接対応者
          </h2>
          <InterviewStaff />
        </section>

        <section aria-labelledby="iv-prepare" className={`mt-5 ${CARD}`}>
          <h2 id="iv-prepare" className={CARD_TITLE}>
            面接の前にご覧ください
          </h2>
          <p className="mt-3">
            <a href={prepare.href} className="text-[16px] font-bold text-marker underline underline-offset-4">
              {prepare.label}
            </a>
          </p>
        </section>
      </div>
    </section>
  );
}
