import { z } from "zod";

/**
 * お問い合わせフォームのスキーマ。
 * クライアント側の入力チェックと、API Route のサーバー側検証で
 * 同じ定義を共用する。クライアントだけの検証は開発者ツールで回避できるため、
 * サーバー側での再検証を必ず行うこと。
 */
export const contactSchema = z.object({
  company: z
    .string()
    .trim()
    .max(100, "会社名は100文字以内で入力してください")
    .optional()
    .or(z.literal("")),

  name: z
    .string()
    .trim()
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),

  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません")
    .max(254),

  tel: z
    .string()
    .trim()
    .regex(/^[0-9+\-() ]*$/, "電話番号は数字とハイフンで入力してください")
    .max(20)
    .optional()
    .or(z.literal("")),

  category: z.enum(["web", "apparel", "artist", "recruit", "other"], {
    message: "お問い合わせ種別を選択してください",
  }),

  message: z
    .string()
    .trim()
    .min(10, "お問い合わせ内容は10文字以上で入力してください")
    .max(2000, "お問い合わせ内容は2000文字以内で入力してください"),

  consent: z.literal(true, {
    message: "プライバシーポリシーへの同意が必要です",
  }),

  /** ハニーポット。人間には見えない項目なので、値が入っていたらBot。 */
  website: z.literal("", { message: "" }).optional(),

  /** Cloudflare Turnstile のトークン */
  turnstileToken: z.string().min(1, "認証が完了していません"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const CATEGORY_LABELS: Record<ContactInput["category"], string> = {
  web: "ホームページ制作・デザイン",
  apparel: "アパレル・OEM",
  artist: "アーティスト活動支援",
  recruit: "採用について",
  other: "その他",
};
