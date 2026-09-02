// SAMPLE: 住所・電話・SNS は仮。公開前に実データへ差し替える。
export const SITE = {
  name: "株式会社MasKOFF",
  nameEn: "MasKOFF Inc.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maskoff.co.jp",
  tagline: "TAKE THE MASKOFF",
  description:
    "MASK OFF には「仮面を外す」「素の自分」という意味があります。株式会社MasKOFFは、アパレル企画・製造販売、アーティスト活動支援、ホームページ制作を通じて、人と企業の「素」を引き出します。",
  address: "〒150-0021 東京都渋谷区恵比寿西1-33-6-216",
  tel: "090-0000-0000",
  email: "info@maskoff.co.jp",
  sns: {
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
} as const;

/** ヘッダー・フッターの主要ナビ。HOME 内アンカーではなくサイト共通（spec §3-7） */
export const NAV = [
  { href: "/company/", label: "COMPANY", ja: "会社情報" },
  { href: "/service/", label: "SERVICE", ja: "事業内容" },
  { href: "/#news", label: "NEWS", ja: "ニュース" }, // HOME の NEWS セクションへスムーズスクロール
  { href: "/#notice", label: "NOTICE", ja: "お知らせ" }, // HOME の NOTICE 列へスムーズスクロール
  { href: "/contact/", label: "CONTACT", ja: "お問い合わせ" },
] as const;

export const SUB_NAV = [
  { href: "/notice/", label: "お知らせ" },
  { href: "/PRIVACYPOLICY/", label: "プライバシーポリシー" },
  { href: "/TRANSACTIONACT/", label: "TRANSACTION ACT" },
] as const;
