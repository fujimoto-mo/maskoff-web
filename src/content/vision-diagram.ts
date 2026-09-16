/**
 * VISION 相関図（立方体）の 3 面。順序 = 上面 / 左面 / 右面（VisionDiagram の引き出し線・配置と対応）。
 * code は面に大きく載る英字（2 文字）。en / ja は引き出し線の先のブロックの見出し（英字の領域名と和文の事業名）、
 * items はその領域で提供しているサービス（4 つ）。9 事業（lib/services.ts）を「人を見つける（HR）/ 届ける（Marketing）/ 形にする（Creative）」の 3 領域に束ねる。
 * 文字数の上限: 上面（HR）のブロックは PC で列の右端までの幅が狭い（1440px で約 165px = 15px 換算 11 文字）ため ja と items は 9 文字以内。
 * 右面（Creative）のブロックは 17 文字まで。左面（Marketing）は左へ伸びるので余裕がある（SP では各列 14 文字で折り返す）。
 */
export const VISION_FACES = [
  {
    code: "HR",
    en: "Human Recruiting",
    ja: "人材・採用支援事業",
    items: ["人材育成(techMasKLab.Project)", "求人広告採用支援", "キャリア支援", "BPO事業"],
  },
  {
    code: "MK",
    en: "Marketing",
    ja: "マーケティング事業",
    items: ["飲食店向けサービス TiPLY", "販売戦略・ブランディング", "SNSマーケティング", "海外越境EC導入支援"],
  },
  {
    code: "CR",
    en: "Creative",
    ja: "クリエイティブ事業",
    items: ["WEBサイト・アプリ開発", "ITツール導入・DX支援", "アパレル企画・OEM/ODM", "アーティスト活動支援"],
  },
] as const;
