// SAMPLE: CLAUDE.md §1 の 3 事業（アパレル / アーティスト支援 / ホームページ制作）を 8 サービスに展開した仮データ。
// 詳細ページ用の本文はフェーズ②で追加する。
export type Service = {
  slug: string;
  /** バッジに入る動詞。4 文字以内（86px の丸に収める） */
  verb: string;
  title: string;
  /** 一覧カード用 1〜2 行 */
  lead: string;
  /** 正方形。public/images/service/ */
  image: string;
};

export const SERVICES: readonly Service[] = [
  { slug: "apparel-brand", verb: "まとう", title: "自社ブランド企画・販売", lead: "素の自分を引き出すオリジナルブランドを、企画からEC販売まで自社で手がけます。", image: "/images/service/svc-01.png" },
  { slug: "apparel-oem", verb: "つくる", title: "アパレル OEM・小ロット製造", lead: "サンプル1点から量産まで。素材選びと工場調整を含めて一貫して伴走します。", image: "/images/service/svc-02.png" },
  { slug: "artist-goods", verb: "かたちに", title: "アーティストグッズ製作", lead: "作品をTシャツやグッズに。版下調整から生産、納品までをまとめてお受けします。", image: "/images/service/svc-03.png" },
  { slug: "artist-support", verb: "ささえる", title: "アーティスト活動支援", lead: "EC開設・イベント出展・物販運営など、制作以外の実務を引き受けます。", image: "/images/service/svc-04.png" },
  { slug: "web-corporate", verb: "つたえる", title: "コーポレートサイト制作", lead: "表示速度と検索対策を標準装備した、月額コスト0円で運用できるサイトを作ります。", image: "/images/service/svc-05.png" },
  { slug: "web-ec", verb: "ひらく", title: "EC サイト構築", lead: "ブランドの世界観を損なわないECを構築し、公開後の改善まで続けます。", image: "/images/service/svc-06.png" },
  { slug: "branding", verb: "みつける", title: "ブランディング・ロゴ", lead: "言葉とビジュアルで「素」を定義し、名刺からWebまで一貫した印象を作ります。", image: "/images/service/svc-07.png" },
  { slug: "sns-marketing", verb: "ひろげる", title: "SNS 運用支援", lead: "投稿設計からレポートまで。数字ではなく作品で見つけてもらう運用を組み立てます。", image: "/images/service/svc-08.png" },
];
