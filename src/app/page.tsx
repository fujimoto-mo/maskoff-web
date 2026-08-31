import NoticeBanner from "@/components/layout/NoticeBanner";
import Hero from "@/components/sections/Hero";
import ServiceGrid from "@/components/sections/ServiceGrid";
import VisionBlock from "@/components/sections/VisionBlock";
import WorksList from "@/components/sections/WorksList";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      <NoticeBanner />
      <Hero />
      <VisionBlock />
      <ServiceGrid />
      <WorksList />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
