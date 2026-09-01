"use client";
import { useLayoutEffect, useState } from "react";
import Picture from "@/components/ui/Picture";

const SHOW_MS_PC = 1400;
const SHOW_MS_SP = 1600;
const FADE_MS = 300;

/**
 * 初回表示のロゴ幕。黒幕の中央にロゴ（/images/logo-wordmark.png）を出し、1400ms（SP 1600ms）後に
 * 0.3s でフェードアウトして kv:launch を発火する。HOME を開くたびに毎回表示（ブラウザに状態は持たない）。
 * reduced-motion / saveData / html.js 無しではスキップ（kv:launch は即発火）。表示中は html[data-intro]。
 * @example <IntroVeil />（page.tsx の先頭）
 */
export default function IntroVeil() {
  const [phase, setPhase] = useState<"show" | "done" | "gone">("show");

  useLayoutEffect(() => {
    const root = document.documentElement;
    const skip =
      !root.classList.contains("js") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (skip) {
      // setState を effect 本体で直接呼ばない（react-hooks/set-state-in-effect）。
      // マイクロタスクへ退避しても見た目の即時性は変わらない。
      queueMicrotask(() => {
        setPhase("gone");
        document.dispatchEvent(new CustomEvent("kv:launch"));
      });
      return;
    }
    root.setAttribute("data-intro", "");
    const ms = matchMedia("(max-width: 640px)").matches ? SHOW_MS_SP : SHOW_MS_PC;
    const t1 = window.setTimeout(() => {
      setPhase("done");
      document.querySelector("[data-lead]")?.setAttribute("data-boing", "");
      root.removeAttribute("data-intro");
      document.dispatchEvent(new CustomEvent("kv:launch"));
    }, ms);
    const t2 = window.setTimeout(() => setPhase("gone"), ms + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      root.removeAttribute("data-intro");
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className="intro-veil fixed inset-0 z-[100] flex items-center justify-center bg-bg-dark" data-phase={phase} aria-hidden>
      <Picture
        src="/images/logo-wordmark.png"
        alt=""
        sizes="(max-width: 600px) 200px, 260px"
        priority
        className="veil-logo block w-[260px] max-sp:w-[200px]"
        imgClassName="block size-full"
      />
    </div>
  );
}
