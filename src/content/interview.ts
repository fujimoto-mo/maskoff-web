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
  /** 上部のキャッチ。label は赤い英字ラベル、lines は大見出し（1 要素 = 1 行） */
  hero: {
    label: "INTERVIEW INVITATION",
    lines: ["あなたらしさを、", "聞かせてください。"],
    sub: "リラックスしてお話しできる場です。\n当日はお会いできることを楽しみにしています。",
    /**
     * 上部の室内写真（bg）と、その上に重ねる手書き「TAKE THE MASK OFF」（hand、透過 PNG）。docs/MasKOFF面接招待ランディングページ.png の右上を切り出し、
     * 焼き込みの罫線・一言を消して、手書きの線だけを抜き出したもの（bg は線の跡を周りの色で埋め、SP で縮小して敷けるよう上の壁を 180px、カードの裏まで続くよう下の机を 80px 延ばしてある）。bgSp は SP 用で、植物を中央の椅子の右へ移したもの。alt は hand に付ける
     */
    image: { bg: "/images/interview/invite-bg.jpg", bgSp: "/images/interview/invite-bg-sp.jpg", hand: "/images/interview/invite-hand.png", alt: "TAKE THE MASK OFF" },
  },
  /** 氏名の下の挨拶（\n で改行） */
  greeting: "このたびはご応募いただき、誠にありがとうございます。\n下記の日程で、面接のご案内をさせていただきます。",
  /** 所要時間の表示（日時カード「Zoom・〇〇」）。一次・二次共通 */
  durationLabel: "約30分〜1時間ほど",
  /** カレンダーに追加する予定の長さ（分）。表示の上限に合わせる */
  durationMin: 60,
  zoom: {
    url: "https://us05web.zoom.us/j/3845940162?pwd=LVqx53ktscsUVkQmHOVeddP5WaSykP.1",
    meetingId: "384 594 0162",
    passcode: "6PXTSm",
  },
  /** Zoom ボタンの下の注記 */
  zoomNote: "※ 上記ボタンから、当日の時間になりましたらご参加ください。",
  /** 二次面接は Zoom ボタンの代わりにこの案内を枠だけで出す（参加リンクは Indeed のメッセージで送る） */
  secondJoinNote: "ZoomのURLは、Indeedのメッセージを確認ください",
  /** 当日の流れ（番号付きで表示）。icon は InterviewGuide の FLOW_ICON のキー */
  flow: [
    { icon: "user", title: "あなたについて教えてください", text: "これまでのご経験や、今後やりたいことなどをお聞かせください。" },
    { icon: "building", title: "MasKOFFについてのご紹介", text: "会社のことや、事業・メンバーについてご紹介します。" },
    { icon: "laptop", title: "お仕事・研修制度についてのご説明", text: "具体的なお仕事内容や研修制度、キャリアのイメージについてお話しします。" },
    { icon: "chat", title: "ご質問・ご不安な点について", text: "気になることは何でもお気軽にご質問ください。" },
  ],
  /** 「面接対応者」欄の案内文 */
  staffIntro: {
    text: "当日は、いずれかが面接を担当いたします。\n皆さまとお会いできることを楽しみにしております！",
  },
  /**
   * 面接担当者の一覧（いずれか 1 人が担当）。URL の ?s=<id> で 1 人に絞れる（通常は付けず全員を表示）。
   * message は \n で改行。photo は public/images/ 配下（manifest 経由）。無ければ「写真」のプレースホルダ。
   * 今の photo は各人の持ち物をイメージした線画（丸枠で切り抜いた 288px の JPEG。public/images/interview/）
   */
  interviewers: [
    { id: "ikeda", role: "採用担当", name: "池田", message: "細かいところまで気が配れる、しっかり者の採用担当！\n持ち前の丁寧さで、みんなをサポートしています💪", photo: "/images/interview/ikeda.jpg" },
    // 紹介文・写真は仮（池田と同じ）。差し替え待ち
    { id: "watanabe", role: "採用担当", name: "渡邊", message: "細かいところまで気が配れる、しっかり者の採用担当！\n持ち前の丁寧さで、みんなをサポートしています💪", photo: "/images/interview/ikeda.jpg" },
    { id: "michiwaki", role: "講師", name: "道脇", message: "アパレルが大好きな、カリキュラム卒業生！\n現在は講師としても活躍しています👕✨", photo: "/images/interview/michiwaki.jpg" },
    { id: "hashizume", role: "役員", name: "橋爪", message: "クライアント様からの信頼も厚い、優しいお姉さん！\nメンバーからも頼られる、みんなの相談役です✨", photo: "/images/interview/hashizume.jpg" },
    { id: "ooishi", role: "役員", name: "大石", message: "常に最新情報をキャッチアップする、勢いあふれる役員！\n日々のトレーニングも欠かさない、ストイックな一面も🏃", photo: "/images/interview/ooishi.jpg" },
    { id: "yamamoto", role: "役員", name: "山本", message: "会社全体の事業を統括する頼れる存在！\nプライベートでは優しい二児のパパです😊", photo: "/images/interview/yamamoto.jpg" },
  ] as readonly Interviewer[],
  /** 「面接の前にご覧ください」のリンク（プレビュー環境でも本番 HP へ飛ばすため SITE.url ではなく固定） */
  prepare: { label: "MasKOFF 公式サイトを見る", href: "https://www.maskoff.co.jp/", text: "事業内容やブランドの雰囲気を事前にチェックしていただくと、よりスムーズにお話しいただけます。" },
} as const;
