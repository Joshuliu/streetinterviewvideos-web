import type { Metadata } from 'next';
import Link from 'next/link';
import { INDUSTRIES } from '@/lib/industries';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Videos for Every Type of Brand',
  description:
    'Street interview videos and short-form ad creative for e-commerce, beauty, food & beverage, apps, events, and local businesses.',
  alternates: { canonical: '/industries/' },
};

export default function IndustriesHub() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Industries' }]} />
        <Eyebrow>Industries</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Street interview videos for every type of brand.</h1>
        <Lead className="max-w-3xl mb-8">
          We work with DTC and e-commerce brands, beauty brands, food and beverage, apps, SaaS, events, activations, and
          local businesses. The format is the same. The angle is what changes.
        </Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.slug}
              href={`/industries/${i.slug}/`}
              className="group relative block rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover hover:border-ink-900/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-text-400 group-hover:text-accent transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-400 group-hover:bg-accent transition-colors" />
                  Industry
                </div>
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft text-ink-900 group-hover:bg-accent group-hover:text-white transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
                </span>
              </div>
              <div className="text-lg lg:text-xl font-extrabold text-ink-900 mb-2 tracking-tight">{i.navLabel}</div>
              <p className="text-text-700 text-sm leading-relaxed">{i.cardBlurb}</p>
            </Link>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
