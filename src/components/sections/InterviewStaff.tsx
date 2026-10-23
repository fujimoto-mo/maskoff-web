"use client";
import { RED_BG } from "@/components/sections/interview-red";
import Picture from "@/components/ui/Picture";
import { INTERVIEW } from "@/content/interview";
import { useSearch } from "@/lib/use-search";

/**
 * /interview/ の「面接対応者一覧」の担当者一覧。URL の ?s=<id> に一致する 1 人だけを出し、無ければ全員を出す
 * （SSR では全員を描き、ハイドレーション後に絞る）。
 * 列数は置き場所の幅で決める（コンテナクエリ）: 440px 以上は 3 列の縦長（写真が上。6 人で 3 列 × 2 段）、それ未満は写真が左の横長カード。
 * @example <div className="@container"><InterviewStaff /></div>
 */
export default function InterviewStaff() {
  const id = new URLSearchParams(useSearch()).get("s");
  const one = INTERVIEW.interviewers.find((p) => p.id === id);
  const list = one ? [one] : INTERVIEW.interviewers;
  return (
    <ul className="mt-6 grid gap-3 @min-[440px]:grid-cols-3 @min-[440px]:gap-x-0 @min-[440px]:gap-y-7">
      {list.map((p) => (
        <li
          key={p.id}
          className="grid grid-cols-[96px_1fr] items-start gap-x-4 rounded-[12px] bg-surface p-4 @min-[440px]:block @min-[440px]:rounded-none @min-[440px]:bg-transparent @min-[440px]:px-3 @min-[440px]:py-1 @min-[440px]:not-first:border-l @min-[440px]:not-first:border-border @min-[440px]:[&:nth-child(3n+1)]:border-l-0"
        >
          {p.photo ? (
            <Picture src={p.photo} alt="" sizes="(max-width: 600px) 96px, 120px" className="block aspect-square overflow-hidden rounded-full @min-[440px]:w-[min(100%,120px)]" imgClassName="size-full object-cover" />
          ) : (
            <span aria-hidden className="flex aspect-square items-center justify-center rounded-full bg-placeholder text-caption text-fg-muted">
              写真
            </span>
          )}
          <div className="@min-[440px]:mt-3">
            {/* 氏名と肩書を 1 行に（氏名 → 肩書の順、下端を揃える） */}
            <p className="flex items-baseline gap-2 leading-[1.3]">
              <span className="text-[17px] font-bold text-fg">{p.name}</span>
              <span className="text-[12px] text-fg-muted">{p.role}</span>
            </p>
            <span aria-hidden className={`mt-1 block h-[2px] w-5 ${RED_BG}`} />
            {p.message && <p className="mt-2.5 whitespace-pre-line text-[12px] leading-[1.75] text-fg-body @min-[440px]:whitespace-normal">{p.message}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
