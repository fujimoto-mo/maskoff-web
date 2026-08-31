"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, HOME_ANCHORS, SITE } from "@/lib/site";

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = path === "/";

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const items = isHome ? HOME_ANCHORS : NAV;

  return (
    <>
      <header className="header wrap">
        <Link href="/" className="logo" aria-label={SITE.name}>MasK<span>OFF</span></Link>
        <nav className="pc" aria-label="メイン">
          {items.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>
          ))}
          {isHome && <Link href="/recruit/">RECRUIT</Link>}
        </nav>
        <Link href={isHome ? "#contact" : "/contact/"} className="btn btn-accent btn-sm cta">お問い合わせ</Link>
        <button className="burger" aria-label="メニュー" aria-expanded={open} aria-controls="drawer" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </header>
      <div id="drawer" className="drawer" data-open={open}>
        <Link href="/"><small>ホーム</small>HOME</Link>
        {NAV.map((n) => <Link key={n.href} href={n.href}><small>{n.ja}</small>{n.label}</Link>)}
        <div className="sns">
          <a href={SITE.sns.instagram} target="_blank" rel="noopener">INSTAGRAM</a>
          <a href={SITE.sns.x} target="_blank" rel="noopener">X</a>
        </div>
      </div>
    </>
  );
}
