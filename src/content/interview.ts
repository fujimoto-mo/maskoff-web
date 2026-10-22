/**
 * 一次面接・二次面接の案内ページ（/interview/・/interview/second/）の固定内容。Zoom・担当・流れは共通。JICOO の予約完了メール・リマインドメールから
 * `https://www.maskoff.co.jp/interview/?k=1U0XI1&n=%E7%94%B0...&s=a` のようにリンクする（k は日時、n は氏名。シートの AL 列の式は lib/interview-schedule.ts の TOKEN_KEY 参照。s は担当者 id。いずれも省略可）。
 * Zoom の URL・ミーティング ID・パスコードはここで固定（JICOO 側の値と一致させる）。
 */
export type InterviewKind = "first" | "second";
export type Interviewer = { id: string; role: string; name: string; message: string; photo?: string };

export const INTERVIEW = {
  /** 画面上の面接名（h1 と予定の件名に使う）。first = /interview/、second = /interview/second/ */
  titles: { first: "一次面接", second: "二次面接" },
  /** ページ上部の社名の横に添える英字（2 行） */
  tagline: "CHALLENGE YOURSELF.\nCHANGE YOUR FUTURE.",
  /** 上部のキャッチ。script は赤い筆記体の飾り、lines は大見出し（1 要素 = 1 行） */
  hero: {
    script: "Recruit Event",
    lines: ["一歩踏み出す", "その瞬間が、", "未来を変える。"],
    sub: "仕事も、人生も、もっと面白く。",
    /** キャッチの右（SP は下）に置く手書きメッセージの画像（docs/S__117104644.jpg を 1000px に縮小） */
    image: { src: "/images/interview/hero.jpg", alt: "新たな自分をさらけ出せ。株式会社MasKOFF チーム一同" },
  },
  /** 日時カード左上の英字ラベル */
  cardLabel: "ONLINE INTERVIEW",
  /** 日時カード右側の説明（一次・二次共通） */
  cardText: "あなたのことをもっと知るための\nカジュアルな面談です。\nリラックスしてご参加ください。",
  /** 「面接対応者」欄の見出し（大きな和文。\n で改行） */
  teamHeading: "あなたの「やりたい」を\n一緒に叶える仲間が\nいます。",
  /** 所要時間の表示（日時カード「Zoom・〇〇」）。一次・二次共通 */
  durationLabel: "約30分〜1時間ほど",
  /** カレンダーに追加する予定の長さ（分）。表示の上限に合わせる */
  durationMin: 60,
  zoom: {
    url: "https://us05web.zoom.us/j/3845940162?pwd=LVqx53ktscsUVkQmHOVeddP5WaSykP.1",
    meetingId: "384 594 0162",
    passcode: "6PXTSm",
  },
  /** 二次面接は Zoom ボタンの代わりにこの案内を枠だけで出す（参加リンクは Indeed のメッセージで送る） */
  secondJoinNote: "ZoomのURLは、Indeedのメッセージを確認ください",
  /** 当日の流れ（番号付きで表示） */
  flow: ["あなたについて教えてください", "MasKOFFについてのご紹介", "お仕事・研修制度についてのご説明", "ご質問・ご不安な点について"],
  /** 「面接対応者」欄の案内文 */
  staffIntro: {
    text: "当日は、株式会社MasKOFFのメンバーのいずれかが面接を担当いたします。\n皆さまとお会いできることを楽しみにしております！",
  },
  /**
   * 面接担当者の一覧（いずれか 1 人が担当）。URL の ?s=<id> で 1 人に絞れる（通常は付けず全員を表示）。
   * message は \n で改行。photo は public/images/ 配下（manifest 経由）。無ければ「写真」のプレースホルダ。
   * 今の photo は各人の持ち物をイメージした線画（丸枠で切り抜いた 288px の JPEG。public/images/interview/）
   */
  interviewers: [
    { id: "ikeda", role: "人事", name: "池田", message: "細かいところまで気が配れる、しっかり者の人事担当！\n持ち前の丁寧さで、みんなをサポートしています💪", photo: "/images/interview/ikeda.jpg" },
    { id: "hashizume", role: "役員", name: "橋爪", message: "クライアント様からの信頼も厚い、優しいお姉さん！\nメンバーからも頼られる、みんなの相談役です✨", photo: "/images/interview/hashizume.jpg" },
    { id: "michiwaki", role: "講師", name: "道脇", message: "アパレルが大好きな、カリキュラム卒業生！\n現在は講師としても活躍しています👕✨", photo: "/images/interview/michiwaki.jpg" },
    { id: "ooishi", role: "役員", name: "大石", message: "常に最新情報をキャッチアップする、勢いあふれる役員！\n日々のトレーニングも欠かさない、ストイックな一面も🏃", photo: "/images/interview/ooishi.jpg" },
    { id: "yamamoto", role: "役員", name: "山本", message: "会社全体の事業を統括する頼れる存在！\nプライベートでは優しい二児のパパです😊", photo: "/images/interview/yamamoto.jpg" },
  ] as readonly Interviewer[],
  /** 「面接の前にご覧ください」のリンク（プレビュー環境でも本番 HP へ飛ばすため SITE.url ではなく固定） */
  prepare: { label: "株式会社MasKOFF ホームページ", href: "https://www.maskoff.co.jp/", text: "事業内容やブランドの雰囲気を\n事前にチェックしてください。" },
} as const;
