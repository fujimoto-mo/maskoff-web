"use client";
import { useEffect } from "react";
import { advance, clampFling, wrap, type RowState } from "@/components/motion/marquee-physics";
import { cellPopDelay } from "@/components/motion/reveal-delay";

type Row = { track: HTMLElement; state: RowState };

/**
 * マーキーを JS 駆動にする: ロゴセルを中央に揃え、kv:launch でセルを pop させて rAF で流し、ドラッグで動かせる。
 * reduced-motion では何もしない（CSS 側で静止）。
 * @example <Marquee rows={ROWS} /><MarqueeDrag />
 */
export default function MarqueeDrag() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>("[data-marquee]");
    if (!root) return;
    const controller = new AbortController();
    const { signal } = controller;

    const rows: Row[] = Array.from(root.querySelectorAll<HTMLElement>("[data-row]")).map((rowEl) => {
      const track = rowEl.querySelector<HTMLElement>(".mq-track")!;
      const half = track.scrollWidth / 2;
      const duration = Number(rowEl.dataset.duration || 60);
      const v0 = (rowEl.hasAttribute("data-reverse") ? 1 : -1) * (half / duration);
      return { track, state: { x: rowEl.hasAttribute("data-reverse") ? -half : 0, v: v0, v0, half } };
    });
    const apply = () => rows.forEach((r) => (r.track.style.transform = `translate3d(${r.state.x}px, 0, 0)`));

    // ロゴセルを画面中央へ。セル pop の遅延は中央からの距離で決める
    const lead = root.querySelector<HTMLElement>("[data-lead]");
    const leadRow = rows.find((r) => r.track.contains(lead));
    const center = root.clientWidth / 2;
    if (lead && leadRow) leadRow.state.x = wrap(center - (lead.offsetLeft + lead.offsetWidth / 2), leadRow.state.half);
    rows.forEach((r) => {
      const cells = Array.from(r.track.querySelectorAll<HTMLElement>("[data-cell]"));
      const w = cells[0]?.offsetWidth || 1;
      cells.forEach((c) => c.style.setProperty("--ed", `${cellPopDelay(c.offsetLeft + c.offsetWidth / 2 + r.state.x - center, w)}ms`));
    });
    root.setAttribute("data-js", "");
    apply();

    // rAF ループ。画面外・非表示タブでは止める
    let raf = 0;
    let last = 0;
    let visible = true;
    let dragging = false;
    const loop = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!dragging) rows.forEach((r) => (r.state = advance(r.state, dt)));
      apply();
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const run = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(
      (e) => {
        visible = e[0].isIntersecting;
        if (visible) run();
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", () => !document.hidden && run(), { signal });

    // ドラッグ: 全行を指に追従させ、離したら慣性 → 基準速度へ
    let lastX = 0;
    let lastT = 0;
    let vInst = 0;
    root.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        dragging = true;
        lastX = e.clientX;
        lastT = performance.now();
        vInst = 0;
        root.setAttribute("data-dragging", "");
        root.setPointerCapture(e.pointerId);
      },
      { signal },
    );
    root.addEventListener(
      "pointermove",
      (e) => {
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max(1, now - lastT) / 1000;
        vInst = dx / dt;
        lastX = e.clientX;
        lastT = now;
        rows.forEach((r) => (r.state = { ...r.state, x: wrap(r.state.x + dx, r.state.half) }));
        apply();
      },
      { signal, passive: true },
    );
    const release = () => {
      if (!dragging) return;
      dragging = false;
      root.removeAttribute("data-dragging");
      const fling = clampFling(vInst);
      rows.forEach((r) => (r.state = { ...r.state, v: fling }));
      run();
    };
    root.addEventListener("pointerup", release, { signal });
    root.addEventListener("pointercancel", release, { signal });

    const launch = () => {
      root.setAttribute("data-go", "");
      run();
    };
    if (document.documentElement.hasAttribute("data-intro")) document.addEventListener("kv:launch", launch, { once: true, signal });
    else launch();

    return () => {
      controller.abort();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      root.removeAttribute("data-js");
      root.removeAttribute("data-go");
      rows.forEach((r) => r.track.style.removeProperty("transform"));
    };
  }, []);
  return null;
}
