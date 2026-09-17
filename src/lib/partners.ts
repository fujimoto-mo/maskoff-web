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
  { id: "p1", tag: "MARKETING", name: "株式会社トリドリ", text: "上場企業であるトリドリ社と弊社MasKOFFにて次世代向けのSNSマーケティング事業をご紹介しております。企業が抱える認知度を上げたい。インフルエンサーを活用したい。SNSの運用方法について独自の支援モデルで寄り添い他社に負けない販売戦略、広告戦略をお届けします。お取引業界ではIT業界、人材業界、飲食業界、アパレル業界と幅広い企業様にご活用いただいております。", image: "/images/partners/p01.png", icon: "/images/partners/icon-01.png" },
  { id: "p2", tag: "RESTAURANT SERVICES BUSINESS", name: "全国における飲食店", text: "飲食店向けサービス「TiPLY」を展開する自社事業。国が政策で掲げております-2030年 インバウンド問題-に対して、新しい取り組みとして、弊社が強みとなる海外マーケットのネットワークを利用し、日本全国の飲食店様向けに海外の方々からのダイレクトな新しいお声を届けるのと、新しい収入源を創れるソリューションサービスとなります。", image: "/images/partners/p03.png", icon: "/images/partners/icon-03.png" },
  { id: "p3", tag: "PARTNERSHIP", name: "株式会社インターベル", text: "互いの強みを掛け合わせる事業提携パートナーのインター・ベル様。アパレル業界の人材不足解決からサービスの企画、営業・運営までを共同で推進し、事業領域を広げるVISIONで協業しております。", image: "/images/partners/p02.jpg", icon: "/images/partners/icon-02.png" },
  { id: "p4", tag: "DROPSHIPPING", name: "EC販売を主としているアパレル企業", text: "アパレル業界に強い弊社のノウハウを通して、インハウス支援を行っております。在庫を持たずに商品を販売するEC販売事業”ドロップシッピングモデル型”で企業が抱える在庫トラブルや原価問題含めて低コストで１からアパレルの立ち上げを支援しております。", image: "/images/partners/p04.jpg", icon: "/images/partners/icon-04.png" },
];
