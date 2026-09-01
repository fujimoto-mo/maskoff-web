import type { CSSProperties } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { revealDelay } from "@/components/motion/reveal-delay";
import { formatDate } from "@/lib/date";
import { NEWS_CATEGORY_LABELS, first } from "@/lib/microcms";
import type { News, Notice } from "@/types/microcms";

type Props = { news: News[]; notice: Notice[] };

function Row({ href, date, tag, title, index }: { href: string; date: string; tag?: string; title: string; index: number }) {
  return (
    <li className="border-b border-border" data-reveal="up" style={{ "--rd": `${revealDelay(index)}ms` } as CSSProperties}>
      <Link href={href} className="group grid grid-cols-[auto_auto_1fr] items-baseline gap-x-5 py-5 max-sp:grid-cols-[auto_auto] max-sp:gap-y-1.5">
        <time dateTime={date} className="font-display text-caption tabular-nums text-fg-muted">
          {formatDate(date)}
        </time>
        {tag ? <span className="rounded-pill border border-border px-2 py-0.5 text-[10px] font-bold tracking-[.06em] text-fg-muted">{tag}</span> : <span />}
        <span className="text-body font-bold text-fg transition-colors group-hover:text-fg-muted max-sp:col-span-2 max-sp:text-body-sp">{title}</span>
      </Link>
    </li>
  );
}

/**
 * HOME の NEWS / NOTICE 最新 3 件（CLAUDE.md §5）。dipsy には無いセクション。
 * @example <NewsStrip news={await getNews()} notice={await getNotice()} />
 */
export default function NewsStrip({ news, notice }: Props) {
  return (
    <section id="news" aria-labelledby="news-title" className="section-pad">
      <div className="wrap grid grid-cols-2 gap-gap-cols max-tab:grid-cols-1 max-tab:gap-16">
        <div>
          <SectionHeading en="NEWS" ja="ニュース" id="news-title" />
          <ul className="border-t border-border">
            {news.slice(0, 3).map((n, i) => (
              <Row key={n.id} href={`/news/${n.slug}/`} date={n.publishedDate} tag={NEWS_CATEGORY_LABELS[first(n.category) ?? "press"]} title={n.title} index={i} />
            ))}
          </ul>
          <p className="mt-6">
            <Button href="/news/" variant="line">
              すべてのニュース
            </Button>
          </p>
        </div>
        <div>
          <SectionHeading en="NOTICE" ja="お知らせ" id="notice-title" />
          <ul className="border-t border-border">
            {notice.slice(0, 3).map((n, i) => (
              <Row key={n.id} href={`/notice/${n.slug}/`} date={n.publishedDate} title={n.title} index={i} />
            ))}
          </ul>
          <p className="mt-6">
            <Button href="/notice/" variant="line">
              すべてのお知らせ
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
