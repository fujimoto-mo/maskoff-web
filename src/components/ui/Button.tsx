import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "pill" | "block" | "line";
type Props = {
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  /** 左に白点（ヘッダー CTA） */
  dot?: boolean;
  children: ReactNode;
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold tracking-[.02em] transition-opacity hover:opacity-[.88] disabled:cursor-not-allowed disabled:opacity-35";
const VARIANTS: Record<Variant, string> = {
  pill: "rounded-pill bg-fg px-[22px] py-2.5 text-[13px] text-fg-invert",
  block: "w-full rounded-btn bg-fg px-[34px] py-[18px] text-[16px] text-fg-invert max-tab:text-[14px]",
  line: "rounded-pill border border-fg px-[22px] py-2.5 text-[13px] text-fg",
};

/**
 * @example <Button href="/contact/" dot>お問い合わせ</Button>
 * @example <Button type="submit" variant="block" disabled={busy}>送信する</Button>
 */
export default function Button({ href, type = "button", variant = "pill", disabled, className, dot = false, children }: Props) {
  const cls = cn(BASE, VARIANTS[variant], className);
  const inner = (
    <>
      {dot && <span aria-hidden className="size-2 rounded-full bg-current" />}
      {children}
    </>
  );
  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled}>
      {inner}
    </button>
  );
}
