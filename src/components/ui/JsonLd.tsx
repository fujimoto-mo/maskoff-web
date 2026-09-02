/** 構造化データを <script type="application/ld+json"> で出力する。 @example <JsonLd data={organizationJsonLd(SITE)} /> */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
