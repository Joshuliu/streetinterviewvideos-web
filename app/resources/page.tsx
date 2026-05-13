import type { Metadata } from 'next';
import Link from 'next/link';
import { RESOURCE_TOPICS, RESOURCE_ARTICLES } from '@/lib/resources';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Video Resources for Brands',
  description:
    'Guides, examples, and how-tos on street interview videos, UGC ads, branded content, testimonial videos, and short-form social media production.',
  alternates: { canonical: '/resources/' },
};

export default function ResourcesHub() {
  const featured = RESOURCE_ARTICLES.slice(0, 3);

  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Resources', url: '/resources/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Resources' }]} />
        <Eyebrow>Resources</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">
          Resources for better street interview videos and social ad creative.
        </h1>
        <Lead className="max-w-3xl mb-8">
          Guides, examples, scripts, and breakdowns on street interview videos, UGC ads, branded content, testimonial
          videos, and short-form social media production.
        </Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <Eyebrow>Topics</Eyebrow>
        <H2 className="mt-4 mb-10">Five hubs.</H2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {RESOURCE_TOPICS.map((t, i) => (
            <Link
              key={t.slug}
              href={`/resources/${t.slug}/`}
              className="group relative block rounded-2xl bg-white border border-border p-6 lg:p-7 card-hover hover:border-ink-900/30 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-text-400 group-hover:text-accent transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-400 group-hover:bg-accent transition-colors" />
                  Topic {String(i + 1).padStart(2, '0')}
                </div>
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft text-ink-900 group-hover:bg-accent group-hover:text-white transition-all group-hover:translate-x-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
                </span>
              </div>
              <div className="text-lg lg:text-xl font-extrabold text-ink-900 mb-2 leading-tight tracking-tight">{t.navLabel}</div>
              <p className="text-text-700 text-sm leading-relaxed">{t.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Featured articles</Eyebrow>
        <H2 className="mt-4 mb-10">Start with these.</H2>
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {featured.map((a) => (
            <Link
              key={a.slug}
              href={`/resources/${a.topic}/${a.slug}/`}
              className="group relative block rounded-2xl bg-white border border-border p-6 lg:p-7 card-hover hover:border-ink-900/30"
            >
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Article
              </div>
              <div className="text-base lg:text-lg font-extrabold text-ink-900 leading-tight mb-3 tracking-tight">{a.h1}</div>
              <p className="text-text-700 text-sm leading-relaxed line-clamp-3 mb-4">{a.intro}</p>
              <div className="text-sm font-semibold text-ink-900 inline-flex items-center gap-2 group-hover:text-accent transition-colors">
                Read
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
