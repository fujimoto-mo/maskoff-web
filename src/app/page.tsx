import type { Metadata } from "next";
import ContactCta from "@/components/sections/ContactCta";
import FaqList from "@/components/sections/FaqList";
import Hero from "@/components/sections/Hero";
import NewsStrip from "@/components/sections/NewsStrip";
import PartnerGrid from "@/components/sections/PartnerGrid";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import IntroVeil from "@/components/motion/IntroVeil";
import { getFaq, getNews, getNotice } from "@/lib/microcms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}｜${SITE.tagline} — アパレル・アーティスト支援・Web制作` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [news, notice, faq] = await Promise.all([getNews(), getNotice(), getFaq()]);
  return (
    <>
      <IntroVeil />
      <Hero />
      <VisionBlock />
      <ServiceGrid />
      {/* WORKS はクライアント指示で非表示（2026-09-02）。復活時は WorksList を import して <WorksList /> を戻す */}
      <PartnerGrid />
      <NewsStrip news={news} notice={notice} />
      <FaqList items={faq} />
      <ContactCta />
    </>
  );
}
