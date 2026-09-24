type OrgInput = { name: string; url: string; address: string; sns: { instagram: string; x: string } };

/** アカウントの URL か（"https://x.com/" のようなトップページだけの仮値は sameAs に出さない） */
const isAccountUrl = (u: string) => {
  try {
    return new URL(u).pathname.replace(/\/+$/, "").length > 0;
  } catch {
    return false;
  }
};

/** 全ページ共通の Organization（layout.tsx で 1 回だけ出力）。SNS が仮値（パスなし）のときは sameAs を省く */
export function organizationJsonLd(site: OrgInput) {
  const sameAs = [site.sns.instagram, site.sns.x].filter(isAccountUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo.png`,
    address: { "@type": "PostalAddress", addressCountry: "JP", streetAddress: site.address },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export type PostalAddressInput = { postalCode: string; addressRegion: string; addressLocality: string; streetAddress: string };
/** 募集職種 1 件（Google しごと検索の必須: title / description / datePosted / hiringOrganization / jobLocation） */
export type JobPostingInput = {
  title: string;
  /** 仕事内容・応募資格・待遇などの本文（プレーンテキスト。改行可） */
  description: string;
  /** 掲載日 YYYY-MM-DD */
  datePosted: string;
  /** 掲載終了日 YYYY-MM-DD（任意。無期限募集なら省く） */
  validThrough?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN";
  /** 給与（任意）。unit は MONTH / YEAR / HOUR */
  salary?: { min: number; max?: number; unit: "MONTH" | "YEAR" | "HOUR" };
};
type JobSite = { name: string; url: string; postalAddress: PostalAddressInput };

/** RECRUIT の募集職種の JobPosting（CLAUDE.md §10。Google しごと検索）。勤務地は本社住所 */
export function jobPostingJsonLd(job: JobPostingInput, site: JobSite) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    employmentType: job.employmentType,
    hiringOrganization: { "@type": "Organization", name: site.name, sameAs: site.url, logo: `${site.url}/images/logo.png` },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", ...site.postalAddress, addressCountry: "JP" } },
    ...(job.salary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "JPY",
            value: { "@type": "QuantitativeValue", minValue: job.salary.min, ...(job.salary.max ? { maxValue: job.salary.max } : {}), unitText: job.salary.unit },
          },
        }
      : {}),
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
