import NoticeBanner from "@/components/layout/NoticeBanner";
import Hero from "@/components/sections/Hero";
import VisionBlock from "@/components/sections/VisionBlock";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      <NoticeBanner />
      <Hero />
      <VisionBlock />
      <section id="contact" aria-labelledby="contact-title" className="wrap section-pad">
        <SectionHeading en="CONTACT" ja="お問い合わせ（Task 14 で実装）" id="contact-title" />
      </section>
    </>
  );
}
