import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { SITE } from '@/lib/site';
import { SchemaScript, reviewSnippetSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Brand Reviews | StreetInterviewVideos.com',
  description:
    'Reviews from 600+ brand clients on our street interview videos, UGC ads, testimonial content, and branded content production work.',
  alternates: { canonical: '/reviews/' },
};

const SCRIPTED_REVIEWS = [
  { quote: 'Excellent service from start to finish. He understood the brief perfectly and delivered a great amount of high-quality content for us to work with. Will definitely be using his services again.', brand: '@inventxltd', role: 'United Kingdom · Fiverr' },
  { quote: 'A true professional. He went above and beyond — even recorded additional shots beyond what we briefed.', brand: '@vukans', role: 'Serbia · Fiverr' },
  { quote: 'Outstanding job conducting street interviews that felt genuine. Both he and the actress came across as relatable — exactly what we needed for our audience. The creative twist on the script, turning it into a realistic survey, added an authentic feel.', brand: '@ignaciobennu', role: 'Argentina · Fiverr' },
  { quote: 'The communication was excellent from start to finish. They asked the right questions and made sure they fully understood my requirements. I felt really supported throughout the process.', brand: '@mixiamerica', role: 'Japan · Fiverr' },
  { quote: 'Thank you for delivering the video. We really liked the quality and your energy, as well as the energy of the person you interviewed. It was amazing, 10/10!', brand: '@slimkitapps', role: 'Cyprus · Fiverr' },
  { quote: 'Truly impressive. Professionalism and attention to detail were outstanding. He went above and beyond, ensuring an exceptional experience. Kudos.', brand: '@pwest13', role: 'Portugal · Fiverr' },
  { quote: 'Crafted UGC videos that truly stood out with impeccable attention to detail and stunning visual appeal — going above and beyond what is expected. Smooth, proactive, on time.', brand: '@lasso_motion', role: 'Austria · Fiverr' },
  { quote: 'Amazing job. Did an amazing job and got it done super fast. The videos were top tier and well worth the money.', brand: '@griffendea', role: 'United States · Fiverr' },
  { quote: 'A fantastic collaboration on our street style interview project. The editing skills brought a polished touch to the final content, and the responsiveness made the entire workflow smooth and efficient.', brand: '@zigzag_dog', role: 'United Kingdom · Fiverr' },
  { quote: 'Top-notch work on our UGC videos. Creativity, attention to detail, and professionalism made a huge impact. He went above and beyond — highly recommend.', brand: '@stepsapp', role: 'Austria · Fiverr' },
  { quote: 'Working with Neil was a pleasure. The storytelling and creativity in UGC videos are top-notch. Proactive communication and seamless cooperation made the project run smoothly.', brand: '@acezhuo', role: 'Singapore · Fiverr' },
  { quote: 'Very happy with the content — high quality, engaging, and followed my brief diligently. Couldn’t have asked for more. 10/10, would definitely recommend.', brand: '@daniel1304lai', role: 'United Kingdom · Fiverr' },
];

const UNSCRIPTED_REVIEWS = [
  { quote: 'The BEST. He knows how to take your vision and transform it into a viral video. The professionalism and visual appeal of his work exceeded my expectations — incredibly responsive and understanding throughout. Highly recommend.', brand: '@rahimazizzi', role: 'United States · Fiverr' },
  { quote: 'Accommodating and took time to understand the assignment at hand. He went over and beyond what we asked for, and now we are on our way to a successful marketing campaign. Check him out!', brand: '@tgbtg25', role: 'United States · Fiverr' },
  { quote: 'Very professional, super happy to work with him.', brand: '@cromegaz', role: 'Egypt · Fiverr' },
];

export default function ReviewsPage() {
  return (
    <>
      <SchemaScript
        data={[
          reviewSnippetSchema(SITE.brandsServed),
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
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>Patterns we hear</Eyebrow>
            <H2 className="mt-4">What clients tell us they value most.</H2>
            <Lead className="mt-4">
              The reviews below come from brand teams and operators across DTC, beauty, food, apps, SaaS, and local.
              Four themes show up over and over — they are the ones worth weighting when you are choosing a
              production partner.
            </Lead>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {[
              { title: 'Reliability and communication', body: 'Brief understood, scope respected, timeline hit. Most reviews open with some version of “communication was clear from start to finish.”' },
              { title: 'Output quality', body: 'High-quality footage, polished post-production, deliverables that drop straight into an ad account without rework on the brand side.' },
              { title: 'Going above what was briefed', body: 'Extra footage, extra hook variants, extra coverage that turns out to be the cut that performs. A pattern across both scripted and unscripted projects.' },
              { title: 'A real production partner, not a vendor', body: 'Recommendations on format and hooks, honest read on what is likely to work, follow-through after delivery — the signals that matter most when choosing who shoots your highest-stakes ad creative.' },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-white p-5 lg:p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">{p.title}</div>
                <p className="text-text-700 text-[15px] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-paper-soft">
        <Eyebrow>Scripted video reviews</Eyebrow>
        <H2 className="mt-4 mb-10">Reviews on scripted street interview work.</H2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {SCRIPTED_REVIEWS.map((r, i) => (
            <figure key={`s-${i}`} className="relative rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover">
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

      <Section>
        <Eyebrow>Unscripted video reviews</Eyebrow>
        <H2 className="mt-4 mb-10">Reviews on unscripted street interview work.</H2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {UNSCRIPTED_REVIEWS.map((r, i) => (
            <figure key={`u-${i}`} className="relative rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover">
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
