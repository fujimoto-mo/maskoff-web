"use client";
import type { ReactNode } from "react";
import { INTERVIEW } from "@/content/interview";
import { formatStartParts, googleCalendarUrl, icsText, parseName, parseStart, parseToken } from "@/lib/interview-schedule";
import { useHydrated, useSearch } from "@/lib/use-search";

/** Zoom ボタンの赤。白文字とのコントラストを確保するため純色ではなく黒を 12% 混ぜる（.cta-liquid の hover と同じ） */
const RED = "bg-[color-mix(in_srgb,var(--color-marker)_88%,black)]";

/** 線のアイコン（24px グリッド、currentColor） */
const PATH = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
  lock: "M6.5 10.5h11v9h-11zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14v2",
  calendar: "M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4",
  download: "M12 4v10M8 10.5l4 4 4-4M5 19.5h14",
};

/** 情報帯の 1 マス。href があればリンク（download があればファイル保存） */
function Cell({ icon, label, value, href, download }: { icon: keyof typeof PATH; label: ReactNode; value?: string; href?: string; download?: string }) {
  const body = (
    <>
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-[22px] flex-none text-fg">
        <path d={PATH[icon]} />
      </svg>
      <span className="min-w-0">
        <span className={`block text-[12px] leading-[1.6] ${href ? "font-bold text-fg underline underline-offset-4" : "text-fg-muted"}`}>{label}</span>
        {value && <span className="mt-0.5 block font-display text-[17px] font-bold tracking-[.04em] whitespace-nowrap text-fg select-all max-sp:text-[15px] max-sp:tracking-normal">{value}</span>}
      </span>
    </>
  );
  const cls = "flex items-center gap-3 px-5 py-4 max-sp:gap-2 max-sp:px-3";
  if (!href) return <div className={cls}>{body}</div>;
  return download ? (
    <a href={href} download={download} className={`${cls} transition-colors hover:bg-surface`}>
      {body}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener" className={`${cls} transition-colors hover:bg-surface`}>
      {body}
    </a>
  );
}

/**
 * /interview/ の日時カードと情報帯（ミーティング ID・パスコード・カレンダー追加）。日時は URL の ?k=（スプレッドシートの式で作る。parseToken）、
 * 無ければ ?d=2026-10-22T13:00（JST）から読む（静的エクスポートなので SSR では日時なしで描き、ハイドレーション後に差し替える）。
 * ?n=氏名（シートの G 列。ENCODEURL 済み）があれば「〇〇 様」を添える（/interview/ は GA4 を読まず、Referer も送らない）。k / d が無い・不正なときは日時の代わりに「日時は確定メールをご確認ください」を出し、カレンダー追加は出さない。
 * joinNote を渡すと Zoom ボタンの代わりにその文言を枠だけで出し、ID・パスコードも出さない（二次面接）。
 * @example <InterviewSchedule title="一次面接" />
 * @example <InterviewSchedule title="二次面接" joinNote="Indeedのメッセージを確認ください" />
 */
export default function InterviewSchedule({ title, joinNote }: { title: string; joinNote?: string }) {
  const search = useSearch();
  const ready = useHydrated();
  const q = new URLSearchParams(search);
  const start = parseToken(q.get("k")) ?? parseStart(q.get("d"));
  const name = parseName(q.get("n"));
  const { durationLabel, durationMin, zoom, cardLabel, cardText } = INTERVIEW;
  const ev = start
    ? joinNote
      ? // 二次面接は Zoom の情報を予定に入れない（参加方法は Indeed のメッセージで送る）
        { start, durationMin, summary: `株式会社MasKOFF ${title}`, description: `参加方法: ${joinNote}`, location: "" }
      : { start, durationMin, summary: `株式会社MasKOFF ${title}（Zoom）`, description: `Zoom: ${zoom.url}\nミーティングID: ${zoom.meetingId}\nパスコード: ${zoom.passcode}`, location: zoom.url }
    : null;
  const ics = ev ? `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText(ev, `maskoff-interview-${ev.start.getTime()}`))}` : null;
  const parts = ready && start ? formatStartParts(start) : null;
  const showIds = !joinNote;
  const showCal = !!(ev && ics);
  return (
    <>
      {name && <p className="mb-4 text-[18.4px] font-bold text-fg">{name} 様</p>}
      <div className="grid grid-cols-[1fr_1px_1fr] gap-9 rounded-[20px] bg-bg px-9 py-8 shadow-[0_12px_40px_color-mix(in_srgb,var(--color-fg)_9%,transparent)] max-pc:grid-cols-1 max-pc:gap-6 max-sp:px-6 max-sp:py-7">
        {/* 日時（SSR では空。最小高さでハイドレーション前後のずれを抑える） */}
        <div className="min-h-[150px]">
          <p className="font-display text-[11px] font-semibold tracking-[.24em] text-fg-muted">{cardLabel}</p>
          {parts ? (
            <p className="mt-2 font-display font-bold leading-none tracking-[-.03em] text-fg" data-start>
              <span className="text-[clamp(54px,9vw,72px)]">{parts.date}</span>
              <span className="ml-3 text-[20px] tracking-[.02em]">{parts.weekday}</span>
              <span className="mt-2 block text-[clamp(32px,5vw,40px)]">{parts.time} 〜</span>
            </p>
          ) : (
            <p className="mt-4 text-[20px] font-bold leading-[1.5] text-fg" data-start>
              {ready ? "日時は確定メールをご確認ください" : " "}
            </p>
          )}
          <p className="mt-4 text-[13px] text-fg-muted">Zoom面接｜所要時間：{durationLabel}</p>
        </div>
        <span aria-hidden className="bg-border max-pc:h-px" />
        <div className="self-center">
          <h1 className="text-[20px] font-bold text-fg">{title}</h1>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.9] text-fg-body">{cardText}</p>
          {joinNote ? (
            // ボタンではなく枠だけ（押せない）
            <p className="mt-5 rounded-[14px] border border-fg px-5 py-3.5 text-center text-[15px] leading-[1.7] font-bold text-fg">{joinNote}</p>
          ) : (
            <a href={zoom.url} target="_blank" rel="noopener" className={`group mt-5 flex items-center justify-center gap-3 rounded-pill ${RED} px-6 py-4 text-[16px] font-bold text-fg-invert transition-opacity hover:opacity-90`}>
              Zoomで参加する
              <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 transition-transform group-hover:translate-x-1">
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </a>
          )}
        </div>
      </div>
      {(showIds || showCal) && (
        // PC は横一列、タブレット以下は 2 列。区切り線は各マスの左・上の罫線で引く
        <div className="mt-5 grid grid-flow-col auto-cols-fr overflow-hidden rounded-[14px] border border-border bg-bg max-pc:grid-flow-row max-pc:grid-cols-2 [&>*+*]:border-l [&>*+*]:border-border max-pc:[&>*:nth-child(odd)]:border-l-0 max-pc:[&>*:nth-child(n+3)]:border-t">
          {showIds && (
            <>
              <Cell icon="user" label="ミーティングID" value={zoom.meetingId} />
              <Cell icon="lock" label="パスコード" value={zoom.passcode} />
            </>
          )}
          {ev && ics && (
            <>
              <Cell icon="calendar" label="Googleカレンダーに追加" href={googleCalendarUrl(ev)} />
              <Cell
                icon="download"
                label={
                  <>
                    Apple / Outlook の<br />
                    カレンダーに追加（.ics）
                  </>
                }
                href={ics}
                download="maskoff-interview.ics"
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
