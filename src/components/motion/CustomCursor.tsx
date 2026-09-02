"use client";
import { useEffect, useRef } from "react";

const HOVER_TARGETS = ".work-row, #service-track > li";

/**
 * ポインタに追従する円カーソル。(hover:hover) and (pointer:fine) の環境だけ動き、WORKS の行と SERVICE カード上で開く。
 * 起動している間だけ html[data-cursor] を立て、CSS 側の cursor:none をその配下に限定する。
 * @example <CustomCursor />（layout.tsx）
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 実際に起動したときだけ印を付ける。globals.css の cursor:none はこの属性を条件にしているので、
    // JS 無効・ハイドレーション失敗のときにネイティブカーソルが消えたままにならない
    document.documentElement.setAttribute("data-cursor", "");
    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onOver = (e: PointerEvent) => el.toggleAttribute("data-on", !!(e.target as Element).closest(HOVER_TARGETS));
    // ウィンドウの外へ出たら開いた状態を残さない（pointerover/out は画面端では発火しないことがある）
    const onOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) el.removeAttribute("data-on");
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    return () => {
      document.documentElement.removeAttribute("data-cursor");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} id="cur" aria-hidden className="cur">
      <span className="cur-t">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <path d="M3 13 13 3M6 3h7v7" />
        </svg>
      </span>
    </div>
  );
}
