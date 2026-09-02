import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="wrap section-pad">
      <SectionHeading as="h1" en="404" ja="ページが見つかりません" id="nf-title" />
      <p className="text-body text-fg-body">URL が変更されたか、ページが削除された可能性があります。</p>
      <p className="mt-10">
        <Button href="/" variant="line">
          HOME へ戻る
        </Button>
      </p>
    </section>
  );
}
