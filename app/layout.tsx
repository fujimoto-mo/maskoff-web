import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyCta } from "@/components/StickyCta";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";

// フォントは Google Fonts を <link> で読み込む（next/font はビルド時にネットワークが必要で CI が不安定になるため）。
// 自前ホストへ切り替える場合は public/fonts に配置し globals.css の @font-face へ。
const FONT_URL = "https://fonts.googleapis.com/css2?family=Anton&family=Noto+Sans+JP:wght@400;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | 自分らしさを表現するファッションブランドとクリエイティブサービス`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: "ja_JP", images: ["/images/ogp.png"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
      </head>
      <body>
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "Organization",
          name: SITE.name, url: SITE.url, logo: `${SITE.url}/images/logo.png`,
          address: { "@type": "PostalAddress", addressCountry: "JP", streetAddress: SITE.address },
          sameAs: [SITE.sns.instagram, SITE.sns.x],
        }} />
        <Header />
        <main id="top">{children}</main>
        <Footer />
        <StickyCta />
      </body>
    </html>
  );
}
