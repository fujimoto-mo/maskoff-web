import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { CtaBand } from "@/components/CtaBand";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "採用情報", description: "MasKOFFの募集職種。未経験からIT人材を育成する techMasKOFF LAB. で基礎から学べます。" };

export default async function RecruitIndex() {
  const jobs = await cms.jobs();
  return (
    <>
      <PageHead en="RECRUIT" ja="採用情報" crumbs={[{ label: "RECRUIT" }]} lead="肩書きや経歴より、あなたの「素」を見たい。未経験の方も、自社カリキュラム techMasKOFF LAB. で基礎から学べます。" />

      <section className="section wrap two-col" style={{ borderTop: 0 }}>
        <div className="side"><h2>CULTURE</h2><p className="ja">働く環境</p></div>
        <ul className="points">
          <li>フルリモート可・転勤なし</li>
          <li>完全週休2日・残業月20h以内</li>
          <li>実践前提の育成カリキュラム</li>
          <li>部署をまたぐ協業が日常</li>
        </ul>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>JOBS</h2><p className="ja">募集職種</p></div>
        <ul className="jobs">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link href={`/recruit/${j.id}/`} className="job-card">
                <h3>{j.title}</h3>
                <dl>
                  <dt>雇用形態</dt><dd>{j.employmentType}</dd>
                  <dt>勤務地</dt><dd>{j.location}</dd>
                  <dt>給与</dt><dd>{j.salary}</dd>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand title="ENTRY" text="カジュアル面談からでも歓迎です。お問い合わせフォームの「ご興味のある事業」で「採用について」を選んでご連絡ください。" />
    </>
  );
}
