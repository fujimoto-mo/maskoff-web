"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** 現在の URL のクエリ（location.search）。SSR / ハイドレーション時は ""（静的エクスポート向け。setState を effect で呼ばずに済む） */
export function useSearch(): string {
  return useSyncExternalStore(subscribe, () => location.search, () => "");
}

/** ハイドレーション後だけ true（SSR とハイドレーション時は false なので表示差分で警告が出ない） */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
