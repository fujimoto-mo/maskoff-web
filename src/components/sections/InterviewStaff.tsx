"use client";
import Picture from "@/components/ui/Picture";
import { INTERVIEW } from "@/content/interview";
import { useSearch } from "@/lib/use-search";

/**
 * /interview/ の「面接対応者」の担当者カード一覧。URL の ?s=<id> に一致する 1 人だけを出し、無ければ全員を出す
 * （SSR では全員を描き、ハイドレーション後に絞る）。
 * @example <InterviewStaff />
 */
export default function InterviewStaff() {
  const id = new URLSearchParams(useSearch()).get("s");
  const one = INTERVIEW.interviewers.find((p) => p.id === id);
  const list = one ? [one] : INTERVIEW.interviewers;
  return (
    // PC 5 列 / タブレット 3 列 / SP 2 列の縦長カード（写真が上、名前・肩書・紹介文が下）
    <ul className="mt-8 grid grid-cols-5 gap-3.5 max-pc:grid-cols-3 max-sp:grid-cols-2">
      {list.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-[14px] border border-border bg-bg">
          {p.photo ? (
            <Picture src={p.photo} alt="" sizes="(max-width: 600px) 45vw, (max-width: 960px) 30vw, 190px" className="block aspect-square bg-bg" imgClassName="size-full object-contain p-3" />
          ) : (
            <span aria-hidden className="flex aspect-square items-center justify-center bg-placeholder text-caption text-fg-muted">
              写真
            </span>
          )}
          <div className="px-4 pt-1 pb-5">
            <p className="text-fg">
              <span className="text-[17px] font-bold">{p.name}</span>
              <span className="ml-2 text-[12px] text-fg-muted">{p.role}</span>
            </p>
            {p.message && <p className="mt-2 whitespace-pre-line text-[12.5px] leading-[1.8] text-fg-body">{p.message}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
