// SAMPLE: 制作・支援事例。ロゴ・サムネは仮画像。microCMS の API 上限（5 本）を温存するため静的管理。
export type Work = {
  id: string;
  /** クライアント名・ブランド名 */
  name: string;
  /** 案件種別。例 "アパレルブランド / EC 構築" */
  kind: string;
  /** 80〜140 字 */
  text: string;
  /** 正方形ロゴ。public/images/works/ */
  logo: string;
  /** コラージュ用サムネ 3〜5 枚（フェーズ③で使用） */
  thumbs: string[];
  url?: string;
};

const thumbs = (n: number) => Array.from({ length: 5 }, (_, k) => `/images/works/w${String(n).padStart(2, "0")}-${k + 1}.png`);

export const WORKS: readonly Work[] = [
  { id: "w1", name: "Sample Brand A", kind: "アパレルブランド / EC 構築", text: "ブランドコンセプトの言語化から EC の立ち上げ、初回コレクションの生産までを伴走。企画開始から 3 か月で販売を開始した。", logo: "/images/works/logo-01.png", thumbs: thumbs(1), url: "https://example.com/" },
  { id: "w2", name: "Sample Artist B", kind: "アーティスト活動支援 / グッズ製作", text: "個展に合わせたグッズ 6 種の製作と物販運営を担当。会期後はオンライン販売へ移行し、在庫管理まで引き受けている。", logo: "/images/works/logo-02.png", thumbs: thumbs(2) },
  { id: "w3", name: "Sample Clinic C", kind: "コーポレートサイト", text: "予約導線を再設計し、静的サイト + ヘッドレス CMS で月額コスト 0 円の運用に移行。表示速度スコアは 60 台から 90 台へ。", logo: "/images/works/logo-03.png", thumbs: thumbs(3) },
  { id: "w4", name: "Sample Team D", kind: "ユニフォーム OEM", text: "地域スポーツクラブのユニフォームとサポーターグッズを小ロットで製造。毎シーズンのデザイン更新にも対応している。", logo: "/images/works/logo-04.png", thumbs: thumbs(4) },
  { id: "w5", name: "Sample Studio E", kind: "ブランディング / ロゴ", text: "写真スタジオのロゴと名刺、Web サイトを一貫したトーンで制作。開業から 1 年で指名予約が 7 割を占めるまでになった。", logo: "/images/works/logo-05.png", thumbs: thumbs(5) },
  { id: "w6", name: "Sample Label F", kind: "EC サイト構築 / SNS 運用", text: "インディーレーベルの EC を構築し、リリースに合わせた SNS 投稿設計を支援。初回ドロップは 48 時間で完売した。", logo: "/images/works/logo-06.png", thumbs: thumbs(6) },
];
