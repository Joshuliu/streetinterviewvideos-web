import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SITE } from '@/lib/site';
import { SchemaScript, aggregateRatingSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Video Reviews | 600+ Brand Clients',
  description:
    'Reviews from 600+ brand clients on our street interview videos, UGC ads, testimonial content, and branded content production work.',
  alternates: { canonical: '/reviews/' },
};

const REVIEWS = [
  { quote: 'They got us creative that looked like it belonged on TikTok, not on a billboard. CTR doubled the brand’s prior best.', brand: 'DTC Beauty', role: 'Performance Lead' },
  { quote: 'We shipped 12 ads from one shoot. Two scaled in week one. The pipeline alone changed our quarter.', brand: 'Mobile App', role: 'Head of Growth' },
  { quote: 'They turned an event activation into 60 days of paid social.', brand: 'Brand Activation', role: 'Marketing Director' },
  { quote: 'The authentic interviews held in our ad account longer than any creator UGC we’ve ever bought.', brand: 'Food & Beverage', role: 'CMO' },
  { quote: 'A real production partner. Real instincts on hook variants. Real conversions.', brand: 'DTC E-Commerce', role: 'Head of Brand' },
  { quote: 'Best testimonial videos we’ve ever shot. None of them feel like testimonials. That’s the point.', brand: 'SaaS', role: 'Founder' },
  { quote: 'They take a brief and ship something the algorithm actually rewards.', brand: 'Beauty Brand', role: 'Performance Marketing' },
  { quote: 'We tried four different agencies before this. Don’t need to keep looking.', brand: 'Local Restaurant Group', role: 'Owner' },
  { quote: 'Real strangers reacting to our product was the angle we never knew we needed.', brand: 'Beverage', role: 'Marketing Lead' },
  { quote: 'They turned a one-day shoot into a year of always-on content.', brand: 'Apparel DTC', role: 'Growth' },
  { quote: 'Hook variants gave us 3x performance lift in three weeks.', brand: 'Mobile Gaming', role: 'UA Lead' },
  { quote: 'Authentic to a fault. We had to ask them to dial it back. Still better than any commercial we’ve aired.', brand: 'Lifestyle Brand', role: 'CMO' },
];

export default function ReviewsPage() {
  return (
    <>
      <SchemaScript
        data={[
          aggregateRatingSchema(SITE.brandsServed),
          breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Reviews', url: '/reviews/' }]),
        ]}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Reviews' }]} />
        <Eyebrow>Reviews</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">600+ brands. Real reviews.</h1>
        <Lead className="max-w-3xl mb-8">
          Brand teams across DTC, beauty, food, apps, SaaS, events, and local trust us with their highest-stakes ad
          creative.
        </Lead>
        <CTAStack secondaryHref="/work/" secondaryLabel="View Work" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {/* Stats strip */}
      <Section className="bg-ink-900 text-white py-10 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { stat: '600+', label: 'Brands served' },
            { stat: '5–10 days', label: 'Fastest turnaround' },
            { stat: '8–20', label: 'Ads per shoot day' },
            { stat: '4.9/5', label: 'Average rating' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-accent">{s.stat}</div>
              <div className="text-sm uppercase tracking-widest text-white/70 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>What clients say</Eyebrow>
        <H2 className="mt-4 mb-10">Reviews from brand teams.</H2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {REVIEWS.map((r, i) => (
            <figure key={i} className="relative rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover">
              <div className="flex items-center gap-1 mb-4 text-accent">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <svg key={idx} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                    <polygon points="7,0.5 8.7,5 13.5,5 9.7,7.9 11.2,12.5 7,9.7 2.8,12.5 4.3,7.9 0.5,5 5.3,5" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-ink-900 leading-relaxed text-[15px]">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">{r.brand}</span>
                <span className="text-[11px] uppercase tracking-widest text-text-400">{r.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <FinalCTA headline="Want results like these?" />
    </>
  );
}
