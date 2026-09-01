"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Picture from "@/components/ui/Picture";

const LOGO_IN_MS_PC = 450; // ロゴ出現から幕の収縮開始まで
const LOGO_IN_MS_SP = 780;
const COLLAPSE_MS = 750; // 黒幕がロゴセルの箱へ縮む時間（参考サイト: clip-path .75s）
const COLLAPSE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const DONE_FADE_MS = 120; // 収縮後の幕フェード（参考サイト: opacity .12s）

/**
 * 初回表示のロゴ幕（参考サイトの intro-veil と同じ手順）。
 * 1. SSR で黒幕だけを出す（ロゴは非表示）。
 * 2. ハイドレーション後にマーキーのロゴセルの箱（[data-lead] [data-lead-box]）の位置・大きさを測り、
 *    同じ場所にロゴ箱を置いて 0.5s フェード + 12px 上昇で出す（data-logo-in）。ロゴは以後動かない。
 * 3. 450ms（≤640 は 780ms）後、黒幕を clip-path でその箱の矩形へ 0.75s かけて縮める（黒がロゴに集まる）。
 * 4. 収縮が終わったらロゴセルに data-boing、data-intro を外し kv:launch → 幕を 0.12s フェードしてアンマウント。
 * HOME を開くたびに毎回表示（ブラウザに状態は持たない）。reduced-motion / saveData / html.js 無しではスキップ。
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
      // setState を effect 本体で直接呼ばない（react-hooks/set-state-in-effect）
      queueMicrotask(() => {
        setPhase("gone");
        document.dispatchEvent(new CustomEvent("kv:launch"));
      });
      return;
    }
    root.setAttribute("data-intro", "");
    const veil = veilRef.current;
    const box = boxRef.current;
    const target = document.querySelector<HTMLElement>("[data-lead] [data-lead-box]");
    const timers: number[] = [];
    const rafs: number[] = [];
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      document.querySelector("[data-lead]")?.setAttribute("data-boing", "");
      root.removeAttribute("data-intro");
      document.dispatchEvent(new CustomEvent("kv:launch"));
      setPhase("done");
      timers.push(window.setTimeout(() => setPhase("gone"), DONE_FADE_MS + 30));
    };
    if (!veil || !box || !target) {
      // 参照先が無ければ幕を出さずに即進める
      timers.push(window.setTimeout(land, 0));
      return () => {
        timers.forEach(clearTimeout);
        root.removeAttribute("data-intro");
      };
    }
    const wait = matchMedia("(max-width: 640px)").matches ? LOGO_IN_MS_SP : LOGO_IN_MS_PC;
    const collapse = () => {
      const r = target.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const anim = veil.animate(
        [
          { clipPath: "inset(0px 0px 0px 0px round 0px)" },
          { clipPath: `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round ${r.width * 0.22}px)` },
        ],
        { duration: COLLAPSE_MS, easing: COLLAPSE_EASE, fill: "forwards" },
      );
      anim.onfinish = land;
      timers.push(window.setTimeout(land, COLLAPSE_MS + 100)); // WAAPI が使えない／finish が来ない場合の保険
    };
    // ロゴセルの中央寄せは MarqueeDrag の effect（この layout effect より後）で行われるため、
    // 計測は次フレームまで待つ。ロゴ箱をロゴセルの箱と同じ位置・大きさに置いてから出現させる
    rafs.push(
      window.requestAnimationFrame(() => {
        const b = target.getBoundingClientRect();
        box.style.left = `${b.left}px`;
        box.style.top = `${b.top}px`;
        box.style.width = `${b.width}px`;
        box.style.height = `${b.height}px`;
        rafs.push(window.requestAnimationFrame(() => veil.setAttribute("data-logo-in", "")));
        timers.push(window.setTimeout(collapse, wait));
      }),
    );
    return () => {
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
      root.removeAttribute("data-intro");
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div ref={veilRef} className="intro-veil fixed inset-0 z-[100]" data-phase={phase} aria-hidden>
      {/* ロゴセルと同じ構成（黒角丸 + 内側 76% のロゴ）。位置・大きさは effect でロゴセルの箱に合わせる */}
      <div ref={boxRef} className="veil-logo absolute flex items-center justify-center rounded-[22%] bg-fg">
        <Picture src="/images/logo-wordmark.png" alt="" sizes="(max-width: 600px) 30vw, 12vw" priority className="block size-[76%]" imgClassName="block size-full object-contain" />
      </div>
    </div>
  );
}
