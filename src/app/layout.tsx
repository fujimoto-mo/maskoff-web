import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipLink from "@/components/layout/SkipLink";
import StickyCta from "@/components/layout/StickyCta";
import CustomCursor from "@/components/motion/CustomCursor";
import RevealObserver from "@/components/motion/RevealObserver";
import JsonLd from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

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
    <html lang="ja" suppressHydrationWarning>
      {/* フォントは scripts/mirror-fonts.mjs でセルフホスト（src/styles/fonts.css）。見出し用 latin だけ先読み */}
      <link rel="preload" href="/fonts/inter-tight/latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
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
        <CustomCursor />
      </body>
    </html>
  );
}
