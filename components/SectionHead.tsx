export function SectionHead({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="section-head">
      <h2>{en}</h2>
      <span className="ja">{ja}</span>
    </div>
  );
}
