"use client";
import { useEffect, useRef } from "react";
import { strokeSchedule } from "@/components/motion/handwriting-timing";
import { HANDWRITING } from "@/content/vision-handwriting";

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const dispatchWritten = () => document.dispatchEvent(new CustomEvent("vision:written"));

/**
 * 手書き見出し。画面下 25% に入ったら 1 文字ずつ読み順に輪郭を描き（stroke-dashoffset 1→0）、続けて塗りを入れる（fill-opacity 0→1）。
 * 完了で vision:written を発火し、PC の本文フェードとマーカーがこれを待つ。
 * @example <Handwriting />
 */
export default function Handwriting() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".write-stroke"));
    const finish = () => {
      svg.dataset.revealKind = "write";
      svg.dataset.reveal = "in";
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paths.forEach((p) => {
        p.style.setProperty("stroke-dashoffset", "0");
        p.style.setProperty("fill-opacity", "1");
      });
      finish();
      dispatchWritten();
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done) return;
        done = true;
        io.disconnect();
        finish();
        const timings = strokeSchedule(paths.map((p) => p.getTotalLength()));
        const anims = paths.map((p, i) =>
          p.animate(
            [
              { strokeDashoffset: 1, fillOpacity: 0 },
              { strokeDashoffset: 0, fillOpacity: 0, offset: 0.7 },
              { strokeDashoffset: 0, fillOpacity: 1 },
            ],
            { duration: timings[i].duration, delay: timings[i].delay, easing: EASE, fill: "forwards" },
          ),
        );
        Promise.all(anims.map((a) => a.finished)).then(dispatchWritten, dispatchWritten);
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      data-reveal="write"
      role="img"
      aria-label={HANDWRITING.label}
      viewBox={HANDWRITING.viewBox}
      className="relative z-[1] mb-10 block h-auto w-full max-w-[560px] overflow-visible text-fg"
      fill="none"
      stroke="currentColor"
      strokeWidth={HANDWRITING.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {HANDWRITING.strokes.map((s, i) => (
        <path key={i} className="write-stroke" d={s.d} pathLength={1} strokeWidth={s.width} />
      ))}
    </svg>
  );
}
