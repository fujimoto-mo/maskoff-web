"use client";
import { useState, type PointerEvent, type ReactNode } from "react";

/**
 * タッチ端末でのホバー代替。マウス以外のポインタ（指・ペン）でタップするたびに data-on を付け外しする。
 * 中身は Tailwind の group-hover（マウス）と group-data-on（タッチ）で出し分ける。
 * 切り替えは pointerup で行う: 指を置いたままスクロールを始めるとブラウザが pointercancel を出して
 * pointerup が来ないので、スクロールの起点にしただけでは切り替わらない。
 * マウスは onPointerUp を無視し、CSS の :hover に任せる（クリックで hover 中に消えるのを防ぐ）。
 * @example
 * <TouchToggle className="group relative h-[400px]">
 *   <Picture … />
 *   <Picture … className="absolute inset-0 opacity-0 group-hover:opacity-100 group-data-on:opacity-100" />
 * </TouchToggle>
 */
export default function TouchToggle({ className, children }: { className?: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    setOn((v) => !v);
  };
  return (
    <div className={className} data-on={on || undefined} onPointerUp={onPointerUp}>
      {children}
    </div>
  );
}
