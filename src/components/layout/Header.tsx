import Link from "next/link";
import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import { NAV, SITE } from "@/lib/site";

/** 全ページ共通ヘッダー。ナビはサイト共通（HOME 内アンカーではない）。 */
export default function Header() {
  return (
    <header className="wrap sticky top-0 z-50 flex h-header-h items-center gap-7">
      <Link href="/" aria-label={`${SITE.name} ホーム`} className="font-display text-[20px] font-extrabold leading-none tracking-[-.04em] text-fg">
        MasKOFF
      </Link>
      <nav aria-label="メイン" className="ml-auto flex items-center gap-[22px] max-nav:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="nav-roll text-nav text-fg">
            <span className="rl-t">{n.label}</span>
            {/* ロール後の文字。::after の生成コンテンツだとアクセシブルネームが二重になるため実 DOM で重ねる */}
            <span className="rl-b" aria-hidden>
              {n.label}
            </span>
          </Link>
        ))}
        <Button href="/contact/" variant="liquid">
          お問い合わせ
        </Button>
      </nav>
      <MobileNav />
    </header>
  );
}
