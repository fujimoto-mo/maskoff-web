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
 * PC ではホバーしたセルが 1.12 倍に拡大してカーソル方向へ最大 18px 寄り、ホバー中にマウスを動かすと行がその速度の
 * 15% で追従して止めると減衰する（参考サイトと同じ）。行は速度に比例して少し skew する。動画セルは launch 後に再生し画面外で止める。
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
    // 行の速度に比例して少し傾ける（参考サイト: 静止時 0.11°、速いほど大きく。上限 ±5°）
    const SKEW_PER_PXS = 0.0045;
    const SKEW_MAX = 5;
    const apply = () =>
      rows.forEach((r) => {
        const skew = Math.max(-SKEW_MAX, Math.min(SKEW_MAX, r.state.v * SKEW_PER_PXS));
        r.track.style.transform = `translate3d(${r.state.x}px, 0, 0) skewX(${skew.toFixed(3)}deg)`;
      });

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

    // ホバー: (hover:hover) and (pointer:fine) のとき、触れたセルを拡大しカーソルの方向へ寄せる（参考サイトと同じ）。
    // 値は rAF ループ内で lerp し、離れたセルは元の位置・大きさへ戻ってから変数を外す
    const hoverOk = matchMedia("(hover: hover) and (pointer: fine)").matches;
    type Hover = { el: HTMLElement; tx: number; ty: number; ts: number; cx: number; cy: number; cs: number };
    const HOVER_SCALE = 1.12;
    const HOVER_SHIFT = 18; // px。セル中心からの相対位置（−1..1）× SHIFT
    const HOVER_LERP = 0.18;
    let hov: Hover | null = null;
    const leaving: Hover[] = [];
    // ホバー中にマウスを動かすと（ボタンなし）、行がその速度の 15% で追従し、止めると基準速度へ減衰（参考サイトと同じ）
    const HOVER_FOLLOW = 0.15;
    const HOVER_VMAX = 600; // px/s
    let lastHoverX = 0;
    let lastHoverT = 0;
    const clearHoverVars = (h: Hover) => {
      h.el.style.removeProperty("--hx");
      h.el.style.removeProperty("--hy");
      h.el.style.removeProperty("--hs");
    };
    const dropHover = () => {
      if (!hov) return;
      hov.tx = 0;
      hov.ty = 0;
      hov.ts = 1;
      hov.el.removeAttribute("data-hover");
      leaving.push(hov);
      hov = null;
    };
    const tickHover = () => {
      const items = hov ? [hov, ...leaving] : leaving;
      for (const h of items) {
        h.cx += (h.tx - h.cx) * HOVER_LERP;
        h.cy += (h.ty - h.cy) * HOVER_LERP;
        h.cs += (h.ts - h.cs) * HOVER_LERP;
        h.el.style.setProperty("--hx", `${h.cx.toFixed(2)}px`);
        h.el.style.setProperty("--hy", `${h.cy.toFixed(2)}px`);
        h.el.style.setProperty("--hs", h.cs.toFixed(4));
      }
      for (let i = leaving.length - 1; i >= 0; i--) {
        const h = leaving[i];
        if (Math.abs(h.cx) < 0.05 && Math.abs(h.cy) < 0.05 && Math.abs(h.cs - 1) < 0.0005) {
          clearHoverVars(h);
          leaving.splice(i, 1);
        }
      }
    };

    // 動画セル: launch 後に再生し、画面外・非表示タブでは止める。React は SSR で muted を出さないため明示する
    const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video[data-mq-video]"));
    const playVideos = () => videos.forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
    const pauseVideos = () => videos.forEach((v) => v.pause());

    const loop = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!dragging) rows.forEach((r) => (r.state = advance(r.state, dt)));
      apply();
      tickHover();
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
        if (launched) (visible ? playVideos : pauseVideos)();
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) pauseVideos();
        else {
          run();
          if (launched && visible) playVideos();
        }
      },
      { signal },
    );

    if (hoverOk) {
      root.addEventListener(
        "pointerover",
        (e) => {
          if (dragging) return;
          const cell = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cell]") : null;
          if (cell === (hov?.el ?? null)) return;
          dropHover();
          if (cell) {
            const back = leaving.findIndex((h) => h.el === cell);
            const prev = back >= 0 ? leaving.splice(back, 1)[0] : undefined;
            hov = { el: cell, tx: 0, ty: 0, ts: HOVER_SCALE, cx: prev?.cx ?? 0, cy: prev?.cy ?? 0, cs: prev?.cs ?? 1 };
            cell.setAttribute("data-hover", "");
          }
          run();
        },
        { signal },
      );
      root.addEventListener(
        "pointerleave",
        () => {
          dropHover();
          lastHoverT = 0;
          run();
        },
        { signal },
      );
    }

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
        dropHover();
        lastHoverT = 0;
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
        if (hov && !dragging) {
          const b = hov.el.getBoundingClientRect();
          hov.tx = Math.max(-1, Math.min(1, (e.clientX - (b.left + b.width / 2)) / (b.width / 2))) * HOVER_SHIFT;
          hov.ty = Math.max(-1, Math.min(1, (e.clientY - (b.top + b.height / 2)) / (b.height / 2))) * HOVER_SHIFT;
        }
        if (!dragging && hoverOk && launched) {
          const now = performance.now();
          if (lastHoverT) {
            const dt = Math.max(1, now - lastHoverT) / 1000;
            const boost = Math.max(-HOVER_VMAX, Math.min(HOVER_VMAX, ((e.clientX - lastHoverX) / dt) * HOVER_FOLLOW));
            // 通常行はマウスと同じ向き、逆方向行（data-reverse）は反対へ。advance() が基準速度へ減衰させる
            rows.forEach((r) => (r.state = { ...r.state, v: r.state.v0 + boost * (r.el.hasAttribute("data-reverse") ? -1 : 1) }));
            run();
          }
          lastHoverX = e.clientX;
          lastHoverT = now;
        }
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
      if (visible) playVideos();
    };
    if (document.documentElement.hasAttribute("data-intro")) document.addEventListener("kv:launch", launch, { once: true, signal });
    else launch();

    return () => {
      controller.abort();
      io.disconnect();
      ro.disconnect();
      if (roRaf) cancelAnimationFrame(roRaf);
      if (raf) cancelAnimationFrame(raf);
      pauseVideos();
      if (hov) clearHoverVars(hov);
      leaving.forEach(clearHoverVars);
      root.removeAttribute("data-js");
      root.removeAttribute("data-go");
      rows.forEach((r) => r.track.style.removeProperty("transform"));
    };
  }, []);
  return null;
}
