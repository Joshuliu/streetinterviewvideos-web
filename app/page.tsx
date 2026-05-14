import type { Metadata } from 'next';
import { SITE, CTA } from '@/lib/site';
import { ALL_WORK_VIDEOS } from '@/lib/work';
import { Button } from '@/components/Button';
import { VideoTile } from '@/components/VideoCard';
import { HeroVideoWall } from '@/components/HeroVideoWall';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { RoadProcess } from '@/components/RoadProcess';
import {
  Section,
  Eyebrow,
  H2,
  Lead,
  CTAStack,
  FinalCTA,
  LogoStrip,
  FAQAccordion,
  CompareTwoCol,
  PillarCards,
} from '@/components/Sections';
import { SchemaScript, faqSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Videos for Brands | StreetInterviewVideos.com',
  description:
    'We create street interview videos, UGC-style ads, and authentic short-form content for brands running TikTok, Instagram, Reels, Shorts, and Meta campaigns.',
  alternates: { canonical: '/' },
};

const HOMEPAGE_FAQ = [
  { q: 'How fast is turnaround?', a: 'As little as 5–10 days for most projects. Bigger campaigns or more complex shoots can run up to 21 days — we set the timeline on the kickoff call.' },
  { q: 'Do you use real people or actors?', a: 'Both — scripted street interviews use actors, unscripted ones use real strangers. We help you pick.' },
  { q: 'Can we use the videos for paid ads?', a: 'Yes. Every package includes paid usage rights for TikTok, Meta, Reels, Shorts, and YouTube.' },
  { q: 'How many videos do we get?', a: '5–20 edited videos per shoot day, plus hook variants, captioned and uncaptioned exports, and raw footage.' },
  { q: 'Do you provide raw footage?', a: 'Yes — on every package.' },
  { q: 'Where do you film?', a: 'Primarily New York and Los Angeles. We accommodate specific events and brand-requested locations on a case-by-case basis.' },
  { q: 'Can you make videos for service businesses?', a: 'Yes. Apps, SaaS, agencies, real estate, fitness, and local services regularly.' },
];

