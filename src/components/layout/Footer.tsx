import Link from "next/link";
import { NAV, SUB_NAV, SITE } from "@/lib/site";

/** dipsy 同様の最小フッター。SP は追従バッジ分の下余白を取る */
export default function Footer() {
  const links = [...NAV.map((n) => ({ href: n.href, label: n.label })), ...SUB_NAV.map((s) => ({ href: s.href, label: s.label }))];
  return (
    <footer className="wrap pt-8 pb-7 text-caption text-fg-muted max-nav:pb-16">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div>
          <p className="font-display text-[16px] font-extrabold tracking-[-.04em] text-fg">MasKOFF</p>
          <p className="mt-1">{SITE.name}</p>
          <p>{SITE.address}</p>
        </div>
        <nav aria-label="フッター" className="flex flex-wrap gap-x-5 gap-y-2 max-sp:grid max-sp:grid-cols-2">
          {links.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-7 font-display tracking-[.06em]">© {SITE.name}</p>
    </footer>
  );
}
