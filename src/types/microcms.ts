// docs/microcms-schemas/*.json に対応。ただし News.thumbnail はスキーマ上 required だが、フェーズ①は CMS 画像を使わずサンプルにも無いため意図的に optional にしている。フィールドを増やすときは JSON と同時に更新する。
export type MicroImage = { url: string; width: number; height: number; avif?: string; webp?: string }; // avif / webp はビルド時に同梱した場合のみ（lib/cms-images）

type Base = { id: string; createdAt: string; updatedAt: string; publishedAt: string; revisedAt: string };

export type NewsCategory = "press" | "brand" | "interview" | "blog";
export type News = Base & {
  title: string;
  slug: string;
  category: NewsCategory[]; // microCMS のセレクトは配列で返る
  publishedDate: string;
  thumbnail?: MicroImage;
  excerpt?: string;
  body: string; // HTML
  relatedNews?: News[];
};

export type NoticeLevel = "normal" | "important" | "urgent";
export type Notice = Base & {
  title: string;
  slug: string;
  level: NoticeLevel[];
  isPinned?: boolean;
  publishedDate: string;
  expiresAt?: string;
  body: string;
};

export type FaqCategory = "service" | "price" | "flow" | "recruit";
export type Faq = Base & { question: string; answer: string; note?: string; category?: FaqCategory[]; order: number };

export type Member = Base & {
  name: string;
  slug: string;
  role: string;
  avatar: MicroImage;
  bio: string;
  markerPhrases?: string;
  worksImages?: MicroImage[];
  instagram?: string;
  externalUrl?: string;
  order: number;
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
export type Job = Base & {
  title: string;
  slug: string;
  employmentType: EmploymentType[];
  description: string;
  requirements: string;
  preferred?: string;
  salaryMin?: number;
  salaryMax?: number;
  workLocation: string;
  workHours?: string;
  benefits?: string;
  validThrough?: string;
  isOpen: boolean;
  order: number;
};
