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
  { id: "p1", tag: "MARKETING", name: "トリドリマーケティング", text: "SNS・インフルエンサーを起点としたマーケティング支援。企画から運用・効果検証まで、認知拡大と販促を一体で推進。", image: "/images/partners/p01.png", icon: "/images/partners/icon-01.png" },
  { id: "p2", tag: "PARTNERSHIP", name: "インターベル事業提携", text: "互いの強みを掛け合わせる事業提携パートナー。サービスの企画から営業・運営までを共同で推進し、事業領域を広げる。", image: "/images/partners/p02.png", icon: "/images/partners/icon-02.png" },
  { id: "p3", tag: "RESTAURANT SERVICES BUSINESS", name: "TiPLY飲食店向けサービス事業", text: "飲食店向けサービス「TiPLY」を展開する自社事業。サービス企画から営業・マーケティング・運営までを一貫して手がける。", image: "/images/partners/p03.png", icon: "/images/partners/icon-03.png" },
  { id: "p4", tag: "DROPSHIPPING", name: "ドロップシッピング事業", text: "在庫を持たずに商品を販売するEC事業。商品選定からストア構築、受注・配送手配までを一貫して運営。", image: "/images/partners/p04.png", icon: "/images/partners/icon-04.png" },
];
