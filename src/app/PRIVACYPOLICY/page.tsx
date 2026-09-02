import type { Metadata } from "next";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "株式会社MasKOFFのプライバシーポリシー。個人情報の第三者提供・取扱いの委託・Cookie の使用について。",
  alternates: { canonical: "/PRIVACYPOLICY/" },
};

// 現行サイト https://maskoff.co.jp/PRIVACYPOLICY の内容を移植（2026-09-02 取得）
const SECTIONS: { h: string; ps: string[] }[] = [
  {
    h: "個人情報の第三者提供について",
    ps: ["本人の同意がある場合又は法令に基づく場合を除き、取得した個人情報を第三者に提供することはありません。"],
  },
  {
    h: "個人情報の取扱いの委託について",
    ps: [
      "取得した個人情報の全部又は一部を委託する場合があります。その際は、当社の個人情報保護基準を満たす業務委託先を選定して委託を行い、委託後も委託先に対して定期的な調査等の確認を行います。",
    ],
  },
  {
    h: "個人情報を入力するにあたっての注意事項",
    ps: [
      "個人情報の入力は任意ですが、必須事項を正確にご入力いただけない場合には、お問合せへの対応又はお客様へのご連絡、お客様へのサービス提供ができませんのでご注意ください。",
    ],
  },
  {
    h: "本人が容易に認識できない方法による個人情報の取得",
    ps: [
      "当社ウェブサイトでは、クッキー(Cookie)と呼ばれる技術を使用しております。",
      "Cookieとは、お客様がウェブサイトにアクセスされた際、ウェブサーバー側でお客様のコンピュータ内に一定ファイルを格納することにより、ウェブサーバー側でお客様のコンピュータを識別できるようにする技術です。",
      "当社では、ウェブサイトでのサービスの提供、利便性の向上、インターネット上の各種サイトでの当社の広告配信、統計データの取得のためにのみCookieを使用しており、この中に、お客様のお名前や連絡先などの個人を特定するような情報は一切含まれておりません。",
      "当社の広告配信を委託する第三者配信事業者(Yahoo! Japan、Google等)は、各社のプライバシーポリシーに従い、Cookieを使用して、当社ウェブサイトへの過去のアクセス情報に基づいて広告を配信します。お客様は、第三者配信事業者のオプトアウトページにアクセスして、Cookieの広告配信への利用を無効にすることができます。",
      "お使いのブラウザの設定を変更して、Cookieの機能を無効にすることはできますが、その結果、ウェブサイト上のサービスの全部又は一部がご利用いただけないことがあります。",
    ],
  },
];

/** プライバシーポリシー。現行サイトの同 URL・同内容を踏襲 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "プライバシーポリシー", path: "/PRIVACYPOLICY/" }], SITE.url)} />
      <section className="wrap section-pad">
        <SectionHeading en="PRIVACY POLICY" ja="プライバシーポリシー" />
        <div className="max-w-[720px]">
          <p className="text-body leading-[2.1] text-fg-body">株式会社MasKOFF（以下「当社」といいます。）は、利用者に関する情報を以下のとおり取り扱います。</p>
          {SECTIONS.map((sec) => (
            <div key={sec.h} className="mt-10">
              <h3 className="text-[16px] font-bold text-fg">{sec.h}</h3>
              {sec.ps.map((p) => (
                <p key={p.slice(0, 20)} className="mt-3 text-body leading-[2.1] text-fg-body">
                  {p}
                </p>
              ))}
            </div>
          ))}
          <p className="mt-12 text-caption text-fg-muted">第１版 ２０２５年６月１日　制定</p>
        </div>
      </section>
    </>
  );
}
