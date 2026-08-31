import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "お問い合わせ", description: "事業のご相談・採用・取材のお問い合わせはこちら。" };

export default function Contact() {
  return (
    <>
      <PageHead en="CONTACT" ja="お問い合わせ" crumbs={[{ label: "CONTACT" }]} lead="2営業日以内に担当よりご連絡します。お急ぎの場合はお電話でも承ります。" />
      <section className="section wrap two-col" style={{ borderTop: 0 }}>
        <div className="side">
          <h2>FORM</h2><p className="ja">フォーム</p>
          <p className="muted" style={{ fontSize: 13, marginTop: 24 }}>TEL {SITE.tel}<br />平日 10:00–18:00</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
