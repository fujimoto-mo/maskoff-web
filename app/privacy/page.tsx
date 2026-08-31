import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function Privacy() {
  return (
    <>
      <PageHead en="PRIVACY POLICY" ja="プライバシーポリシー" crumbs={[{ label: "PRIVACY POLICY" }]} />
      <section className="section wrap article prose" style={{ borderTop: 0 }}>
        <p>{SITE.name}（以下「当社」）は、当社が取得する個人情報について、以下のとおりプライバシーポリシーを定めます。（※以下はサンプル文言です。公開前に法務確認のうえ差し替えてください。）</p>
        <h2>1. 取得する情報</h2>
        <p>お問い合わせフォームから送信されたお名前、会社名、メールアドレス、電話番号、お問い合わせ内容。ならびに、アクセス解析のために取得するCookie等の情報。</p>
        <h2>2. 利用目的</h2>
        <ul><li>お問い合わせへの回答、サービスのご案内</li><li>採用選考に関する連絡</li><li>当社サイトの改善・分析</li></ul>
        <h2>3. 第三者提供</h2>
        <p>法令に基づく場合を除き、本人の同意なく第三者に提供しません。フォーム送信のメール配信には外部サービス（Resend）を利用し、スパム対策にCloudflare Turnstileを利用します。</p>
        <h2>4. 安全管理</h2>
        <p>個人情報の漏えい・滅失・毀損を防止するため、適切な安全管理措置を講じます。</p>
        <h2>5. 開示・訂正・削除</h2>
        <p>ご本人からの開示・訂正・削除のご請求には、本人確認のうえ速やかに対応します。</p>
        <h2>6. お問い合わせ窓口</h2>
        <p>{SITE.name} 個人情報担当<br />{SITE.email}</p>
        <p className="muted" style={{ fontSize: 12 }}>制定日：20XX年X月X日</p>
      </section>
    </>
  );
}
