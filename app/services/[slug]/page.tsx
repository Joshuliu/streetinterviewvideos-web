import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES, SERVICE_BY_SLUG } from '@/lib/services';
import { ALL_WORK_VIDEOS } from '@/lib/work';
import { VideoTile } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import { ServiceCard } from '@/components/ServiceCard';
import {
  Section,
  Eyebrow,
  H2,
  Lead,
  TrustLine,
  CTAStack,
  FinalCTA,
  ProcessSteps,
  FAQAccordion,
  CompareTwoCol,
  PillarCards,
  FormatGrid,
  CheckList,
  InternalLinkBlock,
  Breadcrumb,
} from '@/components/Sections';
import { SITE, CTA } from '@/lib/site';
import { SchemaScript, serviceSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = SERVICE_BY_SLUG[params.slug];
  if (!service) return {};
  return {
    title: service.title,
    description: service.meta,
    alternates: { canonical: `/services/${service.slug}/` },
    openGraph: { title: service.title, description: service.meta, url: `/services/${service.slug}/`, type: 'website' },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICE_BY_SLUG[params.slug];
  if (!service) notFound();

  const related = service.related.map((s) => SERVICE_BY_SLUG[s]).filter(Boolean);
  const featuredWork = ALL_WORK_VIDEOS.slice(0, 6);

  return (
    <>
      <SchemaScript
        data={[
          serviceSchema({ name: service.h1, description: service.meta, url: `/services/${service.slug}/` }),
          faqSchema(service.faq),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services/' },
            { name: service.shortLabel, url: `/services/${service.slug}/` },
          ]),
        ]}
      />

      {/* HERO */}
      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: service.shortLabel }]} />
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Eyebrow>{service.hero.kicker}</Eyebrow>
            <h1 className="text-display-1 headline-display mt-5 mb-6">
              {service.hero.headline}
            </h1>
            <Lead className="max-w-2xl mb-8">{service.hero.sub}</Lead>
            <CTAStack secondaryHref="/work/" secondaryLabel={CTA.examples} />
            <div className="mt-8"><TrustLine /></div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {featuredWork.slice(0, 4).map((v) => (
              <VideoTile key={v.id} video={v} />
            ))}
          </div>
        </div>
      </Section>

      {/* PROBLEM */}
      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>The problem</Eyebrow>
            <H2 className="mt-4">{service.problem.h2}</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {service.problem.body.map((p, i) => (
              <p key={i} className="text-lead text-text-700">{p}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* SOLUTION */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>How we do it</Eyebrow>
          <H2 className="mt-4">{service.solution.h2}</H2>
        </div>
        <PillarCards pillars={service.solution.pillars} />
      </Section>

      {/* FORMATS */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Formats</Eyebrow>
          <H2 className="mt-4">{service.formats.h2}</H2>
        </div>
        <FormatGrid items={service.formats.items} />
      </Section>

      {/* USE CASES */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Use cases</Eyebrow>
          <H2 className="mt-4">{service.useCases.h2}</H2>
        </div>
        <FormatGrid items={service.useCases.items} />
      </Section>

      {/* EXAMPLES */}
      <Section className="bg-paper-soft">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <Eyebrow>Examples</Eyebrow>
            <H2 className="mt-4">Recent {service.shortLabel.toLowerCase()} work</H2>
            <Lead className="mt-3">{service.examplesIntro}</Lead>
          </div>
          <Button href="/work/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {featuredWork.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      {/* INCLUDED */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What you get</Eyebrow>
            <H2 className="mt-4">Every package, every time.</H2>
            <Lead className="mt-4">No surprises. The deliverable list is the same baseline across packages — packages differ on volume, hooks, and turnaround.</Lead>
          </div>
          <div className="lg:col-span-7">
            <CheckList items={service.included} />
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Process</Eyebrow>
          <H2 className="mt-4">From brief to ad-ready in as little as 5–10 days.</H2>
        </div>
        {service.process && <ProcessSteps steps={service.process} />}
      </Section>

      {/* SCRIPTED VS UNSCRIPTED (only for street interview pages) */}
      {(service.slug === 'street-interview-video-ads' || service.slug === 'social-media-video-production') && (
        <Section>
          <div className="max-w-3xl mb-10">
            <Eyebrow>Scripted vs Unscripted</Eyebrow>
            <H2 className="mt-4">Two ways to shoot. Both work.</H2>
          </div>
          <CompareTwoCol
            left={{ title: 'Scripted', body: 'Actor-led, fast, brand-controlled.', bullets: ['Cold paid acquisition', 'Brand-controlled message', 'Fastest path to a hero ad'] }}
            right={{ title: 'Unscripted', body: 'Real strangers, real reactions.', bullets: ['Brand awareness', 'Repositioning', 'Highest watch time'] }}
          />
        </Section>
      )}

      {/* INTERNAL LINKS */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Eyebrow>Related</Eyebrow>
            <H2 className="mt-4">Explore more.</H2>
          </div>
          <div className="lg:col-span-8">
            <InternalLinkBlock links={service.internalLinks} />
          </div>
        </div>
      </Section>

      {/* RELATED SERVICES */}
      {related.length > 0 && (
        <Section className="bg-paper-soft">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <Eyebrow>You might also need</Eyebrow>
              <H2 className="mt-4">Related services</H2>
            </div>
            <Button href="/services/" variant="secondary">All Services</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => <ServiceCard key={r.slug} service={r} />)}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>FAQ</Eyebrow>
          <H2 className="mt-4">Common questions.</H2>
        </div>
        <FAQAccordion items={service.faq} />
      </Section>

      <FinalCTA
        headline={`Ready to build your ${service.shortLabel.toLowerCase()} campaign?`}
      />
    </>
  );
}
