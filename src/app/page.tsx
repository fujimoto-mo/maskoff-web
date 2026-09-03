import type { Metadata } from "next";
import ContactCta from "@/components/sections/ContactCta";
import Hero from "@/components/sections/Hero";
import NewsStrip from "@/components/sections/NewsStrip";
import PartnerGrid from "@/components/sections/PartnerGrid";
import ProductBlock from "@/components/sections/ProductBlock";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import IntroVeil from "@/components/motion/IntroVeil";
import { getNews, getNotice } from "@/lib/microcms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}｜${SITE.tagline} — アパレル・アーティスト支援・Web制作` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [news, notice] = await Promise.all([getNews(), getNotice()]);
  return (
    <>
      <IntroVeil />
      <Hero />
      <VisionBlock />
      <ProductBlock />
      <ServiceGrid />
      {/* WORKS はクライアント指示で非表示（2026-09-02）。復活時は WorksList を import して <WorksList /> を戻す */}
      <PartnerGrid />
      <NewsStrip news={news} notice={notice} />
      {/* FAQ はクライアント指示で非表示（2026-09-03）。復活時は FaqList と getFaq を import して <FaqList items={faq} /> を戻す */}
      <ContactCta />
    </>
  );
}
