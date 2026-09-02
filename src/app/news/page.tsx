import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "ニュース",
  description: "株式会社MasKOFFのニュース・お知らせ。",
  robots: { index: false, follow: true }, // 準備中のため noindex（microCMS 連携の本実装で解除する）
  alternates: { canonical: "/news/" },
};

/** NEWS（準備中）。フェーズ②で microCMS 連携の一覧に差し替える */
export default function NewsPage() {
  return (
    <section className="wrap section-pad">
      <SectionHeading en="NEWS" ja="ニュース" />
      <p data-reveal="up" className="text-body leading-[2] text-fg-body">
        このページは現在準備中です。最新のトピックは HOME をご覧ください。
      </p>
      <div data-reveal="up" className="mt-8">
        <Button href="/" dot>
          HOME へ戻る
        </Button>
      </div>
    </section>
  );
}
