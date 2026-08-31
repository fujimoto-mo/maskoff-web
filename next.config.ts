import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cloudflare Pages へ静的エクスポートする。
   *
   * この構成を選ぶ理由:
   * - 静的アセットのリクエストは Cloudflare 側で無制限・無課金。
   *   Workers の消費はフォーム送信時のみになるため、実質ゼロで運用できる。
   * - 7ページ + 記事数百件なら全ページを事前生成できる。ISR は不要。
   *
   * 制約:
   * - API Routes は使えない。フォームは functions/api/contact.ts（Pages Functions）に置く。
   * - next/image の最適化サーバーが使えない。scripts/optimize-images.mjs で
   *   ビルド前に WebP / AVIF を生成し、components/ui/Picture.tsx で出し分ける。
   */
  output: "export",

  // 静的エクスポートでは最適化サーバーが動かないため無効化する。
  // 代わりにビルド時最適化（scripts/optimize-images.mjs）を使う。
  images: {
    unoptimized: true,
  },

  // Cloudflare Pages は /path/ 形式のディレクトリ構造を素直に配信できる
  trailingSlash: true,

  // 現行 STUDIO サイトから URL が変わる場合、ここではなく
  // public/_redirects に 301 を書く（静的エクスポートでは redirects() が効かない）
  reactStrictMode: true,

  // Next.js 16 で `eslint` オプションは削除された（next build は lint を実行しない）。
  // lint は `npm run lint`（ESLint CLI）で別途実行する。
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
