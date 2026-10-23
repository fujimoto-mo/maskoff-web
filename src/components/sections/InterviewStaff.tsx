"use client";
import Picture from "@/components/ui/Picture";
import { INTERVIEW } from "@/content/interview";
import { useSearch } from "@/lib/use-search";

/**
 * /interview/ の「面接対応者一覧」の担当者一覧。URL の ?s=<id> に一致する 1 人だけを出し、無ければ全員を出す
 * （SSR では全員を描き、ハイドレーション後に絞る）。
 * 列数は置き場所の幅で決める（コンテナクエリ）: 600px 以上は 5 列、440px 以上は 3 列の縦長（写真が上）、それ未満は写真が左の横長カード。
 * @example <div className="@container"><InterviewStaff /></div>
 */
export default function InterviewStaff() {
  const id = new URLSearchParams(useSearch()).get("s");
  const one = INTERVIEW.interviewers.find((p) => p.id === id);
  const list = one ? [one] : INTERVIEW.interviewers;
  return (
    <ul className="mt-6 grid gap-3 @min-[440px]:grid-cols-3 @min-[440px]:gap-0 @min-[600px]:grid-cols-5">
      {list.map((p) => (
        <li
          key={p.id}
          className="grid grid-cols-[96px_1fr] items-start gap-x-4 rounded-[12px] bg-surface p-4 @min-[440px]:block @min-[440px]:rounded-none @min-[440px]:bg-transparent @min-[440px]:px-3 @min-[440px]:py-1 @min-[440px]:not-first:border-l @min-[440px]:not-first:border-border @min-[440px]:@max-[599px]:[&:nth-child(3n+1)]:border-l-0"
        >
          {p.photo ? (
            <Picture src={p.photo} alt="" sizes="(max-width: 600px) 96px, 120px" className="block aspect-square overflow-hidden rounded-full bg-bg shadow-[0_4px_14px_color-mix(in_srgb,var(--color-fg)_8%,transparent)]" imgClassName="size-full object-contain p-2" />
          ) : (
            <span aria-hidden className="flex aspect-square items-center justify-center rounded-full bg-placeholder text-caption text-fg-muted">
              写真
            </span>
          )}
          <div className="@min-[440px]:mt-3">
            <p className="text-[12px] text-fg-muted">{p.role}</p>
            <p className="text-[17px] leading-[1.4] font-bold text-fg">{p.name}</p>
            <span aria-hidden className="mt-2 block h-[2px] w-5 bg-marker" />
            {p.message && <p className="mt-2.5 whitespace-pre-line text-[12px] leading-[1.75] text-fg-body @min-[440px]:whitespace-normal">{p.message}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
