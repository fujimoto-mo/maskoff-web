const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });

/** ISO 日時 → "2026.08.31"（JST）。一覧の日付表示に使う。 */
export function formatDate(iso: string): string {
  return fmt.format(new Date(iso)).replaceAll("/", ".");
}
