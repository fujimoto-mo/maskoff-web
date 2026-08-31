import NoticeBanner from "@/components/layout/NoticeBanner";
import Hero from "@/components/sections/Hero";
import NewsStrip from "@/components/sections/NewsStrip";
import PartnerGrid from "@/components/sections/PartnerGrid";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import WorksList from "@/components/sections/WorksList";
import SectionHeading from "@/components/ui/SectionHeading";
import { getNews, getNotice } from "@/lib/microcms";

export default async function HomePage() {
  const [news, notice] = await Promise.all([getNews(), getNotice()]);
  return (
    <>
      <NoticeBanner />
      <Hero />
      <VisionBlock />
      <ServiceGrid />
      <WorksList />
      <PartnerGrid />
      <NewsStrip news={news} notice={notice} />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