export default function Home() {
  const recentWork = ALL_WORK_VIDEOS.slice(0, 6);

  return (
    <>
      <SchemaScript
        data={[
          breadcrumbSchema([{ name: 'Home', url: '/' }]),
          faqSchema(HOMEPAGE_FAQ),
        ]}
      />

      {/* HERO — fills viewport; floating nav sits over the top */}
      <section className="relative bg-ink-900 text-white overflow-hidden h-[100svh] min-h-[560px] flex flex-col">
        <HeroVideoWall />
        <div className="relative flex-1 max-w-site mx-auto w-full px-6 lg:px-12 pt-24 lg:pt-32 pb-24 flex flex-col justify-center">
          <div className="max-w-3xl">
            <span className="kicker dark">Real people. Real reactions.</span>
            <h1 className="text-display-1 headline-display mt-5 mb-5">
              Street Interview Videos<br />
              <span className="text-accent">for Brands.</span>
            </h1>
            <p className="text-lead text-white/85 max-w-2xl mb-8">
              We create street interview videos, UGC-style ads, and authentic short-form content for brands running
              TikTok, Instagram, Reels, Shorts, and Meta campaigns.
            </p>
            <CTAStack secondaryHref="/work/" secondaryLabel={CTA.secondary} dark />

            {/* Trust stat row */}
            <div className="mt-10 lg:mt-12 grid grid-cols-3 gap-4 lg:gap-10 max-w-2xl border-t border-white/15 pt-5 lg:pt-6">
              {[
                { stat: '600+', label: 'Brands served' },
                { stat: '5–10 days', label: 'Fastest turnaround' },
                { stat: 'Vertical', label: 'TikTok · Reels · Meta' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl lg:text-2xl font-extrabold tracking-tight text-accent leading-tight">{s.stat}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/65 mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ScrollIndicator targetId="trusted-by" />
      </section>

      <div id="trusted-by" className="scroll-mt-16 lg:scroll-mt-20">
        <LogoStrip />
      </div>

      {/* SCRIPTED VS UNSCRIPTED */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Scripted vs Unscripted</Eyebrow>
          <H2 className="mt-4">Two ways to shoot a street interview. Both work. Different jobs.</H2>
        </div>
        <CompareTwoCol
          left={{
            title: 'Scripted street interviews',
            body: 'Actor-led. Fast. Brand-controlled. Cleaner edit, more reliable hook delivery, easier to plan for ad accounts.',
            bullets: ['Best for cold paid acquisition', 'Best when brand-message control matters', 'Fastest path to a hero ad'],
          }}
          right={{
            title: 'Unscripted street interviews',
            body: 'Real strangers. Real reactions. Highest trust ceiling, slower per usable beat, durable in ad accounts.',
            bullets: ['Best for trust-led campaigns', 'Best for repositioning', 'Highest watch time on cold traffic'],
          }}
        />
        <div className="mt-8">
          <Button href={SITE.bookingUrl} external variant="primary" dataCta="compare-book">
            {CTA.primary}
          </Button>
        </div>
      </Section>

      {/* RECENT WORK */}
      <Section>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <Eyebrow>Recent work</Eyebrow>
            <H2 className="mt-4">A few of the campaigns we’ve produced.</H2>
          </div>
          <Button href="/work/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {recentWork.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      {/* WHY THIS WORKS */}
      <Section dark>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <Eyebrow dark>Why this works</Eyebrow>
            <h2 className="text-h2 font-extrabold tracking-tight mt-4 mb-6">
              Your brand doesn’t need another polished commercial. It needs content people actually watch.
            </h2>
            <p className="text-white/80 text-lead mb-8">
              The feed punishes ads that look like ads. Street interviews, UGC, and real reactions live on the right side
              of that line — native, unfakeable, and built for the platforms your audience actually uses.
            </p>
            <Button href={SITE.bookingUrl} external variant="darkPrimary" dataCta="why-book">
              {CTA.primary}
            </Button>
          </div>
          <div className="lg:col-span-7">
            <PillarCards
              dark
              pillars={[
                { title: 'Native to the feed', body: 'Vertical, fast, captioned, designed for sound-on or sound-off. Indistinguishable from the rest of the feed.' },
                { title: 'Built-in trust', body: 'Real strangers, real customers, real reactions. The audience reads it as social proof on first watch.' },
                { title: 'Ad-account scalable', body: 'Multiple hooks, multiple cuts, multiple voices from a single shoot. Your testing pipeline never runs dry.' },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Process</Eyebrow>
          <H2 className="mt-4">From brief to ad-ready in as little as 5–10 days.</H2>
        </div>
        <RoadProcess
          steps={[
            { title: 'Strategy', body: 'Goals, audience, platform mix, hook lanes — locked before scripting.' },
            { title: 'Script & questions', body: 'We write or refine the questions and prompts. Scripted, semi-scripted, or fully unscripted.' },
            { title: 'Casting & shoot', body: 'Actors or real strangers. Vertical-first. Multiple looks, multiple lanes.' },
            { title: 'Edit', body: 'Hook variations plus captioned and uncaptioned versions of each video. Built for TikTok, Reels, Shorts, and Meta.' },
            { title: 'Delivery', body: 'Edited videos, raw footage, captions, ad-account-ready exports. You own everything.' },
          ]}
        />
        <div className="mt-10">
          <Button href="/process/" variant="ghost">See full process →</Button>
        </div>
      </Section>

      {/* REVIEWS TEASER */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <Eyebrow>Reviews</Eyebrow>
            <H2 className="mt-4">600+ brands. Real results.</H2>
            <Lead className="mt-4 mb-8">Brand teams across DTC, beauty, food, apps, and local trust us with their highest-stakes ad creative.</Lead>
            <Button href="/reviews/" variant="secondary">Read All Reviews</Button>
          </div>
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-4 lg:gap-5">
            {HOMEPAGE_REVIEWS.map((r) => (
              <figure key={r.brand} className="relative rounded-2xl border border-border p-6 lg:p-7 bg-white card-hover">
                <div className="flex items-center gap-1 mb-4 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
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
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Quick answers</Eyebrow>
          <H2 className="mt-4">Common questions before the first call.</H2>
        </div>
        <FAQAccordion items={HOMEPAGE_FAQ} />
      </Section>

      <FinalCTA
        headline="Ready to build your next ad campaign?"
        sub="Real people. Real reactions. Booked in 7 days."
      />
    </>
  );
}

const HOMEPAGE_REVIEWS = [
  { quote: 'They got us creative that looked like it belonged on TikTok, not on a billboard. CTR doubled.', brand: 'DTC Beauty', role: 'Performance Lead' },
  { quote: 'We shipped 12 ads from one shoot. Two scaled in week one. The pipeline alone changed our quarter.', brand: 'Mobile App', role: 'Head of Growth' },
  { quote: 'They turned an event activation into 60 days of paid social.', brand: 'Brand Activation', role: 'Marketing Director' },
  { quote: 'The authentic interviews held in our ad account longer than any creator UGC we’ve ever bought.', brand: 'F&B', role: 'CMO' },
];
