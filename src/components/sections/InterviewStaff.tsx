"use client";
import Picture from "@/components/ui/Picture";
import { INTERVIEW } from "@/content/interview";
import { useSearch } from "@/lib/use-search";

/**
 * /interview/ の「当日の担当」。URL の ?s=<id> に一致する 1 人だけを出し、無ければ全員を出す
 * （SSR では全員を描き、ハイドレーション後に絞る）。
 * @example <InterviewStaff />
 */
export default function InterviewStaff() {
  const id = new URLSearchParams(useSearch()).get("s");
  const one = INTERVIEW.interviewers.find((p) => p.id === id);
  const list = one ? [one] : INTERVIEW.interviewers;
  return (
    <ul className="mt-4 space-y-5">
      {list.map((p) => (
        <li key={p.id} className="grid grid-cols-[72px_1fr] items-start gap-5">
          {p.photo ? (
            <Picture src={p.photo} alt="" sizes="72px" className="block size-[72px] overflow-hidden rounded-full" imgClassName="size-full object-cover" />
          ) : (
            <span aria-hidden className="flex size-[72px] items-center justify-center rounded-full bg-placeholder text-caption text-fg-muted">
              写真
            </span>
          )}
          <div>
            <p className="text-[16px] font-bold text-fg">
              <span className="mr-3">{p.role}</span>
              {p.name}
            </p>
            <p className="mt-2 text-[15px] leading-[1.9] text-fg-body">{p.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
