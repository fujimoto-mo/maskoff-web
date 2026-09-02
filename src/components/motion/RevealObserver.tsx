"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Kind = "head" | "para" | "line" | "diagram" | "blur" | "up";
/** 手書き完了（vision:written）が来なくても、交差からこの時間で para を解放する */
const PARA_RELEASE_MS = 2500;
const OPTIONS: Record<Kind, IntersectionObserverInit> = {
  head: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  para: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  line: { rootMargin: "0px 0px -25% 0px", threshold: 0 },
  diagram: { rootMargin: "0px 0px -20% 0px", threshold: 0.3 },
  blur: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  up: { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
};

/** 要素を「出現済み」にする。元の種別は data-reveal-kind に退避。段落は配下の行も一緒に */
export function markRevealed(el: HTMLElement): void {
  const kind = el.dataset.reveal;
  if (!kind || kind === "in") return;
  el.dataset.revealKind = kind;
  el.dataset.reveal = "in";
  if (kind === "para") el.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach(markRevealed);
}

/**
 * ページに 1 つ。[data-reveal] を IntersectionObserver で監視し、入ったら data-reveal="in" にする。
 * - html[data-intro] があれば kv:launch を待ってから監視を始める
 * - para は vision:written 以降にしか in にしない（PC）。ただし交差から 2.5s で解放する。SP(≤640) では para を監視せず line を監視する
 * - write は Handwriting が自前で扱う
 * - reduced-motion なら全部即 in
 * - layout に常駐するのでクライアント遷移では再マウントされない。pathname を依存にして
 *   ルートごとに監視・ゲート・リスナーを作り直す（作り直さないと遷移先が永久に隠れたままになる）
 * @example <RevealObserver />（layout.tsx）
 */
export default function RevealObserver() {
  const path = usePathname();

  useEffect(() => {
    if (path === null) return; // ルートが決まってから組み立てる
    const stopActive = initActiveRows();
    (window as Window & { __revealReady?: boolean }).__revealReady = true;
    // 安全弁が発動済み（js クラスが外れている）なら、隠し状態も演出も使わずそのまま表示
    if (!document.documentElement.classList.contains("js")) return stopActive;

    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = matchMedia("(max-width: 640px)").matches;
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el.dataset.reveal !== "in");

    if (reduce) {
      pending().forEach(markRevealed);
      return stopActive;
    }

    const observers: IntersectionObserver[] = [];
    // 手書き（data-reveal="write"）が無いページでは待たない
    let written = !document.querySelector('[data-reveal="write"]');
    const waitingParas = new Set<HTMLElement>();
    const paraTimers = new Set<number>();
    const onWritten = () => {
      written = true;
      waitingParas.forEach(markRevealed);
      waitingParas.clear();
    };
    document.addEventListener("vision:written", onWritten);

    const start = () => {
      const groups = new Map<Kind, HTMLElement[]>();
      for (const el of pending()) {
        const kind = el.dataset.reveal as Kind | "write";
        if (kind === "write") continue;
        if (kind === "line" && !sp) continue;
        if (kind === "para" && sp) continue;
        if (!(kind in OPTIONS)) continue;
        const list = groups.get(kind) ?? [];
        list.push(el);
        groups.set(kind, list);
      }
      for (const [kind, els] of groups) {
        const io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io.unobserve(el);
            if (kind === "para" && !written) {
              waitingParas.add(el);
              // 手書きが完了しない（描画に失敗した・SVG が無い等）ときも段落が永久に隠れないよう解放する
              paraTimers.add(
                window.setTimeout(() => {
                  waitingParas.delete(el);
                  markRevealed(el);
                }, PARA_RELEASE_MS),
              );
              continue;
            }
            markRevealed(el);
          }
        }, OPTIONS[kind]);
        els.forEach((el) => io.observe(el));
        observers.push(io);
      }
    };

    if (root.hasAttribute("data-intro")) document.addEventListener("kv:launch", start, { once: true });
    else start();

    return () => {
      observers.forEach((io) => io.disconnect());
      paraTimers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("vision:written", onWritten);
      document.removeEventListener("kv:launch", start);
      stopActive();
    };
  }, [path]);
  return null;
}

/** ≤820 またはタッチ主体: 画面中央の [data-activate] 行を data-active にし、親に data-live を付ける。タップで中央へ / active ならリンク */
export function initActiveRows(): () => void {
  if (!matchMedia("(max-width: 820px), (hover: none)").matches) return () => {}; // SP + タッチ主体（iPad 横）
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-activate]"));
  if (rows.length === 0) return () => {};
  const list = rows[0].parentElement;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        rows.forEach((r) => r.removeAttribute("data-active"));
        (e.target as HTMLElement).setAttribute("data-active", "");
        list?.setAttribute("data-live", "");
      }
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
  );
  rows.forEach((r) => io.observe(r));
  const onClick = (ev: Event) => {
    const row = (ev.target as HTMLElement).closest<HTMLElement>("[data-activate]");
    if (!row || (ev.target as HTMLElement).closest("a")) return;
    if (!row.hasAttribute("data-active")) row.scrollIntoView({ block: "center", behavior: "smooth" });
    else if (row.dataset.url) window.open(row.dataset.url, "_blank", "noopener");
  };
  list?.addEventListener("click", onClick);
  return () => {
    io.disconnect();
    list?.removeEventListener("click", onClick);
  };
}
