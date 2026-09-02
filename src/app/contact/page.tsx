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

/** CONTACT。HOME と同じフォームセクションを単独ページとしても提供する */
export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "お問い合わせ", path: "/contact/" }], SITE.url)} />
      <ContactSection />
    </>
  );
}
