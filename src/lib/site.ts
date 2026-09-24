// 電話番号・SNS はサイトに載せない（会社の Instagram / X は無い。2026-09-24 クライアント指示）。SNS を持ったら sns: { instagram, x } を足すと Organization の sameAs と SP メニューに出る。
export const SITE = {
  name: "株式会社MasKOFF",
  nameEn: "MasKOFF Inc.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maskoff.co.jp",
  tagline: "TAKE THE MASKOFF",
  /** 自社プロダクトの正式表記。見出し・本文・meta・構造化データはすべてここを参照する（表記ゆれ防止） */
  product: "techMasKLab",
  description:
    "MASK OFF には「仮面を外す」「素の自分」という意味があります。株式会社MasKOFFは、アパレル企画・製造販売、アーティスト活動支援、ホームページ制作を通じて、人と企業の「素」を引き出します。",
  address: "〒150-0021 東京都渋谷区恵比寿西1-33-6-216",
  /** 構造化データ（JobPosting の勤務地など）用の分割表記。address と同じ住所 */
  postalAddress: { postalCode: "150-0021", addressRegion: "東京都", addressLocality: "渋谷区", streetAddress: "恵比寿西1-33-6-216" },
  email: "info@maskoff.co.jp",
  /** Google Search Console の HTML タグ確認（google-site-verification の content）。空なら出力しない */
  googleSiteVerification: "ULpbwxv1vzs6tkT5-xMFuLcDXMRKEK6GhjW6nUdiVcs" as string,
  /** GA4 の測定 ID（G-XXXXXXXXXX）。空なら読み込まない。本番ホストでだけ動く（components/layout/Analytics.tsx） */
  ga4MeasurementId: "G-YGKBEG5KQB" as string,
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
  { href: "/privacypolicy/", label: "プライバシーポリシー" },
  { href: "/transaction/", label: "TRANSACTION ACT" },
] as const;
