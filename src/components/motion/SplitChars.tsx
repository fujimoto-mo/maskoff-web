import type { CSSProperties } from "react";
import { splitChars } from "@/components/motion/split-chars";

/**
 * 見出し英字を .ch-clip > .ch に分割する（skew 立ち上がり用）。読み上げは親の aria-label に任せ、span は aria-hidden。
 * @example <h2 aria-label="OPEN CALL"><SplitChars text="OPEN CALL" /></h2>
 */
export default function SplitChars({ text }: { text: string }) {
  return (
    <>
      {splitChars(text).map((t, i) => {
        if (t.kind === "br") return <br key={i} className="hidden max-sp:inline" />;
        if (t.kind === "space") return <span key={i} aria-hidden className="ch-space"> </span>;
        return (
          <span key={i} aria-hidden className="ch-clip">
            <span className="ch" style={{ "--ci": t.index } as CSSProperties}>
              {t.ch}
            </span>
          </span>
        );
      })}
    </>
  );
}
