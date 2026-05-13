import type { Metadata } from 'next';
import Link from 'next/link';
import { WORK_CATEGORIES, ALL_WORK_VIDEOS } from '@/lib/work';
import { VideoCard, VideoTile } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Video Portfolio | Recent Work',
  description:
    'Recent street interview videos, UGC ads, testimonial videos, and branded content for 600+ brands. Real reactions. Social-first formats.',
  alternates: { canonical: '/work/' },
};

export default function WorkHub() {
  const featured = ALL_WORK_VIDEOS[0];
  const grid = ALL_WORK_VIDEOS.slice(1);

  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Work', url: '/work/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Work' }]} />
        <Eyebrow>Recent work</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Street interview video examples.</h1>
        <Lead className="max-w-3xl mb-8">
          Recent street interview campaigns, UGC ads, testimonial videos, and branded content produced for brands across
          e-commerce, beauty, food, apps, and local.
        </Lead>
        <CTAStack secondaryHref="/case-studies/" secondaryLabel="View Case Studies" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {/* Filter chips */}
      <Section className="bg-paper-soft py-8 lg:py-10">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-text-400 mr-2">Filter:</span>
          <Link href="/work/" className="rounded-pill px-4 py-2 text-sm bg-ink-900 text-white">All</Link>
          {WORK_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/work/${c.slug}/`}
              className="rounded-pill px-4 py-2 text-sm bg-white border border-border text-ink-900 hover:border-ink-900"
            >
              {c.navLabel}
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Featured</Eyebrow>
          <H2 className="mt-4">A favorite from the library.</H2>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <VideoCard video={featured} accent />
          </div>
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-widest text-text-400 mb-3">{featured.category}</div>
            <h3 className="text-h2 font-extrabold tracking-tight mb-4">{featured.title}</h3>
            <p className="text-lead text-text-700 mb-4"><span className="font-semibold text-ink-900">Goal:</span> {featured.goal}</p>
            <p className="text-text-700 mb-4"><span className="font-semibold text-ink-900">Format:</span> {featured.format}</p>
            <p className="text-text-700 mb-4"><span className="font-semibold text-ink-900">Deliverables:</span> {featured.deliverables}</p>
            <p className="text-text-700 mb-8"><span className="font-semibold text-ink-900">Why it worked:</span> {featured.whyItWorked}</p>
            <Button href="/contact/" variant="primary">Book a Similar Campaign</Button>
          </div>
        </div>
      </Section>

      {/* Grid */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>The library</Eyebrow>
          <H2 className="mt-4">More recent work</H2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {grid.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
