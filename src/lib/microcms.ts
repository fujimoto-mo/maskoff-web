/**
 * microCMS クライアント（ビルド時のみ実行）。
 * 環境変数が無ければ content/sample.ts を返すので、未契約でも next build が通る。
 * 画像は microCMS から直接配信しない（CLAUDE.md §2-4）。HOME では CMS 画像を使わない。
 */
import { readFileSync } from "node:fs";
import https from "node:https";
import { join } from "node:path";
import { SAMPLE } from "@/content/sample";
import { localizeImage, type CmsManifest } from "@/lib/cms-images";
import type { News, Notice, Faq, Member, Job, NewsCategory } from "@/types/microcms";

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const KEY = process.env.MICROCMS_API_KEY;
const ENABLED = Boolean(DOMAIN && KEY);

type ListRes<T> = { contents: T[]; totalCount: number };

// 同一ビルド内では同じ一覧を 1 回だけ取得して共有する（ページ数分 API を叩かない）
const inflight = new Map<string, Promise<unknown[]>>();

/**
 * Next がパッチした fetch を使わず node:https で取得する。
 * fetch を使うと Next の Data Cache（.next/cache/fetch-cache）に応答が保存され、次のビルドでも古い応答が再利用されて
 * 新しい記事の詳細が 404 になる（generateStaticParams と本体で結果がずれる）。cache: "no-store" は静的エクスポートで
 * ルートが動的扱いになりビルドが失敗するため使えない。ビルド時にしか動かないので Node API で問題ない。
 */
function getJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (!res.statusCode || res.statusCode >= 400) return reject(new Error(`microCMS ${url.split("/api/v1/")[1]?.split("?")[0]} ${res.statusCode}`));
          try {
            resolve(JSON.parse(body) as T);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function list<T>(endpoint: string, sample: readonly T[], query: Record<string, string> = {}): Promise<T[]> {
  if (!ENABLED) return [...sample];
  const qs = new URLSearchParams({ limit: "100", ...query });
  const url = `https://${DOMAIN}.microcms.io/api/v1/${endpoint}?${qs}`;
  if (!inflight.has(url)) inflight.set(url, getJson<ListRes<T>>(url, { "X-MICROCMS-API-KEY": KEY as string }).then((r) => r.contents));
  return [...((await inflight.get(url)!) as T[])];
}

/** scripts/fetch-cms-images.mjs が書く同梱画像の一覧。無ければ空（サムネイルは元 URL のまま） */
function readCmsManifest(): CmsManifest {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "src/lib/images/cms-manifest.json"), "utf8")) as CmsManifest;
  } catch {
    return {};
  }
}

export const getNews = async (): Promise<News[]> => {
  const items = await list<News>("news", SAMPLE.news, { orders: "-publishedDate" });
  const manifest = readCmsManifest();
  return items.map((n) => ({ ...n, thumbnail: localizeImage(n.thumbnail, manifest) }));
};
export const getNotice = () => list<Notice>("notice", SAMPLE.notice, { orders: "-publishedDate" });
export const getFaq = () => list<Faq>("faq", SAMPLE.faq, { orders: "order" });
export const getMembers = () => list<Member>("members", SAMPLE.members, { orders: "order" });
export const getJobs = () => list<Job>("jobs", SAMPLE.jobs, { orders: "order", filters: "isOpen[equals]true" });

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  press: "お知らせ",
  brand: "NEW BRAND",
  interview: "インタビュー",
  blog: "Blog",
};

/** microCMS のセレクト（配列）から先頭を取る */
export function first<T>(v: T | readonly T[] | undefined): T | undefined {
  return Array.isArray(v) ? (v[0] as T | undefined) : (v as T | undefined);
}
