// サンプル画像を一度だけ生成する（成果物はコミット）。実データが揃ったら public/images を差し替えて削除してよい。
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const P = (...s) => `public/images/${s.join("/")}`;
const pad = (n) => String(n).padStart(2, "0");
const svgToPng = async (svg, path) => sharp(Buffer.from(svg)).png().toFile(path);

// --- ヒーロー: 透過 PNG 15 枚（不揃いなサイズ・シルエット） -------------------
const HERO_COLORS = ["#0a0a0a", "#ff302f", "#6b6b68", "#b3b3b3", "#444444"];
const heroShape = (i, w, h) => {
  const c = HERO_COLORS[i % HERO_COLORS.length];
  const shapes = [
    `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.42}" fill="${c}"/>`,
    `<rect x="${w * 0.15}" y="${h * 0.1}" width="${w * 0.7}" height="${h * 0.8}" rx="${w * 0.12}" fill="${c}"/>`,
    `<polygon points="${w / 2},${h * 0.08} ${w * 0.92},${h * 0.9} ${w * 0.08},${h * 0.9}" fill="${c}"/>`,
    `<path d="M${w * 0.2},${h * 0.3} C${w * 0.1},${h * 0.05} ${w * 0.7},${h * 0.02} ${w * 0.85},${h * 0.3} S${w * 0.95},${h * 0.9} ${w * 0.5},${h * 0.95} S${w * 0.05},${h * 0.7} ${w * 0.2},${h * 0.3}Z" fill="${c}"/>`,
    `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.42}" fill="none" stroke="${c}" stroke-width="${w * 0.12}"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shapes[i % shapes.length]}</svg>`;
};

// --- 汎用: 単色地 + ラベル ------------------------------------------------------
const labelCard = (w, h, bg, fg, label, sub = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <text x="50%" y="52%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${Math.min(w, h) * 0.16}" fill="${fg}">${label}</text>
    ${sub ? `<text x="50%" y="66%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.min(w, h) * 0.06}" fill="${fg}" opacity=".6">${sub}</text>` : ""}
  </svg>`;

await mkdir(P("hero"), { recursive: true });
await mkdir(P("service"), { recursive: true });
await mkdir(P("works"), { recursive: true });
await mkdir(P("partners"), { recursive: true });

const heroSizes = [[720, 820], [640, 640], [860, 700], [600, 900], [760, 760], [700, 620], [880, 880], [640, 760], [720, 720], [800, 600], [660, 860], [760, 640], [700, 700], [820, 740], [640, 680]];
for (let i = 0; i < 15; i++) {
  const [w, h] = heroSizes[i];
  await svgToPng(heroShape(i, w, h), P("hero", `hero-${pad(i + 1)}.png`));
}
for (let i = 1; i <= 8; i++) {
  await svgToPng(labelCard(800, 800, i % 2 ? "#eaeaea" : "#b3b3b3", "#0a0a0a", `SERVICE ${pad(i)}`, "SAMPLE"), P("service", `svc-${pad(i)}.png`));
}
for (let i = 1; i <= 6; i++) {
  await svgToPng(labelCard(400, 400, "#0a0a0a", "#ffffff", String.fromCharCode(64 + i)), P("works", `logo-${pad(i)}.png`));
  for (let k = 1; k <= 5; k++) {
    await svgToPng(labelCard(600, 600, k % 2 ? "#eaeaea" : "#f5f5f4", "#6b6b68", `W${pad(i)}-${k}`), P("works", `w${pad(i)}-${k}.png`));
  }
}
for (let i = 1; i <= 4; i++) {
  await svgToPng(labelCard(1050, 650, i % 2 ? "#444444" : "#6b6b68", "#ffffff", `PARTNER ${pad(i)}`, "SAMPLE"), P("partners", `p${pad(i)}.png`));
  await svgToPng(labelCard(176, 176, "#ffffff", "#0a0a0a", `P${i}`), P("partners", `icon-${pad(i)}.png`));
}
await writeFile(P("README.md"), "# サンプル画像\n\nscripts/gen-sample-assets.mjs で生成した仮画像。実データに差し替えたら `npm run images` で manifest を更新する。\n");
console.log("sample assets generated");
