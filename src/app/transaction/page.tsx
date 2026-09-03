import type { Metadata } from "next";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeading from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "株式会社MasKOFFの特定商取引法に基づく表記。販売業者・所在地・支払方法・返品に関する特約など。",
  alternates: { canonical: "/transaction/" },
};

// 現行サイト https://maskoff.co.jp/TRANSACTIONACT の内容を移植（URL は /transaction/ に変更、旧 URL は _redirects で 301）（2026-09-02 取得）
const ROWS: { dt: string; dd: string[] }[] = [
  { dt: "販売業者", dd: ["株式会社MasKOFF"] },
  { dt: "代表責任者", dd: ["代表取締役　藤本剛"] },
  { dt: "所在地", dd: ["〒150-0021 東京都渋谷区恵比寿西１丁目３３番６－２１６号ＪＰｎｏｉｅ恵比寿西"] },
  { dt: "電話番号", dd: ["080-7244-0077"] },
  { dt: "電話受付時間", dd: ["10:00〜18:00（土日祝除く）", "※受付時間外の場合は、メールにてお問い合わせください。"] },
  { dt: "メールアドレス", dd: ["dot.hyphen.info@gmail.com"] },
  { dt: "サイトURL", dd: ["https://maskoff.co.jp/"] },
  { dt: "商品の販売価格・サービスの対価", dd: ["各商品・サービスのご購入ページにて表示する価格"] },
  { dt: "対価以外に必要となる費用", dd: ["商品ページに記載（配送会社の規定に基づき、実費をご負担いただきます）"] },
  { dt: "支払方法と支払時期", dd: ["商品購入時に各種決済方法から選択し決済"] },
  { dt: "商品の引渡しまたはサービス提供の時期", dd: ["お支払い確認から1〜3営業日以内に発送いたします"] },
  { dt: "返品・キャンセルに関する特約", dd: ["各サイトの返金ポリシーに記載"] },
  { dt: "返金送料", dd: ["商品の不備がある場合には、当社負担、お客様都合の返品・交換の場合には、お客様負担となります。"] },
];

/** 特定商取引法に基づく表記。現行サイトの同 URL・同内容を踏襲 */
export default function TransactionActPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "HOME", path: "/" }, { name: "特定商取引法に基づく表記", path: "/transaction/" }], SITE.url)} />
      <section className="wrap section-pad">
        <SectionHeading en="TRANSACTION ACT" ja="特定商取引法に基づく表記" />
        <dl className="border-t border-border">
          {ROWS.map((row) => (
            <div key={row.dt} className="grid grid-cols-[240px_1fr] border-b border-border px-2 py-[22px] text-body max-tab:grid-cols-1 max-tab:gap-1.5">
              <dt className="text-fg-muted">{row.dt}</dt>
              <dd className="m-0 leading-[2] text-fg-body">
                {row.dd.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
