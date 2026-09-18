import ServiceCards from "@/components/sections/ServiceCards";
import ServiceChips from "@/components/sections/ServiceChips";
import ServiceCycle from "@/components/sections/ServiceCycle";
import ServiceFaq from "@/components/sections/ServiceFaq";
import ServiceFlow from "@/components/sections/ServiceFlow";
import ServiceIssues from "@/components/sections/ServiceIssues";
import ServiceMedia from "@/components/sections/ServiceMedia";
import ServiceNotice from "@/components/sections/ServiceNotice";
import ServiceProduct from "@/components/sections/ServiceProduct";
import ServiceTiles from "@/components/sections/ServiceTiles";
import type { Section } from "@/content/service-details";

/**
 * SERVICE 詳細の事業別セクションを type で振り分けて順に描画する（構成は service-details.ts の sections）。
 * @example <ServiceSections sections={getServiceDetail("sns").sections} />
 */
export default function ServiceSections({ sections }: { sections: readonly Section[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const key = `${s.type}-${i}`;
        switch (s.type) {
          case "cards":
            return <ServiceCards key={key} en={s.en} ja={s.ja} items={s.items} cols={s.cols} numeral={s.numeral} image={s.image} />;
          case "issues":
            return <ServiceIssues key={key} items={s.items} />;
          case "flow":
            return <ServiceFlow key={key} en={s.en} ja={s.ja} steps={s.steps} variant={s.variant} />;
          case "tiles":
            return <ServiceTiles key={key} en={s.en} ja={s.ja} items={s.items} />;
          case "chips":
            return <ServiceChips key={key} en={s.en} ja={s.ja} items={s.items} />;
          case "media":
            return <ServiceMedia key={key} en={s.en} ja={s.ja} image={s.image} note={s.note} />;
          case "product":
            return <ServiceProduct key={key} en={s.en} ja={s.ja} image={s.image} points={s.points} links={s.links} video={s.video} story={s.story} />;
          case "cycle":
            return <ServiceCycle key={key} en={s.en} ja={s.ja} items={s.items} />;
          case "notice":
            return <ServiceNotice key={key} en={s.en} ja={s.ja} title={s.title} text={s.text} note={s.note} />;
          case "faq":
            return <ServiceFaq key={key} items={s.items} />;
        }
      })}
    </>
  );
}
