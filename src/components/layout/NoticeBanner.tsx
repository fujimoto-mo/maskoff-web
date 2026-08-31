import Link from "next/link";
import { cn } from "@/lib/cn";
import { first, getPinnedNotice } from "@/lib/microcms";

/** isPinned な NOTICE を HOME 最上部に 1 行で出す。無ければ何も描画しない。 */
export default async function NoticeBanner() {
  const n = await getPinnedNotice();
  if (!n) return null;
  const urgent = first(n.level) === "urgent";
  return (
    <div className="wrap border-b border-border bg-surface py-2.5 text-caption">
      <Link href={`/notice/${n.slug}/`} className={cn("flex items-center gap-3", urgent ? "text-required" : "text-fg")}>
        <span className="shrink-0 rounded-pill border border-current px-2 py-0.5 text-[10px] font-bold tracking-[.08em]">{urgent ? "重要" : "お知らせ"}</span>
        <span className="truncate">{n.title}</span>
      </Link>
    </div>
  );
}
