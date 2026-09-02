"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** ≤720px の右下固定バッジ。HOME では #contact が見えている間は消える。 */
export default function StickyCta() {
  const path = usePathname();
  const isHome = path === "/";
  const [hidden, setHidden] = useState(false);
  // isHome が変わった（＝クライアント遷移した）瞬間にレンダー中で hidden をリセットする。
  // useEffect 内で setState すると react-hooks/set-state-in-effect に抵触するため、
  // 「prop 変化に合わせて state を調整する」公式パターンで対応する。
  const [prevIsHome, setPrevIsHome] = useState(isHome);
  if (isHome !== prevIsHome) {
    setPrevIsHome(isHome);
    setHidden(false);
  }

  useEffect(() => {
    if (!isHome) return;
    const target = document.getElementById("contact");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.1 });
    io.observe(target);
    return () => io.disconnect();
  }, [isHome]);

  if (path.startsWith("/contact")) return null;

  return (
    <a
      href={isHome ? "#contact" : "/contact/"}
      className={cn(
        "sticky-cta fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-[60] hidden size-20 rounded-full transition-[opacity,transform] duration-300 max-nav:block",
        hidden && "pointer-events-none scale-90 opacity-0",
      )}
    >
      <span className="sr-only">お問い合わせへ</span>
      <svg viewBox="0 0 80 80" aria-hidden className="absolute inset-0 size-full">
        <circle cx="40" cy="40" r="40" className="fill-fg" />
        <path d="M40 31v18m-7-7 7 7 7-7" className="stroke-fg-invert" strokeWidth="2" fill="none" strokeLinecap="square" />
      </svg>
      <svg viewBox="0 0 80 80" aria-hidden className="sticky-ring absolute inset-0 size-full">
        <defs>
          <path id="cta-ring" d="M40,40 m-27,0 a27,27 0 1,1 54,0 a27,27 0 1,1 -54,0" />
        </defs>
        <text className="fill-fg-invert font-display text-[8.5px] font-bold tracking-[.18em]">
          <textPath href="#cta-ring">CONTACT US · お問い合わせ · </textPath>
        </text>
      </svg>
    </a>
  );
}
