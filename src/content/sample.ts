// SAMPLE: microCMS 未接続時に使うサンプル。文言はすべて仮。
import type { News, Notice, Faq, Member, Job } from "@/types/microcms";

const base = (id: string, date: string) => ({ id, createdAt: date, updatedAt: date, publishedAt: date, revisedAt: date });

const news: News[] = [
  {
    ...base("n100", "2026-09-02T00:00:00.000Z"),
    title: "コーポレートサイトをリニューアルしました",
    slug: "renewal-2026",
    category: ["press"],
    publishedDate: "2026-09-09T00:00:00.000Z",
    body:
      "<p>株式会社MasKOFFのコーポレートサイトをリニューアルしました。</p>" +
      "<p>ブランドの世界観を体験いただけるトップページ、会社情報・採用情報の拡充など、コンテンツを一新しています。<br>今後も新ブランドやインタビューなどの情報を随時発信してまいります。引き続きよろしくお願いいたします。</p>",
  },
  // 現行サイト https://maskoff.co.jp/news の実データ（2026-09-02 取得。日付は仮 — 現行に表記なし）
  {
    ...base("n101", "2026-07-15T00:00:00.000Z"),
    title: "MasKOFFカリキュラム生 鳥海さんインタビュー",
    slug: "interview-toriumi",
    category: ["interview"],
    publishedDate: "2025-10-01T00:00:00.000Z",
    thumbnail: { url: "/images/news/interview-toriumi.png", width: 1280, height: 670 },
    body:
      "<p>MasKOFFのカリキュラム生である鳥海さんにインタビューしました！</p>" +
      "<p><strong>【鳥海さん、自己紹介をお願いします！】</strong></p>" +
      "<p>京都出身で、現在23歳です。<br>趣味はファッションと音楽です。旅行に行くのも好きです！<br>高校卒業後は、ずっとアパレルショップの店員として働いていました。<br>昔からファッションが大好きで、「東京でファッションに関わる仕事がしたい」と思い、求人を探していたときにMasKOFFを見つけました。<br>現在は、自分のオリジナルブランドを立ち上げることを目標に、働きながら学べるカリキュラム生として日々勉強しています。</p>" +
      "<p><strong>【MasKOFFを知ったキッカケは？】</strong></p>" +
      "<p>ずっとファッション業界で働いてきたので、この先もファッションに関わる仕事がしたいと思っていました。<br>もともとSNSでファッションを発信することが好きだったので、「SNSを通じてファッションの魅力を伝える仕事」に興味を持つようになりました。<br>そんなときに「エン転職」でSNSマーケターの求人を探していて、MasKOFFを見つけました。<br>求人を見て、「カッコいい！」「おしゃれな会社だな」と一番に思いました！<br>特に“新たな個性をさらけだす”という言葉に惹かれ、「ここで働きたい！」と強く思い、気付いたら応募してました（笑）</p>" +
      "<p><strong>【MasKOFFのメンバーの印象は？】</strong></p>" +
      "<p>とにかく皆さん、おしゃれでカッコいいです！（笑）<br>見た目だけでなく、考え方や仕事に対する姿勢も本当に素敵で、清潔感があってファッションへのこだわりもすごいんです。<br>SNSマーケターやファッションデザイナーの方々がテキパキ仕事をこなしている姿を見ると、「私もこうなりたい！」と憧れがどんどん増していく一方です…！</p>" +
      "<p><strong>【将来の目標を教えてください！】</strong></p>" +
      "<p>先日、プレゼンの機会をいただき、アドバイスを参考にしながら企画を磨くのはとても楽しかったです！<br>将来的にはMasKOFFでオリジナルブランドを立ち上げ、DotHyphenのように海外の方にも愛されるブランドを運営していきたいです！</p>" +
      "<p><strong>【最後にひとこと】</strong></p>" +
      "<p>MasKOFFは勢いがある会社だと、入社をして感じました。<br>刺激的な環境の中で、周りに負けないよう日々成長を意識しています！<br>MasKOFFの目指すビジョンにも素敵だなと感じていて、私自身もいつかブランドを立ち上げ、SNSを通じて発信していけるように努力していきたいです。<br>これからも全力でがんばります！！</p>" +
      "<p>MasKOFF カリキュラム生　鳥海 結衣</p>",
  },
  {
    ...base("n102", "2025-11-21T00:00:00.000Z"),
    title: "DotHyphen -Hang Out- Collection “DotHyphen” World wide shipping",
    slug: "dothyphen-hang-out-collection",
    category: ["brand"],
    publishedDate: "2026-05-01T00:00:00.000Z",
    thumbnail: { url: "/images/news/dothyphen-hang-out.jpg", width: 1200, height: 1000 },
    body:
      "<p><strong>DotHyphen</strong><br>-Hang Out-Collection-<br>“DotHyphen” World wide shipping</p>" +
      '<p><a href="https://dothyphen.store/" target="_blank" rel="noopener">DotHyphen Online Store</a><br>' +
      '<a href="https://www.instagram.com/dhh._officialstore" target="_blank" rel="noopener">Instagram（@dhh._officialstore）</a></p>',
  },
];


const notice: Notice[] = [
  // 現行サイト https://maskoff.co.jp/topic/kvnIjUYw の実データ（2026-09-02 取得）
  {
    ...base("t101", "2026-06-02T00:00:00.000Z"),
    title: "告知・注意喚起",
    slug: "caution-similar-name",
    level: ["important"],
    publishedDate: "2026-06-02T00:00:00.000Z",
    body:
      "<p><strong>【重要なお知らせ】</strong></p>" +
      "<p>現在、インターネット上において、当社「株式会社MasKOFF」と同一または類似の名称を使用している事業者のウェブサイトが確認されております。</p>" +
      "<p>これらの事業者・ウェブサイトは、当社とは一切関係ございません。</p>" +
      "<p>当社が提供するサービス・商品・採用活動などに関する情報は、当社公式ウェブサイトおよび当社からの正式なご案内をご確認くださいますようお願いいたします。</p>" +
      "<p>万が一、当社を装った不審な連絡や、当社との関係についてご不明な点がございましたら、お手数ですが当社までお問い合わせください。</p>" +
      "<p>お客様ならびに関係者の皆様におかれましては、十分ご注意くださいますようお願い申し上げます。</p>",
  },
  {
    ...base("t102", "2025-09-12T00:00:00.000Z"),
    title: "【重要】弊社名を騙った不審なメールにご注意ください",
    slug: "caution-phishing-mail",
    level: ["important"],
    publishedDate: "2025-09-12T00:00:00.000Z",
    body:
      "<p>現在、弊社名を装った第三者による不審なメールが送信されている事例が確認されております。<br>これらのメールは、弊社の正式な連絡とは異なる可能性がございます。</p>" +
      "<p>弊社からのご連絡であっても、内容に心当たりがない場合や不審に感じられる場合は、<br>本文記載のURLや添付ファイルの開封・操作については十分ご注意ください。</p>" +
      "<p>ご不明な点がございましたら、当社公式ウェブサイトのお問い合わせフォームよりご確認くださいますようお願いいたします。</p>",
  },
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
