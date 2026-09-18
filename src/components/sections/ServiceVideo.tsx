"use client";
import { useEffect, useRef, useState } from "react";

/**
 * SERVICE 詳細のプロダクト紹介に置く動画（ループ）。画面に入っている間だけ再生し、外れたら止める（hero の動画セルと同じ考え方）。
 * ブラウザの制約で自動再生は無音で始まり、右下の丸いボタンで音をオン / オフする（動画には音声トラックを残しておく）。
 * prefers-reduced-motion では自動再生せず、ポスターとブラウザ標準のコントロールを出す（音の切り替えもそちらに任せ、丸いボタンは motion-reduce:hidden で隠す）。JS 無効ではポスターのまま。
 * @example <ServiceVideo src="/videos/service/dothyphen.mp4" poster="/images/service/detail/dothyphen-movie.jpg" width={720} height={1280} label="DotHyphen のブランドムービー" />
 */
export default function ServiceVideo({ src, poster, width, height, label }: { src: string; poster: string; width: number; height: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };
  return (
    <div className="relative">
      <video
        ref={ref}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="block h-auto w-full"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "音声をオンにする" : "音声をオフにする"}
        aria-pressed={!muted}
        className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-fg/70 text-fg-invert backdrop-blur-sm transition-colors hover:bg-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-invert motion-reduce:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" />
          {muted ? <path d="m16 9.5 5 5m0-5-5 5" /> : <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />}
        </svg>
      </button>
    </div>
  );
}
