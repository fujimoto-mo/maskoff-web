import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "送信完了", robots: { index: false } };

export default function Thanks() {
  return (
    <>
      <PageHead en="THANK YOU" ja="送信が完了しました" crumbs={[{ href: "/contact/", label: "CONTACT" }, { label: "送信完了" }]} />
      <section className="section wrap" style={{ borderTop: 0 }}>
        <div className="prose" style={{ maxWidth: "40em" }}>
          <p>お問い合わせありがとうございます。ご入力いただいたメールアドレスに自動返信メールをお送りしました。</p>
          <p>担当より2営業日以内にご連絡いたします。数日経っても返信がない場合は、迷惑メールフォルダをご確認のうえ、お電話でお問い合わせください。</p>
        </div>
        <p style={{ marginTop: 40 }}><Link href="/" className="btn btn-line">ホームへ戻る</Link></p>
      </section>
    </>
  );
}
