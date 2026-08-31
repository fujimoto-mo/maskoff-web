import Link from "next/link";
import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import { NAV, SITE } from "@/lib/site";

/** 全ページ共通ヘッダー。ナビはサイト共通（HOME 内アンカーではない）。 */
export default function Header() {
  return (
    <header className="wrap sticky top-0 z-50 flex h-header-h items-center gap-7 bg-bg">
      <Link href="/" aria-label={`${SITE.name} ホーム`} className="font-display text-[20px] font-extrabold leading-none tracking-[-.04em] text-fg">
        MasKOFF
      </Link>
      <nav aria-label="メイン" className="ml-auto flex items-center gap-[22px] max-nav:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="text-nav text-fg transition-colors hover:text-fg-muted">
            {n.label}
          </Link>
        ))}
        <Button href="/contact/" dot>
          お問い合わせ
        </Button>
      </nav>
      <MobileNav />
    </header>
  );
}
