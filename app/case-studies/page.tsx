import type { Metadata } from 'next';
import Link from 'next/link';
import { CASE_STUDIES } from '@/lib/case-studies';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Video Case Studies',
  description:
    'Case studies on how brands used street interview videos for product launches, paid ads, event activations, and app campaigns.',
  alternates: { canonical: '/case-studies/' },
};

export default function CaseStudiesHub() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Case Studies', url: '/case-studies/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Case Studies' }]} />
        <Eyebrow>Case studies</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Street interview video case studies.</h1>
        <Lead className="max-w-3xl mb-8">
          How brands used street interview videos for product launches, paid ads, event activations, and app campaigns.
        </Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {CASE_STUDIES.map((c) => (
            <Link
              key={c.slug}
              href={`/case-studies/${c.slug}/`}
              className="group relative rounded-2xl bg-white border border-border p-7 lg:p-8 card-hover hover:border-ink-900/30 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-ink-900 text-white">{c.industry}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-paper-soft text-ink-900 border border-border">{c.format}</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-ink-900 leading-tight mb-3 tracking-tight">{c.h1}</h2>
              <p className="text-text-700 leading-relaxed mb-6">{c.cardBlurb}</p>
              <div className="text-sm font-semibold text-ink-900 inline-flex items-center gap-2 group-hover:text-accent transition-colors">
                Read case study
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
