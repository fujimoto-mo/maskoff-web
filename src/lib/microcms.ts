/**
 * microCMS クライアント（ビルド時のみ実行）。
 * 環境変数が無ければ content/sample.ts を返すので、未契約でも next build が通る。
 * 画像は microCMS から直接配信しない（CLAUDE.md §2-4）。HOME では CMS 画像を使わない。
 */
import { SAMPLE } from "@/content/sample";
import { selectPinned } from "@/lib/pinned";
import type { News, Notice, Faq, Member, Job, NewsCategory } from "@/types/microcms";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
const ENABLED = Boolean(DOMAIN && KEY);

type ListRes<T> = { contents: T[]; totalCount: number };

async function list<T>(endpoint: string, sample: readonly T[], query: Record<string, string> = {}): Promise<T[]> {
  if (!ENABLED) return [...sample];
  const qs = new URLSearchParams({ limit: "100", ...query });
  const res = await fetch(`https://${DOMAIN}.microcms.io/api/v1/${endpoint}?${qs}`, {
    headers: { "X-MICROCMS-API-KEY": KEY as string },
  });
  if (!res.ok) throw new Error(`microCMS ${endpoint} ${res.status}`);
  return ((await res.json()) as ListRes<T>).contents;
}

export const getNews = () => list<News>("news", SAMPLE.news, { orders: "-publishedDate" });
export const getNotice = () => list<Notice>("notice", SAMPLE.notice, { orders: "-publishedDate" });
export const getFaq = () => list<Faq>("faq", SAMPLE.faq, { orders: "order" });
export const getMembers = () => list<Member>("members", SAMPLE.members, { orders: "order" });
export const getJobs = () => list<Job>("jobs", SAMPLE.jobs, { orders: "order", filters: "isOpen[equals]true" });

/** HOME 最上部の帯に出す NOTICE（無ければ null） */
export async function getPinnedNotice(): Promise<Notice | null> {
  return selectPinned(await getNotice());
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  press: "プレスリリース",
  works: "実績",
  media: "メディア掲載",
  event: "イベント",
};

/** microCMS のセレクト（配列）から先頭を取る */
export function first<T>(v: T | readonly T[] | undefined): T | undefined {
  return Array.isArray(v) ? (v[0] as T | undefined) : (v as T | undefined);
}
