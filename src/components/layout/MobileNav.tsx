"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { NAV, SUB_NAV, SITE } from "@/lib/site";

/** ≤720px のハンバーガー + 全画面オーバーレイ。Header から呼ぶ。 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = `mobile-menu-${useId()}`;
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.setAttribute("data-menu-open", "");
      firstLink.current?.focus();
    } else {
      root.removeAttribute("data-menu-open");
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.removeAttribute("data-menu-open");
    };
  }, [open]);

  const bar = "absolute inset-x-[9px] h-[1.5px] bg-fg";
  return (
    <div className="ml-auto hidden max-nav:block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[100] -mr-2 size-10"
      >
        <span aria-hidden className={cn(bar, "transition-transform duration-300", open ? "top-[19px] rotate-45" : "top-[13px]")} />
        <span aria-hidden className={cn(bar, "top-[19px] transition-opacity duration-200", open && "opacity-0")} />
        <span aria-hidden className={cn(bar, "transition-transform duration-300", open ? "top-[19px] -rotate-45" : "top-[25px]")} />
      </button>

      <div id={panelId} role="dialog" aria-modal="true" aria-label="メニュー" hidden={!open} className="fixed inset-0 z-[95] bg-bg/92 backdrop-blur-[10px]">
        <nav aria-label="メイン（モバイル）" className="absolute inset-x-6 top-[calc(var(--spacing-header-h)+40px)] flex flex-col items-start gap-[18px]">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              ref={i === 0 ? firstLink : undefined}
              href={n.href}
              onClick={() => setOpen(false)}
              className="font-display text-[min(11.5vw,54px)] font-semibold leading-[1.05] tracking-[-.04em] text-fg"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-5 text-caption text-fg-muted">
            {SUB_NAV.map((s) => (
              <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>
                {s.label}
              </Link>
            ))}
          </div>
          <Button href="/contact/" dot className="mt-4 w-full py-[22px] text-[18px]">
            お問い合わせ
          </Button>
          <div className="mt-6 flex gap-6 text-caption font-medium tracking-[.06em] text-fg-muted">
            <a href={SITE.sns.instagram} target="_blank" rel="noopener">INSTAGRAM ↗</a>
            <a href={SITE.sns.x} target="_blank" rel="noopener">X ↗</a>
          </div>
        </nav>
      </div>
    </div>
  );
}
