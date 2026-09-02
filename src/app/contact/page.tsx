import type { Metadata } from "next";
import ContactSection from "@/components/sections/ContactSection";
import JsonLd from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "株式会社MasKOFFへのお問い合わせ・ご相談はこちらから。アパレル企画、ホームページ制作、アーティスト支援など、お気軽にご連絡ください。",
  alternates: { canonical: "/contact/" },
};

/** CONTACT。design_handoff_contact_page のタイトル部（COMPANY と同型）+ 既存のフォームセクション */
export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "お問い合わせ", path: "/contact/" }], SITE.url)} />
      {/* ヒーロー: CONTACT の 3 行スタック（ロゴの重ね文字モチーフ） */}
      <section className="wrap overflow-hidden pt-[clamp(48px,7vw,96px)] pb-12">
        <p className="font-display text-caption font-medium tracking-[.2em] text-fg-muted">MASKOFF.CO.JP / CONTACT</p>
        <h1 aria-label="CONTACT" className="mt-4 font-display text-[clamp(60px,10vw,140px)] font-extrabold leading-[.9] tracking-[-.04em] text-fg">
          <span aria-hidden className="block">CONTACT</span>
          <span aria-hidden className="block opacity-40">CONTACT</span>
          <span aria-hidden className="-mb-[.35em] block opacity-[.18]">CONTACT</span>
        </h1>
        <p className="mt-10 text-[16px] font-medium text-fg-body max-sp:text-[14px]">お問い合わせ — ご相談・ご依頼・エントリーはこちらから。3営業日以内にご返信します。</p>
      </section>
      <div className="border-t border-border">
        <ContactSection />
      </div>
    </>
  );
}
