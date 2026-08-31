import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** 英字見出し。"OFFICIAL\nCREATORS" のように \n を入れると SP でだけ改行する */
  en: string;
  /** 和文の従見出し */
  ja: string;
  as?: "h1" | "h2";
  /** section の aria-labelledby から参照する id */
  id?: string;
  /** 黒背景セクションで true */
  invert?: boolean;
  className?: string;
};

/**
 * 全セクション共通の見出し。英字が主・和文が従の序列をここで担保する。
 * @example <SectionHeading en="SERVICE" ja="事業内容" id="service-title" />
 */
export default function SectionHeading({ en, ja, as = "h2", id, invert = false, className }: Props) {
  const Tag = as;
  const nodes: ReactNode[] = en
    .split("\n")
    .flatMap((line, i) => (i === 0 ? [line] : [<br key={`br-${i}`} className="hidden max-sp:inline" />, line]));
  return (
    <div className={cn("mb-head-mb max-sp:mb-head-mb-sp", className)}>
      <Tag id={id} className={cn("-ml-[0.045em] font-display text-display max-sp:text-display-sp", invert ? "text-fg-invert" : "text-fg")}>
        {nodes}
      </Tag>
      <p className={cn("mt-1.5 ml-[3px] text-sub max-sp:text-sub-sp", invert ? "text-fg-invert/70" : "text-fg-muted")}>{ja}</p>
    </div>
  );
}
