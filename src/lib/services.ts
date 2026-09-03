import { SITE } from "./site.ts"; // node:test でも解決できるよう相対 + 拡張子付き

// 8 事業（docs/design_handoff_service_page 由来）。HOME の SERVICE グリッド、/service/、/service/[slug]/ が共有する単一のデータ。
// SAMPLE: 本文（description）は仮文言、画像は仮画像。実データ確定時に差し替える。
export type Service = {
  slug: string;
  /** "01"〜"08"。SERVICE ページの番号 */
  num: string;
  /** 英字ラベル（番号の横・マーキー・パンくず） */
  en: string;
  title: string;
  /** HOME のバッジに入る動詞。4 文字以内（86px の丸に収める） */
  verb: string;
  /** HOME カード・詳細ページのリード用 1〜2 行 */
  lead: string;
  /** /service/ の各行と詳細ページの本文 */
  description: string;
  /** タグチップ（3 つ） */
  tags: readonly string[];
  /** 正方形。public/images/service/ */
  image: string;
};

export const SERVICES: readonly Service[] = [
  {
    slug: "tech-education",
    num: "01",
    en: "TECH EDUCATION",
    title: `${SITE.product} エンジニアカリキュラム`,
    verb: "そだてる",
    lead: "未経験から現場で通用するエンジニアへ。実案件ベースの実践型カリキュラムです。",
    description:
      `未経験からエンジニアを目指す実践型カリキュラム「${SITE.product}」を運営。実案件ベースの課題と現役エンジニアのメンタリングで、現場で通用するスキルを育てます。`,
    tags: ["プログラミング教育", "実案件ベース", "メンタリング"],
    image: "/images/service/svc-01.png",
  },
  {
    slug: "recruitment-ads",
    num: "02",
    en: "RECRUITMENT ADS",
    title: "求人広告代理店事業",
    verb: "つのる",
    lead: "媒体選定から原稿制作、掲載後の運用改善まで、採用広告をワンストップで支援します。",
    description:
      "各種求人媒体の正規代理店として、媒体選定から原稿制作、掲載後の運用改善までをワンストップで支援。採用ターゲットに届く広告設計で、企業の採用力を高めます。",
    tags: ["媒体選定", "原稿制作", "運用改善"],
    image: "/images/service/svc-02.png",
  },
  {
    slug: "web-development",
    num: "03",
    en: "WEB DEVELOPMENT",
    title: "WEBアプリ開発事業",
    verb: "つくる",
    lead: "企画・UI/UX設計・開発・運用を一貫して。小さく速く出して、改善を重ねます。",
    description:
      "業務システムからサービス立ち上げまで、企画・UI/UX設計・開発・運用を一貫して提供。小さく速くリリースし、改善を重ねる開発スタイルで事業の成長に伴走します。",
    tags: ["受託開発", "UI/UX設計", "保守運用"],
    image: "/images/service/svc-03.png",
  },
  {
    slug: "career-support",
    num: "04",
    en: "CAREER SUPPORT",
    title: "キャリア支援事業",
    verb: "ささえる",
    lead: "キャリア面談・人材紹介・研修で、一人ひとりの「らしさ」を活かした働き方へ。",
    description:
      `キャリア面談・人材紹介・研修を通じて、一人ひとりの「らしさ」を活かした働き方を支援。${SITE.product}修了生のキャリアサポートとも連動しています。`,
    tags: ["キャリア面談", "人材紹介", "研修"],
    image: "/images/service/svc-04.png",
  },
  {
    slug: "bpo",
    num: "05",
    en: "BPO",
    title: "BPO事業",
    verb: "まかせる",
    lead: "事務・カスタマーサポートなどのバックオフィス業務を、設計から運用まで受託します。",
    description:
      "事務・カスタマーサポートなどのバックオフィス業務を受託。業務フローの設計から運用まで担い、お客様がコア業務に集中できる体制をつくります。",
    tags: ["事務代行", "カスタマーサポート", "運用設計"],
    image: "/images/service/svc-05.png",
  },
  {
    slug: "apparel-consulting",
    num: "06",
    en: "APPAREL CONSULTING",
    title: "アパレルコンサルティング事業",
    verb: "まとう",
    lead: "ブランド立ち上げ・OEM/ODM・販売戦略まで、ものづくりと売り場づくりに伴走します。",
    description:
      "オリジナルブランド運営で培った知見をもとに、ブランド立ち上げ・OEM/ODM・販売戦略を支援。コンセプト設計からものづくり、売り場づくりまで伴走します。",
    tags: ["ブランド設計", "OEM / ODM", "販売戦略"],
    image: "/images/service/svc-06.png",
  },
  {
    slug: "cross-border-ec",
    num: "07",
    en: "CROSS-BORDER EC",
    title: "海外越境ECサービス導入支援",
    verb: "ひらく",
    lead: "海外マーケットプレイスへの出店から、物流・決済・多言語対応までを支援します。",
    description:
      "海外マーケットプレイスへの出店から、物流・決済・多言語対応まで、越境ECの立ち上げと運用を支援。日本の商品を世界の顧客へ届けます。",
    tags: ["出店支援", "物流・決済", "多言語対応"],
    image: "/images/service/svc-07.png",
  },
  {
    slug: "it-enablement",
    num: "08",
    en: "IT ENABLEMENT",
    title: "中小向けIT導入支援事業",
    verb: "ねづく",
    lead: "ITツールの選定・導入・定着を伴走型で。補助金の活用もサポートします。",
    description:
      "中小企業のITツール選定・導入・定着をサポート。補助金の活用支援も含め、現場に無理なく根づくDXを、伴走型で実現します。",
    tags: ["ITツール選定", "補助金活用", "定着支援"],
    image: "/images/service/svc-08.png",
  },
];
