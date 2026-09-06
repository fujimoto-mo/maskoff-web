// worker/index.ts → out/_worker.js（Cloudflare Pages Advanced mode 用の単一ファイル）と out/_routes.json を生成する。
// 必ず `next build` の後に実行する（next build が out/ を作り直すため）。
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { routesJson } from "../worker/routes.ts";

const OUT = "out";
await mkdir(OUT, { recursive: true });
await build({
  entryPoints: ["worker/index.ts"],
  outfile: `${OUT}/_worker.js`,
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  minify: false,
  sourcemap: false,
  logLevel: "info",
});
await writeFile(`${OUT}/_routes.json`, JSON.stringify(routesJson(), null, 2) + "\n");
console.log(`wrote ${OUT}/_worker.js and ${OUT}/_routes.json`);
