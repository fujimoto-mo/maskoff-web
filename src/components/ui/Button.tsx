import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "liquid" | "block";
type Size = "sm" | "md" | "lg";
type Props = {
  href?: string;
  type?: "button" | "submit";
  /** liquid（既定）: 黒のピル。hover で白点が広がって赤に塗り替わり、矢印が出る（サイト内のリンク型ボタンはすべてこれ）/ block: フォーム送信用の幅いっぱいの角丸ボタン */
  variant?: Variant;
  /** liquid のみ。sm: ヘッダー・本文内のリンク（既定）/ md: ページ末尾の CTA 帯・RECRUIT の ENTRY / lg: SP メニューの RECRUIT。白点・矢印の寸法は globals.css の .cta-liquid-* */
  size?: Size;
  disabled?: boolean;
  className?: string;
  /** 例: モバイルメニューを閉じる。リンク・ボタンのどちらにも付く */
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
};

const BASE = "inline-flex items-center justify-center gap-2 font-bold tracking-[.02em] disabled:cursor-not-allowed disabled:opacity-35";
const VARIANTS: Record<Variant, string> = {
  // bg-fg utility はここでは使わない: utilities レイヤーは components レイヤーの .cta-liquid:hover より
  // 常に優先されてしまい、hover で背景色が変わらなくなる（globals.css 側で背景色を持たせる）。
  liquid: "cta-liquid relative overflow-hidden rounded-pill text-fg-invert",
  // transition-opacity / hover:opacity は utilities レイヤーなので、components レイヤーの
  // .cta-liquid の transition・background-color に勝ってしまう。liquid には持たせず block だけに付ける。
  block: "transition-opacity hover:opacity-[.88] w-full rounded-btn bg-fg px-[34px] py-[18px] text-[16px] text-fg-invert max-tab:text-[14px]",
};
/** liquid の寸法（padding-left は .cta-liquid の --cl-dot-x、padding-right は矢印の余白と対応） */
const LIQUID_SIZE: Record<Size, string> = {
  sm: "py-2.5 pl-[18px] pr-[34px] text-[13px]",
  md: "cta-liquid-md py-3.5 pl-[26px] pr-[46px] text-[14px]",
  lg: "cta-liquid-lg py-[22px] pl-7 pr-14 text-[18px]",
};

/**
 * @example <Button href="/recruit/" variant="liquid">RECRUIT</Button>  ← ヘッダー CTA
 * @example <Button href="/contact/" variant="liquid" size="md">CONTACT</Button>  ← ページ末尾の CTA 帯
 * @example <Button type="submit" variant="block" disabled={busy}>送信する</Button>
 */
export default function Button({ href, type = "button", variant = "liquid", size = "sm", disabled, className, onClick, children }: Props) {
  const cls = cn(BASE, VARIANTS[variant], variant === "liquid" && LIQUID_SIZE[size], className);
  const inner =
    variant === "liquid" ? (
      <>
        <span aria-hidden className="cl-fill" />
        <span className="cl-txt">
          <span className="cl-lab cl-cur">{children}</span>
          <span className="cl-lab cl-nxt" aria-hidden>
            {children}
          </span>
        </span>
        <svg aria-hidden className="cl-arw" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
          <path d="M3 13 13 3M6 3h7v7" />
        </svg>
      </>
    ) : (
      children
    );
  if (href) {
    if (href.startsWith("http")) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener" onClick={onClick}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {inner}
    </button>
  );
}
