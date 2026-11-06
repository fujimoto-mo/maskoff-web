"use client";
import { RED_BG } from "@/components/sections/interview-red";
import { INTERVIEW } from "@/content/interview";
import { formatStartParts, parseName, parseStart, parseToken } from "@/lib/interview-schedule";
import { useHydrated, useSearch } from "@/lib/use-search";

/**
 * /interview/ の招待カード（氏名・挨拶・日時・Zoom の案内）。日時は URL の ?k=（スプレッドシートの式で作る。parseToken）、
 * 無ければ ?d=2026-10-22T13:00（JST）から読む（静的エクスポートなので SSR では日時なしで描き、ハイドレーション後に差し替える）。
 * ?n=氏名（シートの G 列。ENCODEURL 済み）があれば「〇〇 様」の見出しを出す（/interview/ は GA4 を読まず、Referer も送らない）。k / d が無い・不正なときは日時の代わりに「日時は確定メールをご確認ください」を出す。
 * Zoom の参加リンクはページに載せず、Indeed のメッセージを見るよう案内する（文言は content/interview.ts の joinNote）。
 * 日時のラベルは「{title}日時」（例 一次面接日時）。
 * @example <InterviewSchedule title="一次面接" />
 */
export default function InterviewSchedule({ title }: { title: string }) {
  const search = useSearch();
  const ready = useHydrated();
  const q = new URLSearchParams(search);
  const start = parseToken(q.get("k")) ?? parseStart(q.get("d"));
  const name = parseName(q.get("n"));
  const { durationLabel, greeting, joinNote } = INTERVIEW;
  const p = ready && start ? formatStartParts(start) : null;
  return (
    <section aria-label={`${title}の日時`} className="rounded-[14px] bg-bg px-8 pt-8 pb-6 shadow-[0_10px_36px_color-mix(in_srgb,var(--color-fg)_7%,transparent)] max-sp:rounded-[10px] max-sp:px-4 max-sp:pt-5">
      {name && (
        <p className="mb-3 flex items-center gap-4 max-sp:mb-2 text-[clamp(24px,3vw,32px)] leading-[1.3] font-bold tracking-[.06em] text-fg">
          <span aria-hidden className={`h-[1.05em] w-[4px] rounded-full ${RED_BG}`} />
          <span>
            {name}
            <span className="ml-2 text-[.7em]">様</span>
          </span>
        </p>
      )}
      <div>
        <p className="whitespace-pre-line text-[14px] leading-[1.9] tracking-[.04em] text-fg-body max-sp:text-[13px]">{greeting}</p>

        {/* 日時（SSR では空。最小高さでハイドレーション前後のずれを抑える）。箱をコンテナにし、日時の文字と左の丸を箱の幅（cqw）から決める
            （日時は 1 行に収まる大きさで最大 40px）。丸はラベルと日時の 2 行分の左、ラベル・所要時間と罫線は日時の書き出しに揃える */}
        <div className="@container mt-6 grid min-h-[150px] grid-cols-[auto_1fr] content-center gap-x-3 rounded-[12px] bg-surface px-5 py-6 max-sp:mt-2 max-sp:min-h-0 max-sp:px-3 max-sp:py-4">
          <p className="col-start-2 text-[13px] font-bold text-fg max-sp:text-[12px]">
            {title}日時
          </p>
          {/* 丸の中にアイコン（参考画像の比率: 丸は日時の文字の約 2.3 倍、上限 72px。アイコンは丸の 52%） */}
          <span aria-hidden className="row-start-1 row-span-2 flex size-[min(72px,calc((100cqw_-_26px)/15.1*2.3))] items-center justify-center self-center rounded-full bg-placeholder/70 text-fg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[52%]">
              <path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M8 14h1M11.5 14h1M15 14h1M8 17h1M11.5 17h1" />
            </svg>
          </span>
          <div className="col-start-2 min-w-0 border-b border-border pt-1.5 pb-3">
            {p ? (
              <p className="leading-none font-bold tracking-[-.01em] whitespace-nowrap text-fg" data-start>
                <span className="text-[length:min(40px,calc((100cqw_-_26px)/15.1))]">
                  {p.year}
                  <span className="text-[.68em]">年</span>
                  {p.month}
                  <span className="text-[.68em]">月</span>
                  {p.day}
                  <span className="text-[.68em]">日</span>
                  <span className="ml-1 text-[.68em]">({p.weekday})</span>
                  <span className="ml-3 max-sp:ml-1.5">
                    {p.time}
                    <span className="ml-1 text-[.8em]">〜</span>
                  </span>
                </span>
              </p>
            ) : (
              <p className="text-[18px] font-bold leading-[1.5] text-fg max-sp:text-[15px]" data-start>
                {ready ? "日時は確定メールをご確認ください" : " "}
              </p>
            )}
          </div>
          <p className="col-start-2 mt-3 text-[14px] text-fg max-sp:text-[12.5px]">
            Zoom面接<span className="mx-3 text-fg-muted max-sp:mx-2">|</span>所要時間：{durationLabel}
          </p>
        </div>

        {/* ボタンではなく枠だけ（押せない） */}
        <p className="mt-5 rounded-[14px] border border-fg px-5 py-3.5 text-center text-[15px] leading-[1.7] font-bold whitespace-pre-line text-fg max-sp:px-3 max-sp:text-[length:min(15px,4.1vw)]">{joinNote}</p>
      </div>
    </section>
  );
}
