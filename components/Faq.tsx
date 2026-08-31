"use client";
import { useState } from "react";
import type { Faq as FaqType } from "@/lib/cms";

// PC: 2カラム静的表示 / SP: アコーディオン（CSSで切替、状態はSPでのみ意味を持つ）
export function Faq({ items }: { items: FaqType[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="faq-grid">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className="faq-item" data-open={isOpen}>
            <h3>
              <button className="faq-q" aria-expanded={isOpen} aria-controls={`faq-${f.id}`} onClick={() => setOpen(isOpen ? null : f.id)}>
                <span className="q" aria-hidden>Q</span>
                <span>{f.question}</span>
                <span className="chev" aria-hidden />
              </button>
            </h3>
            <div id={`faq-${f.id}`} className="faq-a">{f.answer}</div>
          </div>
        );
      })}
    </div>
  );
}
