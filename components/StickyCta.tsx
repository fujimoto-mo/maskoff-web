"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StickyCta() {
  const path = usePathname();
  if (path.startsWith("/contact")) return null;
  return (
    <div className="sticky-cta">
      <Link href={path === "/" ? "#contact" : "/contact/"} className="btn btn-accent">お問い合わせ・ご相談</Link>
    </div>
  );
}
