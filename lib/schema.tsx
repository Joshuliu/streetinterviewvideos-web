import { SITE } from './site';

export const orgSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo.svg`,
  sameAs: [SITE.social.instagram, SITE.social.tiktok, SITE.social.youtube, SITE.social.linkedin],
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE.url}${item.url}`,
  })),
});

export const serviceSchema = (s: { name: string; description: string; url: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: s.name,
  provider: { '@type': 'Organization', name: SITE.name },
  areaServed: 'US',
  description: s.description,
  url: `${SITE.url}${s.url}`,
});

export const faqSchema = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
});

export const articleSchema = (a: { headline: string; url: string; description: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.headline,
  description: a.description,
  url: `${SITE.url}${a.url}`,
  author: { '@type': 'Organization', name: SITE.name },
  publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.svg` } },
});

export const aggregateRatingSchema = (count: number, rating = 4.9) => ({
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  ratingValue: rating,
  reviewCount: count,
});

export const SchemaScript = ({ data }: { data: object | object[] }) => {
  const json = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
};
