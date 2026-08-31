export type Pinnable = { isPinned?: boolean; publishedDate: string; expiresAt?: string };

/**
 * HOME 最上部に帯で出す NOTICE を 1 件選ぶ。isPinned かつ expiresAt 未到来のうち最新。
 * @example const n = selectPinned(await getNotice()); if (n) <NoticeBanner />
 */
export function selectPinned<T extends Pinnable>(list: readonly T[], now: Date = new Date()): T | null {
  const t = now.getTime();
  const live = list.filter((n) => n.isPinned === true && (!n.expiresAt || new Date(n.expiresAt).getTime() > t));
  live.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  return live[0] ?? null;
}
