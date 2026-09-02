type OrgInput = { name: string; url: string; address: string; sns: { instagram: string; x: string } };

/** 全ページ共通の Organization（layout.tsx で 1 回だけ出力） */
export function organizationJsonLd(site: OrgInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo.png`,
    address: { "@type": "PostalAddress", addressCountry: "JP", streetAddress: site.address },
    sameAs: [site.sns.instagram, site.sns.x],
  };
}

/** FAQ セクションの FAQPage。注記（note）は含めない */
export function faqPageJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

/** 下層ページのパンくず（CLAUDE.md §10）。items は HOME を含めた順序どおり */
export function breadcrumbJsonLd(items: ReadonlyArray<{ name: string; path: string }>, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`,
    })),
  };
}
