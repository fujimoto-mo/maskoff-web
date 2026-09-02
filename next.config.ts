import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers Static Assets へ静的エクスポート。API Routes は使えない（worker/ に書く）。
  output: "export",
  // 静的エクスポートでは最適化サーバーが動かない → scripts/optimize-images.mjs + components/ui/Picture.tsx
  images: { unoptimized: true },
  // /path/ 形式で出力（Cloudflare が index.html を素直に配信できる）
  trailingSlash: true,
  reactStrictMode: true,
  // リダイレクトは public/_redirects に書く（redirects() は静的エクスポートで無効）
};

export default nextConfig;
