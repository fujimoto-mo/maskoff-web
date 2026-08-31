import manifest from "@/public/images/optimized/manifest.json";

type Entry = { width: number; height: number; avif: string; webp: string; src: string };
const MANIFEST = manifest as Record<string, Entry>;

/**
 * static export では next/image が使えないため、
 * scripts/optimize-images.mjs が生成した AVIF/WebP と manifest.json から <picture> を組み立てる。
 * src は public/images 配下のパス（例: "/images/works/01.jpg"）。
 */
export function Picture({ src, alt, sizes = "100vw", className, priority = false }: {
  src: string; alt: string; sizes?: string; className?: string; priority?: boolean;
}) {
  const m = MANIFEST[src];
  if (!m) {
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={m.avif} sizes={sizes} />
      <source type="image/webp" srcSet={m.webp} sizes={sizes} />
      <img src={m.src} alt={alt} width={m.width} height={m.height} loading={priority ? "eager" : "lazy"} decoding="async" />
    </picture>
  );
}
