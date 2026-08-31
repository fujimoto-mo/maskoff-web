// Dipsy の OFFICIAL CREATORS セクションに相当。microCMS Hobby の API 上限（5）節約のため静的管理。
export type Work = {
  id: string;
  name: string;
  role: string;
  text: string;
  handle: string;
  url: string;
  image: string; // /images/works/xxx.jpg（サンプル）
};

export const WORKS: Work[] = [
  { id: "w1", name: "Sample Brand A", role: "アパレルブランド / EC構築", text: "ブランドコンセプト設計からEC立ち上げ、初回コレクションの生産まで伴走。3か月で販売開始。", handle: "sample_brand_a", url: "#", image: "/images/works/01.jpg" },
  { id: "w2", name: "Sample Clinic B", role: "コーポレートサイト", text: "予約導線を再設計し、静的サイト＋ヘッドレスCMSで月額コスト0円の運用に移行。", handle: "sample_clinic_b", url: "#", image: "/images/works/02.jpg" },
  { id: "w3", name: "Sample Works C", role: "求人広告 / 採用支援", text: "複数媒体の横断運用と原稿改善で、応募数を前年比2.4倍に。", handle: "sample_works_c", url: "#", image: "/images/works/03.jpg" },
  { id: "w4", name: "Sample Foods D", role: "越境EC導入", text: "Shopifyで英語・中国語サイトを構築し、台湾・香港向け販売を開始。", handle: "sample_foods_d", url: "#", image: "/images/works/04.jpg" },
  { id: "w5", name: "Sample Office E", role: "IT導入支援", text: "Google Workspaceへの移行とkintoneによる案件管理を導入。補助金申請も支援。", handle: "sample_office_e", url: "#", image: "/images/works/05.jpg" },
  { id: "w6", name: "Sample Studio F", role: "BPO / EC運用代行", text: "受注処理・カスタマー対応・SNS運用を一括で受託し、社内工数を月80時間削減。", handle: "sample_studio_f", url: "#", image: "/images/works/06.jpg" },
];
