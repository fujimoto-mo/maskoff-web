import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "送信完了", robots: { index: false, follow: false } };

export default function ThanksPage() {
  return (
    <section aria-labelledby="thanks-title" className="wrap section-pad">
      <SectionHeading as="h1" en="THANK YOU" ja="お問い合わせを受け付けました" id="thanks-title" />
      <p className="max-w-[40em] text-body text-fg-body">確認メールをお送りしました。担当より 2 営業日以内にご連絡いたします。届かない場合は迷惑メールフォルダをご確認ください。</p>
      <p className="mt-10">
        <Button href="/" variant="line">
          HOME へ戻る
        </Button>
      </p>
    </section>
  );
}
