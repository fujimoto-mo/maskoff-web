import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true }, // next/image は static export で最適化不可 → Picture.tsx を使用
  reactStrictMode: true,
};

export default nextConfig;
