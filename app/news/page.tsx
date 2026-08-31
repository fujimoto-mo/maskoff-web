import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { NewsList } from "@/components/NewsList";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "ニュース", description: "MasKOFFのプレスリリース・イベント・メディア掲載情報。" };

export default async function NewsIndex() {
  const [items, categories] = await Promise.all([cms.news(), cms.newsCategories()]);
  return (
    <>
      <PageHead en="NEWS" ja="ニュース" crumbs={[{ label: "NEWS" }]} />
      <section className="section wrap" style={{ borderTop: 0 }}>
        <NewsList items={items} categories={categories} />
      </section>
    </>
  );
}
