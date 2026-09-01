"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Picture from "@/components/ui/Picture";

const SHOW_MS_PC = 900;
const SHOW_MS_SP = 1100;
const FLY_MS = 500;
const FLY_EASE = "cubic-bezier(0.65, 0, 0.35, 1)"; // 幕の収縮とロゴの移動を同じ ease-in-out で同時に終える

/**
 * 初回表示のロゴ幕。黒幕の中央にロゴ（/images/logo-wordmark.png）を出し、900ms（SP 1100ms）後に
 * 黒い背景を clip-path でマーキーのロゴセル（[data-lead] [data-lead-box]）の矩形まで 0.5s で縮め（ロゴに集まる）、
 * 同時にロゴをその位置・大きさへ移動する（FLIP）。着地でロゴセルに data-boing を付け kv:launch を発火する。
 * HOME を開くたびに毎回表示（ブラウザに状態は持たない）。
 * reduced-motion / saveData / html.js 無しではスキップ（kv:launch は即発火）。表示中は html[data-intro]。
 * @example <IntroVeil />（page.tsx の先頭）
 */
export default function IntroVeil() {
  const [phase, setPhase] = useState<"show" | "done" | "gone">("show");
  const veilRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

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
    let t2 = 0;
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      document.querySelector("[data-lead]")?.setAttribute("data-boing", "");
      root.removeAttribute("data-intro");
      document.dispatchEvent(new CustomEvent("kv:launch"));
      setPhase("gone");
    };
    const t1 = window.setTimeout(() => {
      // 計測は setPhase("done") の DOM 反映前（show の見た目）に行う
      const veil = veilRef.current;
      const box = boxRef.current;
      const target = document.querySelector<HTMLElement>("[data-lead] [data-lead-box]");
      setPhase("done");
      if (veil && box && target) {
        const a = box.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const dx = b.left + b.width / 2 - (a.left + a.width / 2);
        const dy = b.top + b.height / 2 - (a.top + a.height / 2);
        const s = b.width / a.width;
        // 黒い背景をロゴセルの矩形（角丸 22%）まで縮めて「ロゴに集まる」ように見せる（参考サイトと同じ）
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        veil.animate(
          [
            { clipPath: "inset(0px 0px 0px 0px round 0px)" },
            { clipPath: `inset(${b.top}px ${vw - b.right}px ${vh - b.bottom}px ${b.left}px round ${b.width * 0.22}px)` },
          ],
          { duration: FLY_MS, easing: FLY_EASE, fill: "forwards" },
        );
        const anim = box.animate([{ transform: "none" }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], {
          duration: FLY_MS,
          easing: FLY_EASE,
          fill: "forwards",
        });
        anim.onfinish = land;
      }
      t2 = window.setTimeout(land, FLY_MS + 100); // WAAPI が使えない／finish が来ない場合の保険
    }, ms);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      root.removeAttribute("data-intro");
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div ref={veilRef} className="intro-veil fixed inset-0 z-[100] flex items-center justify-center" data-phase={phase} aria-hidden>
      {/* ロゴセルと同じ構成・同じ大きさ（.veil-logo の CSS でセル幅の 62%）。黒幕上では箱が見えず、着地の移動中に箱として現れる */}
      <div ref={boxRef} className="veil-logo flex flex-none items-center justify-center rounded-[22%] bg-fg">
        {/* p-[12%] は包含ブロック（画面幅）基準になるため、内側 76% の箱で余白を作る（ロゴセルと同比率） */}
        <Picture src="/images/logo-wordmark.png" alt="" sizes="(max-width: 600px) 30vw, 12vw" priority className="block size-[76%]" imgClassName="block size-full object-contain" />
      </div>
    </div>
  );
}
