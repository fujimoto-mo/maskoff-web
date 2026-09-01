"use client";
import { useEffect } from "react";
import { advance, clampFling, wrap, type RowState } from "@/components/motion/marquee-physics";
import { cellPopDelay } from "@/components/motion/reveal-delay";

type Row = { el: HTMLElement; track: HTMLElement; state: RowState };

/** 行の 1 周分（複製前の幅）と基準速度をレイアウトから測る。リサイズのたびに測り直す */
function measure(el: HTMLElement, track: HTMLElement): { half: number; v0: number } {
  const half = track.scrollWidth / 2;
  const duration = Number(el.dataset.duration || 60);
  return { half, v0: (el.hasAttribute("data-reverse") ? 1 : -1) * (half / duration) };
}

/**
 * マーキーを JS 駆動にする: ロゴセルを中央に揃え、kv:launch でセルを pop させて rAF で流し、ドラッグで動かせる。
 * リサイズ・画面回転では 1 周分（half）と基準速度・セル pop の遅延を測り直す（継ぎ目に空白が出ないように）。
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

    let launched = false; // kv:launch 前は静止（幕のロゴが着地位置を計測できるように）

    const rows: Row[] = Array.from(root.querySelectorAll<HTMLElement>("[data-row]")).map((rowEl) => {
      const track = rowEl.querySelector<HTMLElement>(".mq-track")!;
      const { half, v0 } = measure(rowEl, track);
      return { el: rowEl, track, state: { x: rowEl.hasAttribute("data-reverse") ? -half : 0, v: v0, v0, half } };
    });
    const apply = () => rows.forEach((r) => (r.track.style.transform = `translate3d(${r.state.x}px, 0, 0)`));

    // セル pop の遅延は画面中央からの距離で決める。pop 済み（launched）なら 0 にして再 pop させない
    const setDelays = () => {
      const center = root.clientWidth / 2;
      rows.forEach((r) => {
        const cells = Array.from(r.track.querySelectorAll<HTMLElement>("[data-cell]"));
        const w = cells[0]?.offsetWidth || 1;
        cells.forEach((c) => c.style.setProperty("--ed", launched ? "0ms" : `${cellPopDelay(c.offsetLeft + c.offsetWidth / 2 + r.state.x - center, w)}ms`));
      });
    };

    // ロゴセルを画面中央へ
    const lead = root.querySelector<HTMLElement>("[data-lead]");
    const leadRow = rows.find((r) => r.track.contains(lead));
    if (lead && leadRow) leadRow.state.x = wrap(root.clientWidth / 2 - (lead.offsetLeft + lead.offsetWidth / 2), leadRow.state.half);
    setDelays();
    root.setAttribute("data-js", "");
    apply();

    // リサイズ・画面回転で 1 周分が変わる。測り直さないと周期がずれて継ぎ目に空白が流れる
    const relayout = () => {
      for (const r of rows) {
        const { half, v0 } = measure(r.el, r.track);
        if (half <= 0) continue;
        r.state = { ...r.state, half, v0, x: wrap(r.state.x, half) };
      }
      setDelays();
      apply();
    };
    let roRaf = 0;
    let roFirst = true; // observe 直後の初回通知は初期計測と同じなので捨てる
    const ro = new ResizeObserver(() => {
      if (roFirst) {
        roFirst = false;
        return;
      }
      if (roRaf) return;
      roRaf = requestAnimationFrame(() => {
        roRaf = 0;
        relayout();
      });
    });
    ro.observe(root);

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
      if (launched && !raf) {
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

    // ドラッグ: 触れた行は指に追従、逆方向の行は反対側へ動く（参考サイトと同じ）。離したら慣性 → 各行の基準速度へ
    let lastX = 0;
    let lastT = 0;
    let vInst = 0;
    let dragSign = 1; // 触れた行の進行方向（v0 の符号）
    const rel = (r: Row) => Math.sign(r.state.v0) * dragSign || 1;
    root.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button !== 0) return;
        const target = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-row]") : null;
        const hit =
          rows.find((r) => r.el === target) ??
          rows.reduce<Row | undefined>((best, r) => {
            const b = r.el.getBoundingClientRect();
            const d = Math.abs(e.clientY - (b.top + b.height / 2));
            const bd = best ? Math.abs(e.clientY - (best.el.getBoundingClientRect().top + best.el.getBoundingClientRect().height / 2)) : Infinity;
            return d < bd ? r : best;
          }, undefined);
        dragSign = Math.sign(hit?.state.v0 ?? 1) || 1;
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
        rows.forEach((r) => (r.state = { ...r.state, x: wrap(r.state.x + dx * rel(r), r.state.half) }));
        apply();
      },
      { signal, passive: true },
    );
    const release = () => {
      if (!dragging) return;
      dragging = false;
      root.removeAttribute("data-dragging");
      const fling = clampFling(vInst);
      rows.forEach((r) => (r.state = { ...r.state, v: fling * rel(r) }));
      run();
    };
    root.addEventListener("pointerup", release, { signal });
    root.addEventListener("pointercancel", release, { signal });

    const launch = () => {
      launched = true;
      root.setAttribute("data-go", "");
      run();
    };
    if (document.documentElement.hasAttribute("data-intro")) document.addEventListener("kv:launch", launch, { once: true, signal });
    else launch();

    return () => {
      controller.abort();
      io.disconnect();
      ro.disconnect();
      if (roRaf) cancelAnimationFrame(roRaf);
      if (raf) cancelAnimationFrame(raf);
      root.removeAttribute("data-js");
      root.removeAttribute("data-go");
      rows.forEach((r) => r.track.style.removeProperty("transform"));
    };
  }, []);
  return null;
}
