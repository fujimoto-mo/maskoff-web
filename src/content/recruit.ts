// RECRUIT ページの内容（docs/design_handoff_recruit_page 由来）。
// SAMPLE: INFORMATION の数値・DAILY FLOW・ROADMAP・CAREER MAP のコピーは仮。実数値・実文言に差し替える。
export const CULTURE = [
  {
    title: "NO MASK",
    body: "服装・髪型・タトゥー自由。素の自分で働ける環境です。",
  },
  {
    title: "FLAT TEAM",
    body: "企画会議は全員参加。ジュニアの案がそのまま製品になることも。",
  },
  {
    title: "SIDE WORKS",
    body: "個人の制作・アーティスト活動との両立を歓迎しています。",
  },
] as const;

/** 数字で見る MasKOFF。value は表示文字列（"26.4" / "週3" など）、unit は赤字 */
export const STATS = [
  { label: "AVG. AGE", value: "26.4", unit: "歳", note: "社員の平均年齢" },
  {
    label: "MEMBERS",
    value: "18",
    unit: "名",
    note: "正社員+業務委託パートナー",
  },
  {
    label: "ENGINEER RATIO",
    value: "45",
    unit: "%",
    note: "エンジニア・デザイナー比率",
  },
  {
    label: "FROM ZERO",
    value: "60",
    unit: "%",
    note: "未経験からのスタート率",
  },
  {
    label: "REMOTE",
    value: "週3",
    unit: "日",
    note: "リモート勤務OK（職種による）",
  },
  { label: "PAID LEAVE", value: "85", unit: "%", note: "有給休暇取得率" },
  { label: "SIDE WORKS", value: "100", unit: "%", note: "副業・個人活動OK" },
  {
    label: "EVENTS",
    value: "12",
    unit: "回/年",
    note: "ポップアップ・展示・社内イベント",
  },
] as const;

export const DAILY_FLOW = [
  {
    time: "10:00",
    title: "出社・リモート開始",
    desc: "コアタイムは10:00〜16:00。朝はSlackで今日のタスクを共有。",
  },
  {
    time: "10:30",
    title: "チーム朝会",
    desc: "15分のスタンドアップ。進捗と相談ごとをさっと共有します。",
  },
  {
    time: "11:00",
    title: "制作・開発タイム",
    desc: "デザイン、コーディング、企画づくり。集中時間はミーティング禁止。",
  },
  {
    time: "13:00",
    title: "ランチ",
    desc: "オフィス周辺の渋谷・原宿へ。チームランチ補助あり。",
  },
  {
    time: "14:00",
    title: "ミーティング・レビュー",
    desc: "企画会議やデザインレビュー。職種を越えて全員が意見を出します。",
  },
  {
    time: "16:00",
    title: "もくもくタイム",
    desc: "夕方は再び集中時間。techMaskLabの学習に充てるメンバーも。",
  },
  {
    time: "19:00",
    title: "退勤",
    desc: "残業は原則なし。制作イベント前だけ、みんなで追い込むことも。",
  },
] as const;

export const ROADMAP_LEAD =
  "未経験入社でも大丈夫。自社カリキュラム「techMaskLab」で、6ヶ月で現場デビューまで伴走します。";
export const ROADMAP = [
  {
    period: "MONTH 1-2",
    phase: "PHASE 01",
    title: "基礎を固める",
    desc: "Web/プログラミングの基礎を、実案件ベースの課題で学びます。週次で現役エンジニアの1on1メンタリング。",
    skills: ["HTML / CSS", "JavaScript", "Git"],
  },
  {
    period: "MONTH 3-4",
    phase: "PHASE 02",
    title: "つくって壊す",
    desc: "小さなWebアプリを設計から実装まで一人で完走。コードレビューで現場の品質基準を体に入れます。",
    skills: ["React", "API連携", "DB基礎"],
  },
  {
    period: "MONTH 5-6",
    phase: "PHASE 03",
    title: "現場に入る",
    desc: "社内の実プロジェクトにジョイン。先輩とペアを組み、実際の顧客案件の一部を担当します。",
    skills: ["チーム開発", "コードレビュー", "運用"],
  },
  {
    period: "MONTH 7〜",
    phase: "DEBUT",
    title: "現場デビュー",
    desc: "案件の担当メンバーとして独り立ち。その後もキャリア面談で、伸ばしたい方向に合わせて成長を支援します。",
    skills: ["案件担当", "後輩メンタリング"],
  },
] as const;

export const CAREER_LEAD =
  "入社後のキャリアはひとつじゃない。マネジメント・スペシャリスト・事業づくり、3つの道を行き来しながら自分の形を見つけられます。";
export const CAREER_STEPS = [
  {
    year: "YEAR 0-1",
    en: "LEARN & JOIN",
    title: "基礎習得・現場デビュー",
    desc: "研修・OJT（エンジニア職はtechMaskLab）を経て、先輩とペアで実務を担当。",
  },
  {
    year: "YEAR 1-3",
    en: "OWN IT",
    title: "独り立ち・担当を持つ",
    desc: "顧客・案件の担当者として自走。小さくても「自分の仕事」を持ちます。",
  },
  {
    year: "YEAR 3-5",
    en: "LEAD",
    title: "リード・後輩育成",
    desc: "チームリーダーやプロジェクトの推進役に。後輩のメンタリングも。",
  },
  {
    year: "YEAR 5〜",
    en: "EXPAND",
    title: "事業を動かす",
    desc: "マネージャー、事業責任者、新規事業立ち上げなど、選んだ道の先へ。",
  },
] as const;
export const CAREER_PATHS = [
  {
    en: "MANAGEMENT",
    title: "マネジメントコース",
    desc: "チーム・事業部を率いる道。メンバー育成と数字づくりの両輪を担います。",
  },
  {
    en: "SPECIALIST",
    title: "スペシャリストコース",
    desc: "営業・開発・デザインなど、専門性を極めてその道の第一人者になる道。",
  },
  {
    en: "BIZ CREATOR",
    title: "事業づくりコース",
    desc: "新規事業の企画・立ち上げに挑む道。社内起業的なチャレンジも歓迎。",
  },
] as const;

/** 募集職種。エントリーは /contact/ へ（microCMS jobs に載せる場合は getJobs() に差し替える） */
export const JOBS = [
  {
    title: "セールススタッフ",
    desc: "求人広告・IT導入支援などの提案営業。顧客の課題ヒアリングからプランニングまで。",
  },
  {
    title: "コールセンター・オフィスワーク",
    desc: "BPO事業のカスタマーサポート・事務スタッフ。未経験歓迎、研修あり。",
  },
  {
    title: "webクリエイター",
    desc: "WEBアプリ開発・サイト制作のデザイン&コーディング。techMaskLabで未経験からの挑戦も可。",
  },
] as const;
