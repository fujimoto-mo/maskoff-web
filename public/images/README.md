# サンプル画像

scripts/gen-sample-assets.mjs で生成した仮画像。実データに差し替えたら `npm run images` で manifest を更新する。

生成物（`optimized/` と `src/lib/images/manifest.json`）はリポジトリにコミットする（Pages のビルド時間を安定させるため、ビルドでは生成しない）。画像を追加・差し替えたら `npm run images` を実行して生成物ごとコミットする。
