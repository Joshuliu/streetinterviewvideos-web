import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RESOURCE_ARTICLES, ARTICLE_BY_PATH, RESOURCE_TOPIC_BY_SLUG } from '@/lib/resources';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, FAQAccordion, InternalLinkBlock } from '@/components/Sections';
import { Button } from '@/components/Button';
import { SchemaScript, articleSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return RESOURCE_ARTICLES.map((a) => ({ topic: a.topic, article: a.slug }));
}

export async function generateMetadata({ params }: { params: { topic: string; article: string } }): Promise<Metadata> {
  const a = ARTICLE_BY_PATH[`${params.topic}/${params.article}`];
  if (!a) return {};
  return {
    title: a.title,
    description: a.meta,
    alternates: { canonical: `/resources/${a.topic}/${a.slug}/` },
  };
}

export default function ArticlePage({ params }: { params: { topic: string; article: string } }) {
  const a = ARTICLE_BY_PATH[`${params.topic}/${params.article}`];
  if (!a) notFound();
  const topic = RESOURCE_TOPIC_BY_SLUG[a.topic];

  return (
    <>
      <SchemaScript
        data={[
          articleSchema({ headline: a.h1, description: a.meta, url: `/resources/${a.topic}/${a.slug}/` }),
          faqSchema(a.faq),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Resources', url: '/resources/' },
            { name: topic.navLabel, url: `/resources/${topic.slug}/` },
            { name: a.h1, url: `/resources/${a.topic}/${a.slug}/` },
          ]),
        ]}
      />

      <article>
        <Section>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Resources', href: '/resources/' },
              { label: topic.navLabel, href: `/resources/${topic.slug}/` },
              { label: a.h1 },
            ]}
          />
          <Eyebrow>{topic.navLabel}</Eyebrow>
          <h1 className="text-display-1 headline-display mt-5 mb-6 max-w-4xl">{a.h1}</h1>
          <Lead className="max-w-3xl mb-8">{a.intro}</Lead>
          <div className="flex flex-wrap gap-3">
            <Button href={topic.servicePage.href} variant="primary">{topic.servicePage.label}</Button>
            <Button href={`/resources/${topic.slug}/`} variant="ghost">More in {topic.navLabel} →</Button>
          </div>
        </Section>

        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-12">
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-28">
                <div className="text-xs uppercase tracking-widest text-text-400 mb-4">In this article</div>
                <ul className="space-y-3 text-sm">
                  {a.body.map((s) => (
                    <li key={s.h2}>
                      <a
                        href={`#${slugify(s.h2)}`}
                        className="text-ink-900 hover:text-accent leading-snug block"
                      >
                        {s.h2}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="lg:col-span-9 space-y-12">
              {a.body.map((section) => (
                <section key={section.h2} id={slugify(section.h2)} className="scroll-mt-28">
                  <h2 className="text-h2 font-extrabold tracking-tight mb-5">{section.h2}</h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((p, i) => (
                      <p key={i} className="text-lead text-text-700 leading-relaxed">{p}</p>
                    ))}
                    {section.list && (
                      <ul className="grid sm:grid-cols-2 gap-3 pt-2">
                        {section.list.map((item) => (
                          <li key={item} className="rounded-xl border border-border bg-white px-4 py-3 text-ink-900 text-sm">
                            <span className="text-accent mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}

              <div className="rounded-2xl bg-ink-900 text-white p-8 lg:p-10 mt-16">
                <Eyebrow dark>Want it built for you?</Eyebrow>
                <h3 className="text-h2 font-extrabold mt-4 mb-4 tracking-tight">{topic.servicePage.label} for your brand</h3>
                <p className="text-white/80 text-lead mb-6">Real people. Real reactions. Real ad creative.</p>
                <Button href={topic.servicePage.href} variant="darkPrimary">Explore the service</Button>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="max-w-3xl mb-10">
            <Eyebrow>Quick answers</Eyebrow>
            <H2 className="mt-4">Common follow-ups.</H2>
          </div>
          <FAQAccordion items={a.faq} />
        </Section>

        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Eyebrow>Related</Eyebrow>
              <H2 className="mt-4">Keep reading.</H2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <InternalLinkBlock links={a.serviceLinks} />
              <InternalLinkBlock links={a.related} />
            </div>
          </div>
        </Section>
      </article>

      <FinalCTA />
    </>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
