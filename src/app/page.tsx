import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Marker from "@/components/ui/Marker";

export default function HomePage() {
  return (
    <main id="main" className="wrap section-pad">
      <SectionHeading as="h1" en={"OFFICIAL\nCREATORS"} ja="見出しの確認" id="home-title" />
      <p>
        本文の<Marker>マーカー</Marker>確認。
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/contact/" dot>お問い合わせ</Button>
        <Button variant="line" href="/news/">すべて見る</Button>
      </div>
    </main>
  );
}
