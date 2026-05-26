import type { Metadata } from 'next';
import { ALL_WORK_VIDEOS } from '@/lib/work';
import { VideoCard, VideoTile } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Portfolio | StreetInterviewVideos.com',
  description:
    'Recent street interview videos, UGC ads, testimonial videos, and branded content for 600+ brands. Real reactions. Social-first formats.',
  alternates: { canonical: '/work/' },
};

export default function WorkHub() {
  // Featured pair: top unscripted + top scripted in Neil's preferred order.
  const topUnscripted = ALL_WORK_VIDEOS.find((v) => v.kind === 'unscripted');
  const topScripted = ALL_WORK_VIDEOS.find((v) => v.kind === 'scripted');
  const featured = [topUnscripted, topScripted].filter(Boolean) as typeof ALL_WORK_VIDEOS;
  const featuredIds = new Set(featured.map((v) => v.id));
  const grid = ALL_WORK_VIDEOS.filter((v) => !featuredIds.has(v.id));

  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/work/' }])} />

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

      {/* Featured: one unscripted + one scripted, side by side */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Featured</Eyebrow>
          <H2 className="mt-4">One unscripted, one scripted.</H2>
          <Lead className="mt-4">
            Two top picks from the library — one real-stranger unscripted, one actor-led scripted — so you can compare
            the two paths side by side.
          </Lead>
        </div>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {featured.map((v) => (
            <article
              key={v.id}
              className="rounded-3xl border border-border bg-white p-5 lg:p-6 card-hover"
            >
              <VideoCard video={v} accent />
              <div className="mt-5">
                <div className="text-xs uppercase tracking-widest text-text-400 mb-2">
                  {v.kind === 'unscripted' ? 'Unscripted · ' : 'Scripted · '}{v.category}
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-3">{v.title}</h3>
                <p className="text-text-700 text-sm leading-relaxed mb-3">
                  <span className="font-semibold text-ink-900">Goal:</span> {v.goal}
                </p>
                <p className="text-text-700 text-sm leading-relaxed mb-3">
                  <span className="font-semibold text-ink-900">Format:</span> {v.format}
                </p>
                <p className="text-text-700 text-sm leading-relaxed mb-4">
                  <span className="font-semibold text-ink-900">Why it worked:</span> {v.whyItWorked}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/contact/" variant="primary">Book a Similar Campaign</Button>
        </div>
      </Section>

      {/* Grid */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>The library</Eyebrow>
          <H2 className="mt-4">The full library</H2>
          <Lead className="mt-4">
            Every video below is real client work, produced for paying brands and shipped to live ad accounts or active
            social channels. Scroll the whole library or jump straight to a brief.
          </Lead>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {grid.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      {/* HOW TO READ — moved below grid, collapsible to keep the focus on the work */}
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
                The campaigns represented span paid video ads, organic social drops, customer testimonial videos,
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
