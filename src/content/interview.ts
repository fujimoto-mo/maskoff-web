/**
 * 一次面接の案内ページ（/interview/）の固定内容。JICOO の予約完了メール・リマインドメールから
 * `https://www.maskoff.co.jp/interview/?k=1U0XI1&n=%E7%94%B0...&s=a` のようにリンクする（k は日時、n は氏名。シートの AL 列の式は lib/interview-schedule.ts の TOKEN_KEY 参照。s は担当者 id。いずれも省略可）。
 * Zoom の URL・ミーティング ID・パスコードはここで固定（JICOO 側の値と一致させる）。
 * SAMPLE: Zoom の値と担当者名・写真は仮。公開前に実データへ差し替える。
 */
export type Interviewer = { id: string; role: string; name: string; message: string; photo?: string };

export const INTERVIEW = {
  /** 画面上の面接名（h1 と予定の件名に使う） */
  title: "一次面接",
  /** 所要時間（分）。表示は「約 40 分前後」、カレンダーの終了時刻にも使う */
  durationMin: 40,
  zoom: {
    url: "https://zoom.us/j/00000000000",
    meetingId: "000 0000 0000",
    passcode: "000000",
  },
  /** 当日の流れ（番号付きで表示） */
  flow: ["会社とお仕事のご紹介", "これまでのご経験のお話", "気になっている点へのご回答"],
  /**
   * 当日の担当の一覧。URL の ?s=<id> で 1 人に絞る（JICOO の予定タイプごとにメールのリンクへ付ける）。s が無い・一致しないときは全員を表示。
   * photo は public/images/ 配下（manifest 経由）。無ければ「写真」のプレースホルダ
   */
  interviewers: [
    { id: "a", role: "採用担当", name: "〇〇〇〇", message: "株式会社MasKOFFの〇〇と申します。当日はよろしくお願いいたします。", photo: undefined },
    { id: "b", role: "採用担当", name: "△△△△", message: "株式会社MasKOFFの△△と申します。当日はよろしくお願いいたします。", photo: undefined },
  ] as readonly Interviewer[],
  /** 「面接の前にご覧ください」のリンク（プレビュー環境でも本番 HP へ飛ばすため SITE.url ではなく固定） */
  prepare: { label: "株式会社MasKOFF ホームページ", href: "https://www.maskoff.co.jp/" },
} as const;
