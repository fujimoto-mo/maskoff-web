/** キーボード利用者向け。フォーカス時だけ左上に現れる */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-pill focus:bg-fg focus:px-4 focus:py-2 focus:text-fg-invert"
    >
      本文へスキップ
    </a>
  );
}
