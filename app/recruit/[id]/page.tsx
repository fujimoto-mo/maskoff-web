import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { cms, fmtDate } from "@/lib/cms";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await cms.jobs()).map((j) => ({ id: j.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${(await cms.jobById((await params).id))?.title} | 採用情報` };
}

const TYPE: Record<string, string> = { 正社員: "FULL_TIME", 契約社員: "CONTRACTOR", アルバイト: "PART_TIME" };

export default async function JobDetail({ params }: Props) {
  const j = await cms.jobById((await params).id);
  if (!j) notFound();
  return (
    <>
      {/* JobPosting 構造化データ — 参照サイトに無い差別化ポイント */}
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "JobPosting",
        title: j.title, datePosted: j.publishedAt, employmentType: TYPE[j.employmentType] ?? "FULL_TIME",
        description: j.description, qualifications: j.requirements,
        hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url },
        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "JP", addressRegion: "東京都" } },
        jobLocationType: j.location.includes("リモート") ? "TELECOMMUTE" : undefined,
        baseSalary: { "@type": "MonetaryAmount", currency: "JPY", value: { "@type": "QuantitativeValue", unitText: "MONTH" } },
      }} />
      <PageHead en="RECRUIT" ja={j.title} crumbs={[{ href: "/recruit/", label: "RECRUIT" }, { label: j.title }]} />
      <section className="section wrap two-col" style={{ borderTop: 0 }}>
        <div className="side"><h2>OUTLINE</h2><p className="ja">募集要項</p></div>
        <div>
          <dl className="dl">
            <dt>職種</dt><dd>{j.title}</dd>
            <dt>雇用形態</dt><dd>{j.employmentType}</dd>
            <dt>勤務地</dt><dd>{j.location}</dd>
            <dt>給与</dt><dd>{j.salary}</dd>
            <dt>掲載日</dt><dd>{fmtDate(j.publishedAt)}</dd>
          </dl>
          <h3 style={{ marginTop: 48, fontSize: 17 }}>仕事内容</h3>
          <div className="prose" dangerouslySetInnerHTML={{ __html: j.description }} />
          <h3 style={{ marginTop: 40, fontSize: 17 }}>応募資格</h3>
          <div className="prose" dangerouslySetInnerHTML={{ __html: j.requirements }} />
          <p style={{ marginTop: 40 }}><Link href="/recruit/" className="link-more">募集職種一覧へ</Link></p>
        </div>
      </section>
      <CtaBand title="ENTRY" text={`「${j.title}」への応募・カジュアル面談のご希望は、お問い合わせフォームからご連絡ください。`} />
    </>
  );
}
