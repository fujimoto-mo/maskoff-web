import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "事業内容",
  description: "株式会社MasKOFFの事業内容。ホームページ制作・デザイン、キャリア支援、アパレル企画。",
  robots: { index: false, follow: true }, // 準備中のため noindex（本実装で解除する）
  alternates: { canonical: "/service/" },
};

/** SERVICE（準備中）。フェーズ②で本実装に差し替える */
export default function ServicePage() {
  return (
    <section className="wrap section-pad">
      <SectionHeading en="SERVICE" ja="事業内容" />
      <p data-reveal="up" className="text-body leading-[2] text-fg-body">
        このページは現在準備中です。事業内容の概要は HOME のサービス紹介をご覧ください。
      </p>
      <div data-reveal="up" className="mt-8">
        <Button href="/#service" dot>
          サービス紹介を見る
        </Button>
      </div>
    </section>
  );
}
