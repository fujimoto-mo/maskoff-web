import type { CSSProperties } from "react";
import ContactForm from "@/components/sections/ContactForm";
import StepFlow from "@/components/sections/StepFlow";
import SectionHeading from "@/components/ui/SectionHeading";

// SAMPLE
const STEPS = [
  { title: "フォームの送信", text: "1 分ほどで完了します。" },
  { title: "担当より返信", text: "3 営業日以内にメールでご連絡します。" },
  { title: "オンライン面談", text: "1時間程度でご希望内容の面談を致します。" },
  { title: "ご提案・お見積", text: "内容に合わせて最適な進め方をご提案します。" },
] as const;

/** dipsy OPEN CALL 相当。左に流れ、右にフォームカード。id="contact" は StickyCta が参照する。 */
export default function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad">
      <div className="wrap grid grid-cols-2 items-stretch gap-gap-cols max-form:grid-cols-1 max-form:gap-12">
        <div>
          <SectionHeading en="CONTACT" ja="お問い合わせ・ご相談" id="contact-title" className="mb-[34px]" />
          <p data-reveal="up" style={{ "--rd": "0ms" } as CSSProperties} className="mb-10 text-body leading-[1.9] text-fg-body max-sp:text-body-sp">
            まず、話すことから。
            <br />
            事業のご相談、採用、取材のご依頼はこちらから。
          </p>
          <div data-reveal="up" style={{ "--rd": "80ms" } as CSSProperties}>
            <StepFlow heading="求職希望の方のご面談希望の流れ" steps={STEPS} />
          </div>
        </div>
        <div data-reveal="up" style={{ "--rd": "160ms" } as CSSProperties} className="rounded-form bg-bg px-[34px] py-12 shadow-[0_0_120px_currentColor] shadow-fg/4 max-sp:px-5 max-sp:py-[38px] max-sp:shadow-[0_0_96px_currentColor] max-sp:shadow-fg/7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
