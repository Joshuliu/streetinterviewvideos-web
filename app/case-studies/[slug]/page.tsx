import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CASE_STUDIES, CASE_STUDY_BY_SLUG } from '@/lib/case-studies';
import { ALL_WORK_VIDEOS } from '@/lib/work';
import { VideoTile } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import {
  Section,
  Eyebrow,
  H2,
  Lead,
  TrustLine,
  CTAStack,
  FinalCTA,
  InternalLinkBlock,
  Breadcrumb,
} from '@/components/Sections';
import { SchemaScript, articleSchema, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = CASE_STUDY_BY_SLUG[params.slug];
  if (!c) return {};
  return { title: c.title, description: c.meta, alternates: { canonical: `/case-studies/${c.slug}/` } };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const c = CASE_STUDY_BY_SLUG[params.slug];
  if (!c) notFound();
  const videos = ALL_WORK_VIDEOS.slice(0, 4);

  return (
    <>
      <SchemaScript
        data={[
          articleSchema({ headline: c.h1, url: `/case-studies/${c.slug}/`, description: c.meta }),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Case Studies', url: '/case-studies/' },
            { name: c.h1, url: `/case-studies/${c.slug}/` },
          ]),
        ]}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Case Studies', href: '/case-studies/' }, { label: c.h1 }]} />
        <Eyebrow>Case study</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">{c.h1}</h1>
        <Lead className="max-w-3xl mb-8">{c.cardBlurb}</Lead>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mt-12">
          {[
            { label: 'Client', value: c.client },
            { label: 'Industry', value: c.industry },
            { label: 'Format', value: c.format },
            { label: 'Deliverables', value: c.deliverables },
            { label: 'Timeline', value: c.timeline },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-white p-4 lg:p-5 hover:border-ink-900/30 transition-colors">
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-2">{m.label}</div>
              <div className="text-sm text-ink-900 font-semibold leading-snug">{m.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Challenge</Eyebrow>
            <H2 className="mt-4">The brief.</H2>
          </div>
          <div className="lg:col-span-8 space-y-4">
            {c.challenge.map((p, i) => <p key={i} className="text-lead text-text-700">{p}</p>)}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Format</Eyebrow>
            <H2 className="mt-4">Content format.</H2>
          </div>
          <div className="lg:col-span-8 space-y-3">
            {c.contentFormat.map((p, i) => (
              <p key={i} className="text-text-700 text-lg leading-relaxed flex gap-3">
                <span className="text-accent">→</span>
                <span>{p}</span>
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Production</Eyebrow>
            <H2 className="mt-4">How we shot it.</H2>
          </div>
          <div className="lg:col-span-8 space-y-3">
            {c.productionApproach.map((p, i) => (
              <p key={i} className="text-text-700 text-lg leading-relaxed flex gap-3">
                <span className="text-accent">→</span>
                <span>{p}</span>
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Examples</Eyebrow>
          <H2 className="mt-4">Sample videos from the campaign.</H2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {videos.map((v) => <VideoTile key={v.id} video={v} />)}
        </div>
      </Section>

      {c.results && (
        <Section dark>
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Eyebrow dark>Results</Eyebrow>
              <h2 className="text-h2 font-extrabold tracking-tight mt-4">What happened.</h2>
            </div>
            <div className="lg:col-span-8 space-y-4">
              {c.results.map((p, i) => (
                <p key={i} className="text-white/85 text-lg leading-relaxed flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>{p}</span>
                </p>
              ))}
            </div>
          </div>
        </Section>
      )}

      {c.testNext && (
        <Section>
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Eyebrow>Next</Eyebrow>
              <H2 className="mt-4">What we’d test next.</H2>
            </div>
            <div className="lg:col-span-8 space-y-3">
              {c.testNext.map((p, i) => (
                <p key={i} className="text-text-700 text-lg leading-relaxed flex gap-3">
                  <span className="text-accent">→</span>
                  <span>{p}</span>
                </p>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Related</Eyebrow>
            <H2 className="mt-4">Explore more.</H2>
          </div>
          <div className="lg:col-span-8">
            <InternalLinkBlock links={c.internalLinks} />
          </div>
        </div>
      </Section>

      <FinalCTA headline="Want a campaign like this for your brand?" />
    </>
  );
}
