import type { ReactNode } from "react";

/**
 * 本文中のキーフレーズにマーカー（--color-marker）。1 セクション 2〜3 箇所まで（CLAUDE.md §4-1）。
 * @example <p>私たちは<Marker>素の自分</Marker>を引き出します。</p>
 */
export default function Marker({ children }: { children: ReactNode }) {
  return <span className="marker is-active text-fg">{children}</span>;
}
