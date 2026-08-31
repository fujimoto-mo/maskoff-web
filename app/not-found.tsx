import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap" style={{ padding: "120px 0" }}>
      <h1 className="display" style={{ fontSize: "var(--fs-hero)" }}>404</h1>
      <p style={{ margin: "24px 0 32px" }}>お探しのページは見つかりませんでした。</p>
      <Link href="/" className="btn btn-line">ホームへ戻る</Link>
    </section>
  );
}
