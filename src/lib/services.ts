import { SITE } from "./site.ts"; // node:test でも解決できるよう相対 + 拡張子付き

// 9 事業（docs/design_handoff_service_page 由来。07 TiPLY は 2026-09-09 に追加）。HOME の SERVICE グリッド、/service/、/service/[slug]/ が共有する単一のデータ。
// SAMPLE: 本文（description）は仮文言、画像は仮画像。実データ確定時に差し替える。
export type Service = {
  slug: string;
  /** "01"〜"09"。SERVICE ページの番号 */
  num: string;
  /** 英字ラベル（番号の横・マーキー・パンくず） */
  en: string;
  title: string;
  /** HOME のバッジに入る動詞。4 文字以内（86px の丸に収める） */
  verb: string;
  /** HOME カード・詳細ページのリード用 1〜2 行。"\n" を入れるとその位置で改行する（whitespace-pre-line。meta description では空白に置換） */
  lead: string;
  /** /service/ の各行と詳細ページの本文 */
  description: string;
  /** タグチップ（3 つ） */
  tags: readonly string[];
  /** public/images/service/。imageFit が cover（既定）のときは正方形にする */
  image: string;
  /** 画像の収め方。写真は cover（既定）。透過背景のモックアップなど全体を見せたい画像は contain（余白は枠の bg-surface） */
  imageFit?: "cover" | "contain";
  /** HOME・一覧のカードだけの収め方（未指定なら imageFit）。カードは正方形なので、文字入りの横長写真は contain で全体を見せ、ヒーローは cover のままにしたいときに使う */
  cardFit?: "cover" | "contain";
  /** /service/[slug]/ のキービジュアルだけの拡大率（contain で余白が大きい画像用）。枠は overflow-hidden なので、はみ出した分は切れる。HOME・一覧のカードには効かない */
  imageZoom?: number;
  /** /service/[slug]/ のキービジュアルの帯を画像の縦横比に合わせる（例 "3 / 2"）。指定すると帯の高さは幅から決まり（PC では高くなる）、画像は切れずに全体が出る。未指定は既定の帯（clamp(240px,40vw,520px)）で cover */
  kvAspect?: string;
  /** /service/[slug]/ のキービジュアルだけの CSS object-position（cover で切れる位置の指定。既定は中央 "50% 50%"）。帯は横長なので、顔や見出しが上寄りの写真は "50% 15%" のように上を残す。HOME・一覧のカードには効かない */
  imagePosition?: string;
};

