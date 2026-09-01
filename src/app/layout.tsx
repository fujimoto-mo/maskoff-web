import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipLink from "@/components/layout/SkipLink";
import StickyCta from "@/components/layout/StickyCta";
import RevealObserver from "@/components/motion/RevealObserver";
import JsonLd from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

// ビルド時に取得してセルフホストする（外部リクエストなし・CLS なし）
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto", display: "optional", preload: false });

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
    <html lang="ja" className={`${interTight.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-fg-body antialiased">
        {/* JS が動く環境だけ演出の初期状態（opacity:0 等）を適用する。JS 無効・クローラは常に可視 */}
        {/* 4 秒以内にハイドレーションが来なければ js を外し、必ずコンテンツを表示する（安全弁） */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealReady){document.documentElement.classList.remove('js')}},4000)",
          }}
        />
        <JsonLd data={organizationJsonLd(SITE)} />
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyCta />
        <RevealObserver />
      </body>
    </html>
  );
}
