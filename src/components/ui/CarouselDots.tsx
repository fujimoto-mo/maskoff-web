"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** scroll-snap のトラック要素の id。子要素 1 つ = 1 スライド */
  trackId: string;
  count: number;
  /** aria-label 用。例 "事業カード" */
  label: string;
};

/**
 * SP カルーセルのドット。IntersectionObserver で現在位置を追い、クリックでスナップ移動する。
 * ≥601px では非表示（グリッド表示のため）。
 * @example <ul id="service-track" className="max-sp:carousel">…</ul><CarouselDots trackId="service-track" count={6} label="事業カード" />
 */
export default function CarouselDots({ trackId, count, label }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = document.getElementById(trackId);
    if (!track) return;
    const items = Array.from(track.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(items.indexOf(e.target));
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [trackId]);

  const go = (i: number) => {
    document.getElementById(trackId)?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div role="tablist" aria-label={label} className="mt-6 hidden justify-center gap-2 max-sp:flex">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${i + 1}枚目`}
          onClick={() => go(i)}
          className={cn("size-2 rounded-full transition-colors", i === active ? "bg-fg" : "bg-border")}
        />
      ))}
    </div>
  );
}
