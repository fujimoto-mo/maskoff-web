// SAMPLE: microCMS 未接続時に使うサンプル。文言はすべて仮。
import type { News, Notice, Faq, Member, Job } from "@/types/microcms";

const base = (id: string, date: string) => ({ id, createdAt: date, updatedAt: date, publishedAt: date, revisedAt: date });

const news: News[] = [
  { ...base("n001", "2026-08-31T00:00:00.000Z"), title: "コーポレートサイトをリニューアルしました", slug: "renewal-2026", category: ["press"], publishedDate: "2026-08-31T00:00:00.000Z", excerpt: "事業内容と採用情報を整理し、お問い合わせ導線を改善しました。", body: "<p>株式会社MasKOFFは本日、コーポレートサイトを全面リニューアルしました。</p>" },
  { ...base("n002", "2026-07-15T00:00:00.000Z"), title: "自社ブランドの 2026 秋冬コレクションを発表", slug: "aw2026", category: ["works"], publishedDate: "2026-07-15T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
  { ...base("n003", "2026-06-02T00:00:00.000Z"), title: "業界誌にアパレル OEM の取り組みが掲載されました", slug: "media-2026-06", category: ["media"], publishedDate: "2026-06-02T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
  { ...base("n004", "2026-04-10T00:00:00.000Z"), title: "アーティスト支援プログラム第 2 期の参加者を募集", slug: "artist-program-2", category: ["event"], publishedDate: "2026-04-10T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
];

const notice: Notice[] = [
  { ...base("t001", "2026-08-01T00:00:00.000Z"), title: "夏季休業のお知らせ（8/13〜8/16）", slug: "summer-2026", level: ["important"], isPinned: true, publishedDate: "2026-08-01T00:00:00.000Z", body: "<p>誠に勝手ながら、下記期間を夏季休業とさせていただきます。</p>" },
  { ...base("t002", "2026-05-20T00:00:00.000Z"), title: "お問い合わせフォームのメンテナンスについて", slug: "maintenance-2026-05", level: ["normal"], publishedDate: "2026-05-20T00:00:00.000Z", body: "<p>サンプル本文。</p>" },
];

const faq: Faq[] = [
  { ...base("f1", "2026-01-01T00:00:00.000Z"), question: "相談や見積もりは無料ですか?", answer: "はい。初回のヒアリングとお見積りは無料です。フォームからご連絡ください。", category: ["price"], order: 1 },
  { ...base("f2", "2026-01-01T00:00:00.000Z"), question: "地方や海外からでも依頼できますか?", answer: "可能です。打ち合わせはオンラインで行い、全国・海外のお客様とお取引しています。", category: ["flow"], order: 2 },
  { ...base("f3", "2026-01-01T00:00:00.000Z"), question: "小ロットのアパレル製造にも対応していますか?", answer: "対応しています。企画からサンプル制作、量産まで一貫してお受けします。", note: "※ 素材や仕様によって最小ロットが異なります。", category: ["service"], order: 3 },
  { ...base("f4", "2026-01-01T00:00:00.000Z"), question: "ホームページ制作の期間はどれくらいですか?", answer: "規模によりますが、コーポレートサイトで 1.5〜3 か月が目安です。", category: ["flow"], order: 4 },
  { ...base("f5", "2026-01-01T00:00:00.000Z"), question: "アーティスト活動支援とは何をしてもらえますか?", answer: "グッズ製作、EC 構築、イベント出展のサポートなど、活動に必要な実務を伴走します。", category: ["service"], order: 5 },
  { ...base("f6", "2026-01-01T00:00:00.000Z"), question: "未経験でも採用に応募できますか?", answer: "できます。学歴・経験不問で、入社後に基礎から学べる体制があります。", category: ["recruit"], order: 6 },
];

const members: Member[] = [
  { ...base("m1", "2026-01-01T00:00:00.000Z"), name: "○○ ○○", slug: "ceo", role: "代表取締役", avatar: { url: "/images/works/logo-01.png", width: 400, height: 400 }, bio: "アパレルブランドの立ち上げを経て、株式会社MasKOFFを設立。", order: 1 },
  { ...base("m2", "2026-01-01T00:00:00.000Z"), name: "○○ ○○", slug: "director", role: "取締役 / クリエイティブ", avatar: { url: "/images/works/logo-02.png", width: 400, height: 400 }, bio: "Web 制作とアーティスト支援を統括。", order: 2 },
];

const jobs: Job[] = [
  { ...base("j001", "2026-08-01T00:00:00.000Z"), title: "Web エンジニア", slug: "web-engineer", employmentType: ["FULL_TIME"], description: "<p>コーポレートサイト・EC の設計と実装。</p>", requirements: "<ul><li>Web 開発の実務経験 1 年以上</li></ul>", workLocation: "東京本社 / フルリモート可", isOpen: true, order: 1 },
  { ...base("j002", "2026-07-10T00:00:00.000Z"), title: "アパレル企画", slug: "apparel-planner", employmentType: ["FULL_TIME"], description: "<p>自社ブランドと OEM の企画・生産管理。</p>", requirements: "<ul><li>学歴・経験不問</li></ul>", workLocation: "東京本社", isOpen: true, order: 2 },
  { ...base("j003", "2026-06-01T00:00:00.000Z"), title: "アーティスト支援コーディネーター", slug: "artist-coordinator", employmentType: ["CONTRACTOR"], description: "<p>アーティストの活動計画づくりとイベント運営。</p>", requirements: "<ul><li>イベント運営経験があれば歓迎</li></ul>", workLocation: "東京本社", isOpen: true, order: 3 },
];

export const SAMPLE = { news, notice, faq, members, jobs };
