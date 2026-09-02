import type { ContactInput } from "./contact.ts";

/**
 * お問い合わせ種別のラベル。select の描画に必要なため、
 * zod スキーマ本体（contact.ts）とは別ファイルに分離し、
 * ContactForm から静的 import しても zod を初期バンドルに含めないようにする。
 */
export const CATEGORY_LABELS: Record<ContactInput["category"], string> = {
  recruit: "採用について",
  web: "ホームページ制作・デザイン",
  apparel: "アパレル・OEM",
  artist: "アーティスト活動支援",
  other: "その他",
};
