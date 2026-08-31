import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { NewsList } from "@/components/NewsList";
import { cms } from "@/lib/cms";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await cms.newsCategories()).map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = (await cms.newsCategories()).find((x) => x.slug === slug);
  return { title: `ニュース - ${c?.name ?? ""}` };
}

export default async function NewsCategory({ params }: Props) {
  const { slug } = await params;
  const [all, categories] = await Promise.all([cms.news(), cms.newsCategories()]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();
  return (
    <>
      <PageHead en="NEWS" ja={cat.name} crumbs={[{ href: "/news/", label: "NEWS" }, { label: cat.name }]} />
      <section className="section wrap" style={{ borderTop: 0 }}>
        <NewsList items={all.filter((n) => n.category?.slug === slug)} categories={categories} current={slug} />
      </section>
    </>
  );
}
