import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WORK_CATEGORIES, WORK_BY_SLUG } from '@/lib/work';
import { VideoCard } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return WORK_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = WORK_BY_SLUG[params.slug];
  if (!cat) return {};
  return {
    title: cat.title,
    description: cat.meta,
    alternates: { canonical: `/work/${cat.slug}/` },
  };
}

export default function WorkCategoryPage({ params }: { params: { slug: string } }) {
  const cat = WORK_BY_SLUG[params.slug];
  if (!cat) notFound();

  return (
    <>
      <SchemaScript
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Work', url: '/work/' },
          { name: cat.navLabel, url: `/work/${cat.slug}/` },
        ])}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work/' }, { label: cat.navLabel }]} />
        <Eyebrow>{cat.hero.kicker}</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">{cat.hero.headline}</h1>
        <Lead className="max-w-3xl mb-8">{cat.hero.sub}</Lead>
        <CTAStack secondaryHref="/work/" secondaryLabel="View All Work" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cat.videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <Eyebrow>More work</Eyebrow>
            <H2 className="mt-4">Other work categories</H2>
          </div>
          <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
            {WORK_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
              <Button key={c.slug} href={`/work/${c.slug}/`} variant="secondary" size="md">{c.navLabel}</Button>
            ))}
          </div>
        </div>
      </Section>

      <FinalCTA />
    </>
  );
}
