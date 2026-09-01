import NoticeBanner from "@/components/layout/NoticeBanner";
import ContactSection from "@/components/sections/ContactSection";
import FaqList from "@/components/sections/FaqList";
import Hero from "@/components/sections/Hero";
import NewsStrip from "@/components/sections/NewsStrip";
import PartnerGrid from "@/components/sections/PartnerGrid";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import WorksList from "@/components/sections/WorksList";
import { getFaq, getNews, getNotice } from "@/lib/microcms";

export default async function HomePage() {
  const [news, notice, faq] = await Promise.all([getNews(), getNotice(), getFaq()]);
  return (
    <>
      <NoticeBanner />
      <Hero />
      <VisionBlock />
      <ServiceGrid />
      <WorksList />
      <PartnerGrid />
      <NewsStrip news={news} notice={notice} />
      <FaqList items={faq} />
      <ContactSection />
    </>
  );
}
