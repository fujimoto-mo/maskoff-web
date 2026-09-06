/**
 * 動的ルートの params.slug を元の文字列に戻す。静的エクスポートでは日本語などの非 ASCII スラッグが
 * パーセントエンコードされた形で渡るため、そのまま比較すると記事が見つからず 404 になる。
 * @example decodeSlug("%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9") // "ニュース"
 */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
