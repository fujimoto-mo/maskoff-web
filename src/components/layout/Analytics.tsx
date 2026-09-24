"use client";
import { useEffect } from "react";
import { SITE } from "@/lib/site";

type GtagWindow = Window & { dataLayer?: unknown[] };

/**
 * GA4（gtag.js）。SITE.ga4MeasurementId が空なら何もしない。本番ホスト（SITE.url のホスト）以外
 * （プレビュー *.pages.dev / localhost）では読み込まず、計測を汚さない。
 * LCP / INP を守るため、load 後のアイドル時に script を差し込む（HTML にはタグを出さない）。
 * @example <Analytics />  ← layout.tsx の body 末尾
 */
export default function Analytics() {
  useEffect(() => {
    const id = SITE.ga4MeasurementId;
    if (!id) return;
    let host: string;
    try {
      host = new URL(SITE.url).hostname;
    } catch {
      return;
    }
    if (location.hostname !== host) return;
    const load = () => {
      const w = window as GtagWindow;
      const dataLayer = (w.dataLayer ??= []);
      // gtag.js は dataLayer に Arguments オブジェクトが積まれる前提で動くため、公式スニペットどおり arguments を渡す
      // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-unused-vars
      const gtag = function (..._args: unknown[]) { dataLayer.push(arguments); };
      gtag("js", new Date());
      gtag("config", id);
      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      s.async = true;
      document.head.appendChild(s);
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 1500));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
  }, []);
  return null;
}
