import manifest from "@/lib/images/manifest.json";

type Entry = { width: number; height: number; avif: string; webp: string };
const MANIFEST = manifest as Record<string, Entry>;

type Props = {
  /** public/images 配下のパス。例 "/images/hero/hero-01.png" */
  src: string;
  alt: string;
  /** ラスター画像では必須。例 "(max-width: 600px) 80vw, 33vw" */
  sizes?: string;
  /** .svg のときだけ必須（manifest に載らないため） */
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  /** LCP 候補（ヒーロー先頭）だけ true */
  priority?: boolean;
};
// className は <picture> に、imgClassName は <img> に付く（SVG も同じ）

/**
 * static export では next/image が使えないため、scripts/optimize-images.mjs が生成した
 * AVIF / WebP と manifest.json から <picture> を組み立てる。width / height を必ず出力し CLS を防ぐ。
 *
 * @example
 * <Picture src="/images/service/svc-01.png" alt="" sizes="(max-width: 600px) 80vw, 33vw" imgClassName="size-full object-cover" />
 * <Picture src="/images/company/vision-handwriting.svg" alt="創ることが好きだ" width={640} height={160} />
 */
export default function Picture({ src, alt, sizes, width, height, className, imgClassName, priority = false }: Props) {
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  if (src.endsWith(".svg")) {
    if (!width || !height) throw new Error(`Picture: SVG (${src}) には width / height を渡してください`);
    // <picture> で包むと eslint の @next/next/no-img-element が許容する
    return (
      <picture className={className}>
        <img src={src} alt={alt} width={width} height={height} className={imgClassName} loading={loading} decoding="async" />
      </picture>
    );
  }

  const m = MANIFEST[src];
  if (!m) throw new Error(`Picture: ${src} が manifest にありません。npm run images を実行してください`);
  if (!sizes) throw new Error(`Picture: ${src} に sizes を指定してください`);

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={m.avif} sizes={sizes} />
      <source type="image/webp" srcSet={m.webp} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={m.width}
        height={m.height}
        sizes={sizes}
        className={imgClassName}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </picture>
  );
}
