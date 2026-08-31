import Link from "next/link";
export function CtaBand({ title = "CONTACT", text = "事業のご相談、採用、取材のご依頼はこちらから。初回のヒアリングとお見積りは無料です。" }: { title?: string; text?: string }) {
  return (
    <section className="cta-band wrap">
      <h2>{title}</h2>
      <p>{text}</p>
      <Link href="/contact/" className="btn btn-accent">お問い合わせフォームへ</Link>
    </section>
  );
}
