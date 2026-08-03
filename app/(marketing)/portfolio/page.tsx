import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { PortfolioGallery } from '@/components/PortfolioGallery';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';
import { getPortfolioVideos } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Portfolio | StreetInterviewVideos.com',
  description:
    'Recent street interview videos, UGC ads, testimonial videos, and branded content for 700+ brands. Real reactions. Social-first formats.',
  alternates: { canonical: '/portfolio/' },
};

export default async function PortfolioHub() {
  const videos = await getPortfolioVideos();
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/portfolio/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Portfolio' }]} />
        <Eyebrow>Recent work</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Street interview video examples.</h1>
        <Lead className="max-w-3xl mb-8">
          Recent street interview campaigns, UGC ads, testimonial videos, and branded content produced for brands across
          e-commerce, beauty, food, apps, and local.
        </Lead>
        <CTAStack secondaryHref="/contact/" secondaryLabel="Send a Brief" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <PortfolioGallery videos={videos} />

      {/* How to read this portfolio, moved below grid, collapsible. */}
      <Section className="bg-paper-soft">
        <details className="group">
          <summary className="flex justify-between items-start gap-4 cursor-pointer list-none">
            <div className="max-w-3xl">
              <Eyebrow>What you’re seeing</Eyebrow>
              <H2 className="mt-4 group-hover:text-accent transition-colors">
                How to read this portfolio.
              </H2>
            </div>
            <span className="shrink-0 mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-900 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all group-open:bg-accent group-open:text-white group-open:border-accent">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-open:rotate-45">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
            </span>
          </summary>
          <div className="mt-8 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Lead>
                Every video above is real client work, produced for paying brands and shipped to live ad accounts or
                active social channels. Some are scripted, some unscripted, some hybrid. All vertical, all built for
                short-form platforms, all designed to read as native content rather than as commercials.
              </Lead>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <p className="text-lead text-text-700">
                When you’re evaluating examples, look at the first three seconds first. The hook is what carries the
                rest of the ad on cold paid traffic. If the opener stops your scroll on this page, it stops it in a feed
                too. Then look at the on-camera subject: is this a real person you’d believe, or a polished talent
                read?
              </p>
              <p className="text-lead text-text-700">
                The campaigns represented span paid video ads, organic social drops, testimonial-style videos,
                branded content for top-of-funnel awareness, event activations, and product launches. The format stays
                consistent. The use case changes per brand.
              </p>
            </div>
          </div>
        </details>
      </Section>

      <FinalCTA />
    </>
  );
}
