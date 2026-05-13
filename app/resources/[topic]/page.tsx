import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RESOURCE_TOPICS, RESOURCE_TOPIC_BY_SLUG, ARTICLES_BY_TOPIC } from '@/lib/resources';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { Button } from '@/components/Button';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return RESOURCE_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  const topic = RESOURCE_TOPIC_BY_SLUG[params.topic];
  if (!topic) return {};
  return { title: topic.title, description: topic.meta, alternates: { canonical: `/resources/${topic.slug}/` } };
}

export default function ResourceTopicHub({ params }: { params: { topic: string } }) {
  const topic = RESOURCE_TOPIC_BY_SLUG[params.topic];
  if (!topic) notFound();
  const articles = ARTICLES_BY_TOPIC(topic.slug);
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <SchemaScript
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources/' },
          { name: topic.navLabel, url: `/resources/${topic.slug}/` },
        ])}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources/' }, { label: topic.navLabel }]} />
        <Eyebrow>{topic.navLabel}</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">{topic.h1}</h1>
        <Lead className="max-w-3xl mb-8">{topic.description}</Lead>
        <div className="flex flex-wrap gap-3">
          <Button href={topic.servicePage.href} variant="primary">{topic.servicePage.label}</Button>
          <Button href="/work/" variant="secondary">View Work</Button>
        </div>
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {featured && (
        <Section className="bg-paper-soft">
          <Eyebrow>Featured</Eyebrow>
          <H2 className="mt-4 mb-10">Start here.</H2>
          <Link
            href={`/resources/${featured.topic}/${featured.slug}/`}
            className="group relative block rounded-3xl bg-white border border-border p-8 lg:p-10 card-hover hover:border-ink-900/30 overflow-hidden"
          >
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Featured Article
            </div>
            <div className="text-h2 font-extrabold tracking-tight text-ink-900 mb-4 leading-tight">{featured.h1}</div>
            <p className="text-lead text-text-700 mb-6 max-w-3xl">{featured.intro}</p>
            <div className="text-base font-semibold text-ink-900 inline-flex items-center gap-2 group-hover:text-accent transition-colors">
              Read article
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
            </div>
          </Link>
        </Section>
      )}

      <Section>
        <Eyebrow>All articles</Eyebrow>
        <H2 className="mt-4 mb-10">{articles.length} articles in this topic.</H2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {rest.map((a) => (
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
