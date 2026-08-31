import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "株式会社MasKOFF",
  description: "アパレル企画・製造販売 / アーティスト活動支援 / ホームページ制作",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-bg text-fg-body antialiased">{children}</body>
    </html>
  );
}
