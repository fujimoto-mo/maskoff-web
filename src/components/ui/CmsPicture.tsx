import Picture from "@/components/ui/Picture";
import type { CmsImage } from "@/lib/cms-images";

type Props = { image: CmsImage; alt: string; sizes: string; className?: string; imgClassName?: string };

/**
 * microCMS 由来の画像。scripts/fetch-cms-images.mjs で同梱済み（avif / webp あり）なら Picture で出力し、
 * 未取得（ローカルで取得スクリプトを走らせていない等）のときだけ元 URL の <img> にフォールバックする。
 * @example <CmsPicture image={item.thumbnail} alt="" sizes="(max-width: 900px) 92vw, 720px" />
 */
export default function CmsPicture({ image, alt, sizes, className, imgClassName }: Props) {
  if (image.avif && image.webp) {
    return <Picture src={image.url} alt={alt} sizes={sizes} className={className} imgClassName={imgClassName} entry={{ width: image.width, height: image.height, avif: image.avif, webp: image.webp }} />;
  }
  return (
    <picture className={className}>
      <img src={image.url} alt={alt} width={image.width} height={image.height} sizes={sizes} className={imgClassName} loading="lazy" decoding="async" />
    </picture>
  );
}
