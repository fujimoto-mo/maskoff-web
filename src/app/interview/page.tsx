import type { Metadata } from "next";
import InterviewGuide from "@/components/sections/InterviewGuide";
import { INTERVIEW } from "@/content/interview";

const TITLE = INTERVIEW.titles.first;

/** 求職者向けのため検索には載せない（sitemap にも入れない）。応募者へのメールからだけ辿る */
export const metadata: Metadata = {
  title: `${TITLE}のご案内`,
  description: `株式会社MasKOFF ${TITLE}の当日のご案内。Zoom の参加方法、当日の流れ、担当者。`,
  robots: { index: false, follow: false },
  // URL に氏名が入るので、遷移先（HP・Zoom）に Referer で渡さない（HP 側の GA4 の page_referrer にも載らない）
  referrer: "no-referrer",
};

/** 一次面接の案内。URL はスプレッドシートの式（W 列の一次面接日程・G 列の姓名）で作る。式は lib/interview-schedule.ts */
export default function Page() {
  return <InterviewGuide kind="first" />;
}
