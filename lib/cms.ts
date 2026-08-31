/**
 * microCMS クライアント（ビルド時のみ実行）
 * 環境変数が無い場合は content/sample.ts のサンプルデータへフォールバックするため、
 * microCMS 未契約でも `next build` が通る。
 */
import { SAMPLE } from "@/content/sample";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
const ENABLED = Boolean(DOMAIN && KEY);

export type Category = { id: string; name: string; slug: string };
export type News = {
  id: string;
  title: string;
  publishedAt: string;
  category?: Category;
  thumbnail?: { url: string; width: number; height: number };
  body: string; // HTML
};
export type Notice = { id: string; title: string; publishedAt: string; body: string };
export type Job = {
  id: string;
  title: string;
  employmentType: string; // 正社員 / 契約社員 / アルバイト
  location: string;
  salary: string;
  description: string; // HTML
  requirements: string; // HTML
  publishedAt: string;
};
export type Faq = { id: string; question: string; answer: string };
export type Member = { id: string; name: string; role: string; bio: string; image?: { url: string } };

type ListRes<T> = { contents: T[]; totalCount: number };

async function get<T>(endpoint: string, query: Record<string, string | number> = {}): Promise<T> {
  const qs = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`https://${DOMAIN}.microcms.io/api/v1/${endpoint}?${qs}`, {
    headers: { "X-MICROCMS-API-KEY": KEY! },
  });
  if (!res.ok) throw new Error(`microCMS ${endpoint} ${res.status}`);
  return res.json() as Promise<T>;
}

async function list<T>(endpoint: string, sample: T[], extra: Record<string, string | number> = {}): Promise<T[]> {
  if (!ENABLED) return sample;
  const r = await get<ListRes<T>>(endpoint, { limit: 100, orders: "-publishedAt", ...extra });
  return r.contents;
}

export const cms = {
  news: () => list<News>("news", SAMPLE.news),
  newsById: async (id: string) => (await cms.news()).find((n) => n.id === id),
  newsCategories: async (): Promise<Category[]> => {
    const items = await cms.news();
    const map = new Map<string, Category>();
    items.forEach((n) => n.category && map.set(n.category.slug, n.category));
    return [...map.values()];
  },
  notice: () => list<Notice>("notice", SAMPLE.notice),
  noticeById: async (id: string) => (await cms.notice()).find((n) => n.id === id),
  jobs: () => list<Job>("jobs", SAMPLE.jobs),
  jobById: async (id: string) => (await cms.jobs()).find((j) => j.id === id),
  faq: () => list<Faq>("faq", SAMPLE.faq),
  members: () => list<Member>("members", SAMPLE.members),
};

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};
