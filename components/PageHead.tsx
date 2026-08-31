import Link from "next/link";

type Crumb = { href?: string; label: string };
export function PageHead({ en, ja, lead, crumbs }: { en: string; ja: string; lead?: string; crumbs?: Crumb[] }) {
  return (
    <>
      {crumbs && (
        <ol className="crumbs wrap" aria-label="現在位置">
          <li><Link href="/">HOME</Link></li>
          {crumbs.map((c, i) => <li key={i}>{c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}</li>)}
        </ol>
      )}
      <div className="page-head wrap">
        <h1>{en}</h1>
        <p className="ja">{ja}</p>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </>
  );
}
