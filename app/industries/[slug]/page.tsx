import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INDUSTRIES, INDUSTRY_BY_SLUG } from '@/lib/industries';
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
  FAQAccordion,
  FormatGrid,
  InternalLinkBlock,
  Breadcrumb,
} from '@/components/Sections';
import { SchemaScript, breadcrumbSchema, faqSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const industry = INDUSTRY_BY_SLUG[params.slug];
  if (!industry) return {};
  return {
    title: industry.title,
    description: industry.meta,
    alternates: { canonical: `/industries/${industry.slug}/` },
  };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const industry = INDUSTRY_BY_SLUG[params.slug];
  if (!industry) notFound();
  const featuredWork = ALL_WORK_VIDEOS.slice(0, 6);

  return (
    <>
      <SchemaScript
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Industries', url: '/industries/' },
            { name: industry.navLabel, url: `/industries/${industry.slug}/` },
          ]),
          faqSchema(industry.faq),
        ]}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries/' }, { label: industry.navLabel }]} />
        <Eyebrow>{industry.hero.kicker}</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">{industry.hero.headline}</h1>
        <Lead className="max-w-3xl mb-8">{industry.hero.sub}</Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>Why this works</Eyebrow>
            <H2 className="mt-4">{industry.why.h2}</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {industry.why.body.map((p, i) => (
              <p key={i} className="text-lead text-text-700">{p}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Use cases</Eyebrow>
          <H2 className="mt-4">Best for</H2>
        </div>
        <FormatGrid items={industry.useCases} />
      </Section>

      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Formats</Eyebrow>
          <H2 className="mt-4">Formats we produce for {industry.navLabel.toLowerCase()}</H2>
        </div>
        <FormatGrid items={industry.formats} />
      </Section>

      <Section>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <Eyebrow>Examples</Eyebrow>
            <H2 className="mt-4">Recent {industry.navLabel.toLowerCase()} work</H2>
          </div>
          <Button href="/work/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {featuredWork.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Related</Eyebrow>
            <H2 className="mt-4">Explore more.</H2>
          </div>
          <div className="lg:col-span-8">
            <InternalLinkBlock links={industry.internalLinks} />
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>FAQ</Eyebrow>
          <H2 className="mt-4">Common questions.</H2>
        </div>
        <FAQAccordion items={industry.faq} />
      </Section>

      <FinalCTA headline={`Ready to build for your ${industry.navLabel.toLowerCase()}?`} />
    </>
  );
}