export const SERVICES: readonly Service[] = [
  {
    slug: "tech-education",
    num: "01",
    en: "TECH EDUCATION",
    title: `-${SITE.product} -`,
    verb: "育てる",
    lead: "-アナタの新しい顔を創る- \nMasKOFF Original Curriculum",
    description:
      `未経験からエンジニアを目指す実践型カリキュラム「${SITE.product}」を運営。実案件ベースの課題と現役エンジニアのメンタリングで、現場で通用するスキルを育てます。`,
    tags: ["プログラミング教育", "実案件ベース", "メンタリング"],
    image: "/images/service/svc-01.png",
    imageFit: "contain",
  },
  {
    slug: "web-development",
    num: "02",
    en: "WEB DEVELOPMENT",
    title: "WEBアプリケーション開発事業",
    verb: "創る",
    lead: "企画・UI/UX設計・開発・運用を一貫して。\n小さく速く出して、改善を重ねます。クリエイティブ領域含めてデザインを書き出します。",
    description:
      "業務システムからサービス立ち上げまで、企画・UI/UX設計・開発・運用を一貫して提供。小さく速くリリースし、改善を重ねる開発スタイルで事業の成長に伴走します。",
    tags: ["受託開発", "UI/UX設計", "保守運用"],
    image: "/images/service/svc-03.jpg",
  },
  {
    slug: "sns",
    num: "03",
    en: "SNS MARKETING",
    title: "SNSマーケティング事業",
    verb: "魅せる",
    lead: "-イメージ”を崩さないSNSマーケティング- \n企業様向けに弊社で磨き上げた優秀なスタッフをBPOを通して支援いたします。各企業の課題ヒアリングから設計、テスト、運用実施後、お客様のタイミングに合わせて即時解決いたします。",
    description:
      "事務・カスタマーサポートなどのバックオフィス業務を受託。業務フローの設計から運用まで担い、お客様がコア業務に集中できる体制をつくります。",
    tags: ["事務代行", "カスタマーサポート", "運用設計"],
    image: "/images/service/svc-05.jpg",
  },
  {
    slug: "apparel-consulting",
    num: "04",
    en: "APPAREL CONSULTING",
    title: "アパレルコンサルティング事業",
    verb: "纏う",
    lead: "ブランドを立ち上げたい個人または企業向けにデザインの作成からメーカーの取次、販売戦略までトレンドに合わせた支援が出来ます。広告運用からインフルエンサーの起用も可能",
    description:
      "オリジナルブランド運営で培った知見をもとに、ブランド立ち上げ・OEM/ODM・販売戦略を支援。コンセプト設計からものづくり、売り場づくりまで伴走します。",
    tags: ["ブランド設計", "OEM / ODM", "販売戦略"],
    image: "/images/service/svc-06.jpg",
    imagePosition: "50% 0%", // 2 人の顔が上端にあるため、ヒーローの帯（cover）では上を優先して切る
  },
  {
    slug: "career-support",
    num: "05",
    en: "CAREER SUPPORT",
    title: "キャリア支援事業【MIRAIZU】",
    verb: "支える",
    lead: "アナタの”MIRAIZU”を形成します。\nキャリア面談・スキル向上研修を通して、一人ひとりの「らしさ」を活かした働き方を提供します。",
    description:
      `キャリア面談・研修を通じて、一人ひとりの「らしさ」を活かした働き方を支援。${SITE.product}修了生のキャリアサポートとも連動しています。`,
    tags: ["キャリア面談・スキル向上研修"],
    // 2026-09-18 に文字なしの写真（docs/ChatGPT Image 2026年9月18日 16_20_26 (1).png、1536×1024）へ差し替え。カード・ヒーローとも他の事業と同じ cover。顔が上半分にあるので上寄せで切る
    image: "/images/service/svc-04.jpg",
    imagePosition: "50% 0%",
  },
  {
    slug: "recruitment-ads",
    num: "06",
    en: "RECRUITMENT ADS",
    title: "求人広告代理店事業",
    verb: "募る",
    lead: "媒体選定から原稿制作、掲載後の運用改善まで、採用広告をワンストップで支援します。",
    description:
      "各種求人媒体の正規代理店として、媒体選定から原稿制作、掲載後の運用改善までをワンストップで支援。採用ターゲットに届く広告設計で、企業の採用力を高めます。",
    tags: ["媒体選定", "原稿制作", "運用改善"],
    // 求人媒体のロゴ一覧（docs/svc-02.png を 1600px 正方形・bg-surface 地に整形、ロゴ群は上下左右とも中央。contain で全ロゴを見せる）
    image: "/images/service/svc-02.png",
    imageFit: "contain",
    // 詳細ページでは余白を詰めるため 1.4 倍に拡大（ロゴ群は縦 359〜1241px に収まり、1.4 倍で見える範囲 229〜1371px の内側なので切れない）
    imageZoom: 1.4,
  },
  {
    slug: "tiply",
    num: "07",
    en: "TiPLY",
    title: "TiPLY事業",
    verb: "もてなす",
    lead: "飲食店向けサービス「TiPLY」の企画・営業・マーケティング・サービス運営を行っています。\n（サービス準備中）",
    description:
      "飲食店向けサービス「TiPLY」に関する企画、営業、マーケティング、サービス運営などを行っています。（サービス準備中）",
    tags: ["サービス企画", "営業・マーケティング", "サービス運営"],
    // ARIGATO TiPLY JAPAN のロゴ・利用シーン・卓上 POP を並べた横長の合成画像（docs/Frame2.png、1200×613）。切り抜くと構成が壊れるため contain。地の白は枠の bg-surface（#F9F9F9）に合わせてある
    image: "/images/service/svc-07.png",
    imageFit: "contain",
  },
  {
    slug: "cross-border-ec",
    num: "08",
    en: "CROSS-BORDER EC",
    title: "海外越境ECサービス導入支援",
    verb: "拓く",
    lead: "海外マーケットプレイスへの出店から、物流・決済・多言語対応までを支援します。",
    description:
      "海外マーケットプレイスへの出店から、物流・決済・多言語対応まで、越境ECの立ち上げと運用を支援。日本の商品を世界の顧客へ届けます。",
    tags: ["出店支援", "物流・決済", "多言語対応"],
    // docs/Frame1.png（EC の 3D イラスト、1200×676）を JPEG に。全面絵柄なので cover
    image: "/images/service/svc-08.jpg",
  },
  {
    slug: "it-enablement",
    num: "09",
    en: "IT ENABLEMENT",
    title: "中小向けIT導入支援事業",
    verb: "根付く",
    lead: "ITツールの選定・導入・定着を伴走型で。補助金の活用もサポートします。",
    description:
      "中小企業のITツール選定・導入・定着をサポート。補助金の活用支援も含め、現場に無理なく根づくDXを、伴走型で実現します。",
    tags: ["ITツール選定", "補助金活用", "定着支援"],
    image: "/images/service/svc-09.jpg",
  },
];
