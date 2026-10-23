"use client";
import type { ReactNode } from "react";
import { RED_BG } from "@/components/sections/interview-red";
import Picture from "@/components/ui/Picture";
import { INTERVIEW } from "@/content/interview";
import { formatStartParts, googleCalendarUrl, icsText, parseName, parseStart, parseToken } from "@/lib/interview-schedule";
import { useHydrated, useSearch } from "@/lib/use-search";

/** Apple のロゴ（単色なので currentColor。Google / Outlook は多色のため public/images/interview/*.svg） */
const APPLE =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

/** カレンダー登録のボタン 1 つ。download があればファイル保存（.ics）、無ければ別タブ */
function CalButton({ icon, name, href, download }: { icon: ReactNode; name: string; href: string; download?: string }) {
  const body = (
    <>
      <span aria-hidden className="flex size-7 flex-none items-center justify-center max-sp:size-[18px]">
        {icon}
      </span>
      <span className="min-w-0 text-[13px] leading-[1.45] text-fg max-sp:text-[length:min(10px,2.55vw)] max-sp:tracking-[-.04em]">
        {name}
        <br />
        カレンダーに登録
      </span>
    </>
  );
  // SP は 3 つ並べると幅が詰まるので、アイコンと余白を小さくし文字を画面幅に合わせて縮める（アイコンは文言の左のまま）
  const cls = "flex items-center gap-3 rounded-[8px] border border-border bg-bg px-4 py-3 transition-colors hover:bg-surface max-sp:justify-center max-sp:gap-1 max-sp:px-1 max-sp:py-2.5";
  return download ? (
    <a href={href} download={download} className={cls}>
      {body}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener" className={cls}>
      {body}
    </a>
  );
}

/**
 * /interview/ の招待カード（氏名・挨拶・日時・カレンダー登録・Zoom ボタン）。日時は URL の ?k=（スプレッドシートの式で作る。parseToken）、
 * 無ければ ?d=2026-10-22T13:00（JST）から読む（静的エクスポートなので SSR では日時なしで描き、ハイドレーション後に差し替える）。
 * ?n=氏名（シートの G 列。ENCODEURL 済み）があれば「〇〇 様」の見出しを出す（/interview/ は GA4 を読まず、Referer も送らない）。k / d が無い・不正なときは日時の代わりに「日時は確定メールをご確認ください」を出し、カレンダー登録は出さない。
 * joinNote を渡すと Zoom ボタンの代わりにその文言を枠だけで出し、ID・パスコードも出さない（二次面接）。
 * showTitle を付けると日時のラベルを「面接日時」ではなく「{title}日時」（例 二次面接日時）にする。
 * @example <InterviewSchedule title="一次面接" />
 * @example <InterviewSchedule title="二次面接" joinNote="Indeedのメッセージを確認ください" showTitle />
 */
export default function InterviewSchedule({ title, joinNote, showTitle = false }: { title: string; joinNote?: string; showTitle?: boolean }) {
  const search = useSearch();
  const ready = useHydrated();
  const q = new URLSearchParams(search);
  const start = parseToken(q.get("k")) ?? parseStart(q.get("d"));
  const name = parseName(q.get("n"));
  const { durationLabel, durationMin, zoom, greeting, zoomNote } = INTERVIEW;
  const ev = start
    ? joinNote
      ? // 二次面接は Zoom の情報を予定に入れない（参加方法は Indeed のメッセージで送る）
        { start, durationMin, summary: `株式会社MasKOFF ${title}`, description: `参加方法: ${joinNote.replace(/\n/g, "")}`, location: "" }
      : { start, durationMin, summary: `株式会社MasKOFF ${title}（Zoom）`, description: `Zoom: ${zoom.url}\nミーティングID: ${zoom.meetingId}\nパスコード: ${zoom.passcode}`, location: zoom.url }
    : null;
  const ics = ev ? `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText(ev, `maskoff-interview-${ev.start.getTime()}`))}` : null;
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
            {showTitle ? `${title}日時` : <><span className="sr-only">{title}</span>面接日時</>}
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

        {ev && ics && (
          <div className="mt-5">
            <p className="text-[13px] font-bold text-fg max-sp:sr-only">カレンダーに登録する</p>
            <div className="mt-2 grid grid-cols-3 gap-2.5 max-sp:gap-1.5">
              <CalButton icon={<Picture src="/images/interview/google.svg" alt="" width={24} height={24} imgClassName="block size-6 max-sp:size-[18px]" />} name="Google" href={googleCalendarUrl(ev)} />
              <CalButton
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-fg max-sp:size-[18px]">
                    <path d={APPLE} />
                  </svg>
                }
                name="Apple"
                href={ics}
                download="maskoff-interview.ics"
              />
              <CalButton icon={<Picture src="/images/interview/outlook.svg" alt="" width={26} height={26} imgClassName="block size-[26px] max-sp:size-[19px]" />} name="Outlook" href={ics} download="maskoff-interview.ics" />
            </div>
          </div>
        )}

        {joinNote ? (
          // ボタンではなく枠だけ（押せない）
          <p className="mt-5 rounded-[14px] border border-fg px-5 py-3.5 text-center text-[15px] leading-[1.7] font-bold whitespace-pre-line text-fg max-sp:px-3 max-sp:text-[length:min(15px,4.1vw)]">{joinNote}</p>
        ) : (
          <>
            <a href={zoom.url} target="_blank" rel="noopener" className={`group mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-pill ${RED_BG} px-7 py-4 text-[17px] font-bold tracking-[.06em] text-fg-invert transition-opacity hover:opacity-90 max-sp:px-5 max-sp:text-[15px]`}>
              <span />
              <span className="flex items-center gap-3">
                <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-6 flex-none">
                  <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h10A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 3 16.5zM17 10.2l4-2.7v9l-4-2.7z" />
                </svg>
                Zoom面接に参加する
              </span>
              <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5 justify-self-end transition-transform group-hover:translate-x-1">
                <path d="M2 8h11M9 4l4 4-4 4" />
              </svg>
            </a>
            <p className="mt-3 text-center text-[12px] leading-[1.8] text-fg-muted max-sp:text-[10.5px]">{zoomNote}</p>
            {/* リンクが開けないとき用に、ID とパスコードを手入力できるよう大きく出す（数字はタップで全選択）。2 マスは同じ幅で、中は中央寄せ */}
            <dl className="mt-4 grid grid-cols-[1fr_1fr] overflow-hidden rounded-[10px] border border-border text-center">
              <div className="min-w-0 px-5 py-3 max-sp:px-3">
                <dt className="text-[12px] text-fg-muted max-sp:text-[11px]">ミーティングID</dt>
                <dd className="mt-0.5 text-[18px] font-bold tracking-[.04em] whitespace-nowrap text-fg select-all max-sp:text-[15px] max-sp:tracking-normal">{zoom.meetingId}</dd>
              </div>
              <div className="min-w-0 border-l border-border px-5 py-3 max-sp:px-3">
                <dt className="text-[12px] text-fg-muted max-sp:text-[11px]">パスコード</dt>
                <dd className="mt-0.5 text-[18px] font-bold tracking-[.04em] whitespace-nowrap text-fg select-all max-sp:text-[15px] max-sp:tracking-normal">{zoom.passcode}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
