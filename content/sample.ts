// microCMS 未接続時に使われるサンプルデータ。文言はすべて仮です。
import type { News, Notice, Job, Faq, Member } from "@/lib/cms";

const cat = {
  press: { id: "press", name: "プレスリリース", slug: "press" },
  event: { id: "event", name: "イベント", slug: "event" },
  media: { id: "media", name: "メディア掲載", slug: "media" },
};

const news: News[] = [
  { id: "n001", title: "コーポレートサイトをリニューアルしました", publishedAt: "2026-08-31T00:00:00Z", category: cat.press, body: "<p>株式会社MasKOFFは本日、コーポレートサイトを全面リニューアルしました。8つの事業内容と採用情報を整理し、お問い合わせ導線を改善しています。</p><p>今後もNEWS・NOTICEで最新情報を発信していきます。</p>" },
  { id: "n002", title: "techMasKOFF LAB. 第3期 受講生の募集を開始", publishedAt: "2026-07-15T00:00:00Z", category: cat.event, body: "<p>未経験からIT人材を育成する社内カリキュラム「techMasKOFF LAB.」第3期の受講生募集を開始しました。</p>" },
  { id: "n003", title: "業界誌にアパレルコンサルティング事業が掲載されました", publishedAt: "2026-06-02T00:00:00Z", category: cat.media, body: "<p>業界誌○○ 6月号に、当社のアパレルコンサルティング事業の取り組みが掲載されました。</p>" },
  { id: "n004", title: "海外越境EC導入支援サービスを開始", publishedAt: "2026-04-10T00:00:00Z", category: cat.press, body: "<p>Shopifyを活用した越境EC導入支援サービスの提供を開始しました。</p>" },
];

const notice: Notice[] = [
  { id: "t001", title: "夏季休業のお知らせ（8/13〜8/16）", publishedAt: "2026-08-01T00:00:00Z", body: "<p>誠に勝手ながら、下記期間を夏季休業とさせていただきます。<br>2026年8月13日（木）〜 8月16日（日）</p><p>期間中のお問い合わせは8月17日以降に順次対応いたします。</p>" },
  { id: "t002", title: "お問い合わせフォームのメンテナンスについて", publishedAt: "2026-05-20T00:00:00Z", body: "<p>システムメンテナンスのため、下記日時にお問い合わせフォームが一時的にご利用いただけません。</p>" },
];

const jobs: Job[] = [
  { id: "j001", title: "Webエンジニア（Next.js / TypeScript）", employmentType: "正社員", location: "東京本社 / フルリモート可", salary: "月給30万円〜 + 賞与年2回", publishedAt: "2026-08-01T00:00:00Z", description: "<p>コーポレートサイト・業務アプリの設計と実装を担当します。Cloudflare / サーバーレス構成での開発が中心です。</p>", requirements: "<ul><li>Web開発の実務経験1年以上、または techMasKOFF LAB. 修了</li><li>TypeScript / React の基礎知識</li></ul>" },
  { id: "j002", title: "SNSマーケター（未経験歓迎）", employmentType: "正社員", location: "東京本社 / フルリモート可", salary: "月給27万円〜 + 各種手当 + 賞与年2回", publishedAt: "2026-07-10T00:00:00Z", description: "<p>自社ブランドおよびクライアントのSNS運用・コンテンツ企画を担当します。入社後は自社カリキュラムで基礎から学べます。</p>", requirements: "<ul><li>学歴・経験不問</li><li>SNSが好きで、数字を見て改善するのが得意な方</li></ul>" },
  { id: "j003", title: "採用コンサルタント（求人広告）", employmentType: "正社員", location: "東京本社", salary: "月給28万円〜 + インセンティブ", publishedAt: "2026-06-01T00:00:00Z", description: "<p>クライアントの採用課題をヒアリングし、媒体提案から原稿制作ディレクションまで担当します。</p>", requirements: "<ul><li>営業または人材業界の経験があれば歓迎</li></ul>" },
];

const faq: Faq[] = [
  { id: "f1", question: "相談や見積もりは無料ですか？", answer: "はい。初回のヒアリングとお見積りは無料です。フォームからご連絡ください。" },
  { id: "f2", question: "地方や海外の企業でも依頼できますか？", answer: "可能です。打ち合わせはオンラインで行い、全国・海外の企業様とお取引しています。" },
  { id: "f3", question: "小規模な案件でも対応してもらえますか？", answer: "対応しています。LP1枚の制作や月数時間のBPOからお受けしています。" },
  { id: "f4", question: "複数の事業をまたいだ依頼はできますか？", answer: "できます。例えばEC構築（WEBアプリ開発）と運用代行（BPO）を組み合わせるなど、ワンストップでご提案します。" },
  { id: "f5", question: "契約期間の縛りはありますか？", answer: "継続型のサービスは月単位でご契約いただけます。最低契約期間は設けていません。" },
  { id: "f6", question: "採用に応募したいのですが、未経験でも大丈夫ですか？", answer: "未経験の方も歓迎しています。techMasKOFF LAB. のカリキュラムで基礎から学べます。" },
];

const members: Member[] = [
  { id: "m1", name: "○○ ○○", role: "代表取締役", bio: "アパレルブランドの立ち上げを経て、20XX年に株式会社MasKOFFを設立。" },
  { id: "m2", name: "○○ ○○", role: "取締役 / 開発責任者", bio: "サーバー・インフラ領域を担当。Webアプリ開発事業と techMasKOFF LAB. を統括。" },
];

export const SAMPLE = { news, notice, jobs, faq, members };
