import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipLink from "@/components/layout/SkipLink";
import StickyCta from "@/components/layout/StickyCta";
import JsonLd from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

// ビルド時に取得してセルフホストする（外部リクエストなし・CLS なし）
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}｜${SITE.tagline}`, template: `%s｜${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: "ja_JP", images: ["/images/ogp.png"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${interTight.variable} ${notoSansJP.variable}`}>
      <body className="bg-bg text-fg-body antialiased">
        <JsonLd data={organizationJsonLd(SITE)} />
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyCta />
      </body>
    </html>
  );
}
