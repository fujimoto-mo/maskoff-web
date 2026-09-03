/**
 * VISION 相関図（立方体）の 3 面。順序 = 上面 / 左面 / 右面（VisionDiagram の引き出し線・配置と対応）。
 * code は面に大きく載る英字、items は引き出し線の先に並ぶ事業名。
 */
export const VISION_FACES = [
  { code: "HR", items: ["人材育成", "求人広告代理店事業", "キャリア支援事業"] },
  { code: "IT", items: ["WEBアプリ開発事業", "海外越境ECサービス導入支援"] },
  {
    code: "RC",
    items: ["アパレルコンサルティング事業", "求人広告代理店事業", "BPO事業"],
  },
] as const;
