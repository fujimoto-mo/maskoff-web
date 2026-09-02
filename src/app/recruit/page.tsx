import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "採用情報",
  description: "株式会社MasKOFFの採用情報。仮面を外して、素の自分で働く仲間を募集しています。",
  robots: { index: false, follow: true }, // 準備中のため noindex（求人一覧の本実装で解除する）
  alternates: { canonical: "/recruit/" },
};

/** RECRUIT（準備中）。フェーズ②で microCMS（jobs）連携に差し替える */
export default function RecruitPage() {
  return (
    <section className="wrap section-pad">
      <SectionHeading en="RECRUIT" ja="採用情報" />
      <p data-reveal="up" className="text-body leading-[2] text-fg-body">
        採用ページは現在準備中です。応募・ご相談はお問い合わせフォームからお気軽にご連絡ください。
      </p>
      <div data-reveal="up" className="mt-8">
        <Button href="/contact/" dot>
          お問い合わせへ
        </Button>
      </div>
    </section>
  );
}
