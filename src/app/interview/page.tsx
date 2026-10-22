import type { Metadata } from "next";
import InterviewSchedule from "@/components/sections/InterviewSchedule";
import InterviewStaff from "@/components/sections/InterviewStaff";
import { INTERVIEW } from "@/content/interview";

/** 求職者向けのため検索には載せない（sitemap にも入れない）。JICOO のメールからだけ辿る */
export const metadata: Metadata = {
  title: `${INTERVIEW.title}のご案内`,
  description: `株式会社MasKOFF ${INTERVIEW.title}の当日のご案内。Zoom の参加方法、当日の流れ、担当者。`,
  robots: { index: false, follow: false },
  // URL に氏名が入るので、遷移先（HP・Zoom）に Referer で渡さない（HP 側の GA4 の page_referrer にも載らない）
  referrer: "no-referrer",
};

const CARD = "rounded-card border border-border bg-surface px-6 py-6";
const CARD_TITLE = "text-[18px] font-bold leading-[1.5] text-fg";

/**
 * 一次面接の案内ページ。JICOO の予約完了メール・リマインドメールの「当日の流れや担当者は、こちらのページで」からリンクされる。
 * 固定内容は content/interview.ts。日時は URL の ?k=（スプレッドシートの AL 列の式で作る）または ?d=（InterviewSchedule）、担当者は ?s=（InterviewStaff。無ければ全員）。
 */
export default function InterviewPage() {
  const { flow, prepare } = INTERVIEW;
  return (
    <section className="wrap pt-8 pb-section-b" data-hide-header data-hide-footer>
      {/* 本文幅（読みやすさのため。中央寄せはしない） */}
      <div className="max-w-[560px]">
        <p className="mb-6 font-display text-caption font-medium tracking-[.2em] text-fg-muted">MASKOFF.CO.JP / INTERVIEW</p>
        <InterviewSchedule />

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
            当日の担当
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
