import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * HOME 末尾の CONTACT 誘導帯。フォーム本体は /contact/（ContactSection）へ移した。
 * id="contact" は SP の追従バッジ（#contact が見えたら消える・タップで移動）が参照する。
 * @example <ContactCta />
 */
export default function ContactCta() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad border-t border-border">
      <div className="wrap">
        <SectionHeading en="CONTACT" ja="お問い合わせ・ご相談" id="contact-title" className="mb-[34px]" />
        <p data-reveal="up" className="text-body leading-[2] text-fg-body">
          アパレル企画、ホームページ制作、アーティスト支援など、お気軽にご相談ください。
        </p>
        <div data-reveal="up" style={{ "--rd": "80ms" } as React.CSSProperties} className="mt-8">
          <Button href="/contact/" dot className="px-10 py-3.5 text-[14px]">
            お問い合わせフォームへ
          </Button>
        </div>
      </div>
    </section>
  );
}
