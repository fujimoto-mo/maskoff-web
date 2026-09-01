"use client";
import { useEffect } from "react";
import { hexToRgb, isOn, mix, progress, THEME_VARS, type Rgb } from "@/components/motion/scroll-theme-math";

/**
 * target の位置に応じて <html> の --color-* を白系→黒系に補間する（ページ全体が反転する）。
 * scroll/resize → rAF で 1 回だけ計算。target が画面の ±1 画面外なら何もしない。
 * reduced-motion では補間せず 0.5 で瞬時に切り替える。
 * @example <ScrollTheme />（VisionBlock の section 内）
 */
export default function ScrollTheme({ target = "#vision" }: { target?: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cs = getComputedStyle(root);
    const light: Record<string, Rgb> = {};
    const dark: Record<string, Rgb> = {};
    for (const v of THEME_VARS) {
      light[v] = hexToRgb(cs.getPropertyValue(`--color-${v}`) || "#ffffff");
      dark[v] = hexToRgb(cs.getPropertyValue(`--color-dark-${v === "fg-invert" ? "bg" : v}`) || "#0a0a0a");
    }
    let raf = 0;
    let applied = false;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > 2 * vh) {
        if (applied) clear();
        return;
      }
      let t = progress(r.top, r.bottom, vh);
      if (reduce) t = isOn(t) ? 1 : 0;
      if (t === 0) {
        if (applied) clear();
        return;
      }
      applied = true;
      for (const v of THEME_VARS) root.style.setProperty(`--color-${v}`, mix(light[v], dark[v], t));
      root.toggleAttribute("data-on-vision", isOn(t));
    };
    const clear = () => {
      applied = false;
      for (const v of THEME_VARS) root.style.removeProperty(`--color-${v}`);
      root.removeAttribute("data-on-vision");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, [target]);
  return null;
}
