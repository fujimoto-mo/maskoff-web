// SAMPLE: 支援先。画像は 21:13、アイコンは正方形。
export type Partner = {
  id: string;
  /** 左上タグ。大文字英字 */
  tag: string;
  name: string;
  text: string;
  /** 21:13。public/images/partners/ */
  image: string;
  /** 44px 表示の正方形アイコン */
  icon: string;
};

export const PARTNERS: readonly Partner[] = [
  { id: "p1", tag: "SPORTS", name: "Sample Football Club", text: "地域からトップリーグを目指すクラブ。2026 シーズンのオフィシャルパートナーとしてユニフォーム製作を担当。", image: "/images/partners/p01.png", icon: "/images/partners/icon-01.png" },
  { id: "p2", tag: "EVENT", name: "Sample Creative Fes", text: "映像・デザイン・音楽の表現者が集う創作フェス。ブース出展と物販運営を支援。", image: "/images/partners/p02.png", icon: "/images/partners/icon-02.png" },
  { id: "p3", tag: "SCHOOL", name: "Sample Design School", text: "若手デザイナー向けの実践講座にカリキュラムと講師を提供。", image: "/images/partners/p03.png", icon: "/images/partners/icon-03.png" },
  { id: "p4", tag: "COMMUNITY", name: "Sample Artist Collective", text: "所属アーティストの制作・発信・販売をまとめてバックアップ。", image: "/images/partners/p04.png", icon: "/images/partners/icon-04.png" },
];
