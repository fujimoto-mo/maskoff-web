"use client";
import Button from "@/components/ui/Button";
import { INTERVIEW } from "@/content/interview";
import { formatStartJa, googleCalendarUrl, icsText, parseName, parseStart, parseToken } from "@/lib/interview-schedule";
import { useHydrated, useSearch } from "@/lib/use-search";

/**
 * /interview/ の日時カードと Zoom ボタン、カレンダー追加。日時は URL の ?k=（スプレッドシートの式で作る。parseToken）、
 * 無ければ ?d=2026-10-22T13:00（JST）から読む（静的エクスポートなので SSR では日時なしで描き、ハイドレーション後に差し替える）。
 * ?n=氏名（シートの G 列。ENCODEURL 済み）があれば「〇〇 様」を添える（/interview/ は GA4 を読まず、Referer も送らない）。k / d が無い・不正なときは日時の代わりに「日時は確定メールをご確認ください」を出し、カレンダー追加は出さない。
 * @example <InterviewSchedule />
 */
export default function InterviewSchedule() {
  const search = useSearch();
  const ready = useHydrated();
  const q = new URLSearchParams(search);
  const start = parseToken(q.get("k")) ?? parseStart(q.get("d"));
  const name = parseName(q.get("n"));
  const { title, durationMin, zoom } = INTERVIEW;
  const ev = start
    ? { start, durationMin, summary: `株式会社MasKOFF ${title}（Zoom）`, description: `Zoom: ${zoom.url}\nミーティングID: ${zoom.meetingId}\nパスコード: ${zoom.passcode}`, location: zoom.url }
    : null;
  const ics = ev ? `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText(ev, `maskoff-interview-${ev.start.getTime()}`))}` : null;
  return (
    <>
      {name && <p className="mb-4 text-[16px] font-bold text-fg">{name} 様</p>}
      <div className="relative flex justify-center overflow-hidden rounded-card bg-fg px-6 py-7 text-fg-invert">
        {/* 2 つの輪が重なるマーク（面接 = 人と人が会う） */}
        <span aria-hidden className="absolute right-[-38px] bottom-[18px] size-[117px] rounded-full border-[10px] border-marker/70" />
        <span aria-hidden className="absolute right-[20px] bottom-[-22px] size-[117px] rounded-full border-[10px] border-marker/70" />
        {/* 3 行をひとかたまりで中央に置き、かたまりの中は日時の左端にそろえる。輪より前面。
            日時は日付と時刻で改行を固定する（折り返しに任せるとかたまりがカード幅いっぱいになり、中央に寄らない） */}
        <div className="relative z-[1]">
          <h1 className="text-[15px] font-medium tracking-[.04em] text-fg-invert">{title}</h1>
          <p className={`mt-1.5 whitespace-pre-line font-display font-black leading-[1.2] tracking-[-.02em] ${ready && !start ? "text-[20px]" : "text-[clamp(28px,7.5vw,40px)]"}`} data-start>
            {ready ? (start ? formatStartJa(start).replace("）", "）\n") : "日時は確定メールをご確認ください") : " "}
          </p>
          <p className="mt-2 text-[14px] text-fg-invert/80">Zoom・約{durationMin}分前後</p>
        </div>
      </div>
      <p className="mt-4">
        <Button href={zoom.url} variant="block" className="text-[18px] font-black">
          Zoomで参加する
        </Button>
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px] text-fg-body">
        <dt className="text-fg-muted">ミーティングID</dt>
        <dd className="font-display font-bold tracking-[.04em] select-all">{zoom.meetingId}</dd>
        <dt className="text-fg-muted">パスコード</dt>
        <dd className="font-display font-bold tracking-[.04em] select-all">{zoom.passcode}</dd>
      </dl>
      {ev && ics && (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button href={googleCalendarUrl(ev)} variant="liquid">
            Googleカレンダーに追加
          </Button>
          <a href={ics} download="maskoff-interview.ics" className="text-caption text-fg-muted underline underline-offset-4 hover:text-fg">
            Apple / Outlook のカレンダーに追加（.ics）
          </a>
        </div>
      )}
    </>
  );
}
