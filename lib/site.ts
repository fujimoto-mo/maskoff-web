export const SITE = {
  name: "株式会社MasKOFF",
  nameEn: "MasKOFF Inc.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maskoff.co.jp",
  description:
    "MASK OFFには「仮面を外す」「素の自分」という意味があります。株式会社MasKOFFは、“進化したこの時代で新たな個性をさらけ出す”という理念のもと、アパレル・IT・キャリア支援・BPOなど8つの事業を展開しています。",
  tagline: "TAKE THE MASK OFF",
  // --- 以下はサンプル。公開前に実データへ差し替え ---
  address: "〒000-0000 東京都○○区○○ 1-2-3 ○○ビル 5F",
  tel: "03-0000-0000",
  email: "info@maskoff.co.jp",
  founded: "20XX年X月",
  capital: "X,000万円",
  ceo: "代表取締役 ○○ ○○",
  employees: "XX名（20XX年X月現在）",
  sns: {
    instagram: "https://www.instagram.com/",
    x: "https://x.com/",
  },
} as const;

export const NAV = [
  { href: "/company/", label: "COMPANY", ja: "会社情報" },
  { href: "/service/", label: "SERVICE", ja: "事業内容" },
  { href: "/news/", label: "NEWS", ja: "ニュース" },
  { href: "/notice/", label: "NOTICE", ja: "お知らせ" },
  { href: "/recruit/", label: "RECRUIT", ja: "採用情報" },
  { href: "/contact/", label: "CONTACT", ja: "お問い合わせ" },
] as const;

// HOME（apply LP 型）内アンカー
export const HOME_ANCHORS = [
  { href: "#vision", label: "VISION" },
  { href: "#service", label: "SERVICE" },
  { href: "#works", label: "WORKS" },
  { href: "#partners", label: "PARTNERS" },
  { href: "#faq", label: "FAQ" },
] as const;
