import Link from "next/link";
import { fmtDate, type News, type Category } from "@/lib/cms";

export function NewsList({ items, categories, current }: { items: News[]; categories: Category[]; current?: string }) {
  return (
    <>
      <nav className="cat-nav" aria-label="カテゴリ">
        <Link href="/news/" aria-current={!current ? "page" : undefined}>すべて</Link>
        {categories.map((c) => <Link key={c.slug} href={`/news/category/${c.slug}/`} aria-current={current === c.slug ? "page" : undefined}>{c.name}</Link>)}
      </nav>
      {items.length === 0 ? <p className="muted">このカテゴリの記事はまだありません。</p> : (
        <ul className="list">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={`/news/${n.id}/`} className="list-row">
                <time dateTime={n.publishedAt}>{fmtDate(n.publishedAt)}</time>
                <span className="cat">{n.category?.name}</span>
                <span className="title">{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
