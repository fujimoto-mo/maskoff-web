import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <div>
          <div className="logo">MasK<span>OFF</span></div>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{SITE.tagline}</p>
        </div>
        <nav aria-label="フッター">
          <Link href="/">HOME</Link>
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <Link href="/privacy/">PRIVACY POLICY</Link>
        </nav>
      </div>
      <div className="sub">
        <span>{SITE.name}</span>
        <span>{SITE.address}</span>
        <a href={SITE.sns.instagram} target="_blank" rel="noopener">Instagram</a>
        <a href={SITE.sns.x} target="_blank" rel="noopener">X</a>
      </div>
      <p className="copy">© {SITE.nameEn}</p>
    </footer>
  );
}
