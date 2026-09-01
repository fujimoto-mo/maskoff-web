"use client";
import { useEffect, useRef } from "react";
import { strokeSchedule } from "@/components/motion/handwriting-timing";
import { HANDWRITING } from "@/content/vision-handwriting";

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const dispatchWritten = () => document.dispatchEvent(new CustomEvent("vision:written"));

/**
 * 手書き見出し。画面下 25% に入ったら各線を書き順どおりに描く（stroke-dashoffset 1→0）。
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
      paths.forEach((p) => p.style.setProperty("stroke-dashoffset", "0"));
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
          p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: timings[i].duration, delay: timings[i].delay, easing: EASE, fill: "forwards" }),
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
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {HANDWRITING.strokes.map((s, i) => (
        <path key={i} className="write-stroke" d={s.d} pathLength={1} strokeWidth={s.width} />
      ))}
    </svg>
  );
}
