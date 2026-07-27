import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_WORK_VIDEOS } from '@/lib/work';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { PortfolioGallery } from '@/components/PortfolioGallery';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

// Each video in the library gets its own static URL. The page renders the
// same portfolio UI as /portfolio/ but the gallery opens the matching video's
// lightbox on landing, so brand-side links like /portfolio/mott-bow drop
// recipients straight into the video.
export function generateStaticParams() {
  return ALL_WORK_VIDEOS.map((v) => ({ slug: v.id }));
}

export const dynamicParams = false;

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  const video = ALL_WORK_VIDEOS.find((v) => v.id === params.slug);
  if (!video) return {};
  return {
    title: `${video.title} | Portfolio | StreetInterviewVideos.com`,
    description: video.whyItWorked,
    alternates: { canonical: `/portfolio/${video.id}/` },
    openGraph: {
      title: `${video.title} | Portfolio`,
      description: video.whyItWorked,
      images: [{ url: video.poster }],
      videos: [{ url: video.src }],
      type: 'video.other',
    },
  };
}

export default function PortfolioVideoPage({ params }: Params) {
  const video = ALL_WORK_VIDEOS.find((v) => v.id === params.slug);
  if (!video) notFound();

  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Portfolio', url: '/portfolio/' }, { name: video.title, url: `/portfolio/${video.id}/` }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Portfolio', href: '/portfolio/' }, { label: video.title }]} />
        <Eyebrow>{video.kind === 'unscripted' ? 'Unscripted' : 'Scripted'} · {video.category}</Eyebrow>
        <h1 className="text-display-2 headline-display mt-5 mb-6">{video.title}</h1>
        <Lead className="max-w-3xl mb-8">{video.whyItWorked}</Lead>
        <CTAStack secondaryHref="/portfolio/" secondaryLabel="See full portfolio" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <PortfolioGallery initialOpenSlug={video.id} />

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
            </div>
          </div>
        </details>
      </Section>

      <FinalCTA />
    </>
  );
}
