import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { SERVICES, getService } from "@/lib/services";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return SERVICES.map((s) => ({ slug: s.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  return { title: s?.title, description: s?.lead };
}

export default async function ServiceDetail({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const others = SERVICES.filter((x) => x.slug !== slug);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.lead, provider: { "@type": "Organization", name: SITE.name, url: SITE.url }, areaServed: "JP" }} />
      <PageHead en={s.verb.toUpperCase()} ja={s.title} crumbs={[{ href: "/service/", label: "SERVICE" }, { label: s.title }]} lead={s.lead} />

      <section className="section wrap two-col">
        <div className="side"><h2>ABOUT</h2><p className="ja">サービス概要</p></div>
        <div className="prose">{s.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>POINTS</h2><p className="ja">特長</p></div>
        <ul className="points">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      <section className="section wrap two-col">
        <div className="side"><h2>FLOW</h2><p className="ja">進め方</p></div>
        <ol className="steps" style={{ margin: 0, gridTemplateColumns: "repeat(2,1fr)" }}>
          {s.flow.map((f) => <li key={f.title}><strong>{f.title}</strong><span>{f.text}</span></li>)}
        </ol>
      </section>

      <section className="section wrap">
        <p className="muted" style={{ fontSize: 12, letterSpacing: ".08em", marginBottom: 16 }}>その他の事業</p>
        <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {others.map((o) => <li key={o.slug}><Link href={`/service/${o.slug}/`} className="btn btn-line btn-sm">{o.title}</Link></li>)}
        </ul>
      </section>

      <CtaBand text={`${s.title}についてのご相談・お見積りはこちらから。初回ヒアリングは無料です。`} />
    </>
  );
}
