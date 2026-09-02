"use client";
import { useEffect, useRef } from "react";
import { mergeLineRects } from "@/components/motion/marker-rects";

const ROTATIONS = [-0.7, 0.35, -0.4];
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const DRAW_MS = 850;
const LINE_STAGGER_MS = 150;
const SP_DELAY_MS = 520;
const PC_EXTRA_MS = 300;

/**
 * .marker-block 内の .marker-target を計測し、背後の層に蛍光ペンの線を置いて左から右へ描く。
 * トリガーは行（.vlt）が data-reveal="in" になった後: SP は 520ms 後、PC は 50ms + 行index × 70ms + 300ms 後。
 * リサイズと vision:written で再計測する。
 * @example <div className="marker-block relative" data-marker-block><MarkerLayer />…</div>
 */
export default function MarkerLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const block = layer?.closest<HTMLElement>("[data-marker-block]");
    if (!layer || !block) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = matchMedia("(max-width: 640px)").matches;
    const targets = Array.from(block.querySelectorAll<HTMLElement>(".marker-target"));
    const drawn = new Set<number>();
    const timers = new Set<number>();

    const build = () => {
      layer.replaceChildren();
      const b = block.getBoundingClientRect();
      targets.forEach((t, i) => {
        const cs = getComputedStyle(t);
        const em = parseFloat(cs.fontSize) || 14;
        const lh = parseFloat(cs.lineHeight) || em * 2;
        mergeLineRects(Array.from(t.getClientRects()), b, lh, em).forEach((box, k) => {
          const line = document.createElement("span");
          line.className = "marker-line";
          line.dataset.target = String(i);
          line.dataset.line = String(k);
          line.style.left = `${box.left}px`;
          line.style.top = `${box.top}px`;
          line.style.width = `${box.width}px`;
          line.style.height = `${box.height}px`;
          line.style.transform = `rotate(${ROTATIONS[(i + k) % ROTATIONS.length]}deg) scaleY(1.04)`;
          if (drawn.has(i)) line.style.clipPath = "inset(0px)";
          layer.appendChild(line);
        });
      });
    };

    const draw = (i: number) => {
      if (drawn.has(i)) return;
      drawn.add(i);
      // 帯が引かれた印。反転中の黒文字（html.js[data-on-vision] .marker-target[data-marked]）は
      // これが付いたものだけに効かせる（帯が無い経路で黒背景に黒文字にしないため）
      targets[i]?.setAttribute("data-marked", "");
      layer.querySelectorAll<HTMLElement>(`.marker-line[data-target="${i}"]`).forEach((line, k) => {
        if (reduce) {
          line.style.clipPath = "inset(0px)";
          return;
        }
        line.animate([{ clipPath: "inset(0px 100% 0px 0px)" }, { clipPath: "inset(0px 0px 0px 0px)" }], { duration: DRAW_MS, delay: k * LINE_STAGGER_MS, easing: EASE, fill: "forwards" });
      });
    };

    const scheduleFor = (lineEl: HTMLElement) => {
      const li = Number(lineEl.style.getPropertyValue("--li") || 0);
      const delay = reduce ? 0 : sp ? SP_DELAY_MS : 50 + li * 70 + PC_EXTRA_MS;
      targets.forEach((t, i) => {
        if (!lineEl.contains(t)) return;
        const id = window.setTimeout(() => draw(i), delay);
        timers.add(id);
      });
    };

    build();
    // すでに in の行（reduced-motion や遅いマウント）はすぐ描く
    block.querySelectorAll<HTMLElement>('.vlt[data-reveal="in"]').forEach(scheduleFor);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target as HTMLElement;
        if (el.classList.contains("vlt") && el.dataset.reveal === "in") scheduleFor(el);
      }
    });
    mo.observe(block, { attributes: true, attributeFilter: ["data-reveal"], subtree: true });

    let raf = 0;
    const rebuild = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        build();
      });
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(block);
    document.addEventListener("vision:written", rebuild);

    return () => {
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener("vision:written", rebuild);
      timers.forEach((id) => window.clearTimeout(id));
      targets.forEach((t) => t.removeAttribute("data-marked"));
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={layerRef} aria-hidden className="marker-block__layer pointer-events-none absolute inset-0 z-0" />;
}
