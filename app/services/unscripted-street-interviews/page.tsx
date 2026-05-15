import type { Metadata } from 'next';
import Link from 'next/link';
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
  ProcessSteps,
  FAQAccordion,
  CheckList,
  Breadcrumb,
} from '@/components/Sections';
import { SchemaScript, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Unscripted Street Interviews | StreetInterviewVideos.com',
  description:
    'Real-stranger street interview videos for brands. No script, no actors — just real reactions. Maximum trust, highest watch time on cold traffic, longest durability in an ad account.',
  alternates: { canonical: '/services/unscripted-street-interviews/' },
};

const FAQ = [
  { q: 'What makes "unscripted" different from a regular street interview?', a: 'No script, no actors, no plants. We stop real strangers and ask real questions. Their reactions are what you ship.' },
  { q: 'Why pick unscripted over scripted?', a: 'When trust is the conversion lever — repositioning a category, defusing skepticism, or running cold paid where social proof has to do the lifting. The ceiling on watch time is the highest in the format.' },
  { q: 'Isn\'t this slower?', a: 'Per usable beat, yes — you can\'t guarantee any given stranger will land the message. We plan for that. We capture more, edit harder, and the variance becomes the asset, not the problem.' },
  { q: 'How do you protect the brand if you\'re not scripting?', a: 'Two ways. We frame the questions so honest answers still land on-brand, and we cut around moments that go off-brand. Brand approves every clip before publishing.' },
  { q: 'How many videos do we get?', a: '5–20 edited videos per shoot day, plus hook variations, captioned and uncaptioned exports, and raw footage.' },
];

const recentWork = ALL_WORK_VIDEOS.slice(0, 6);

export default function UnscriptedPage() {
  return (
    <>
      <SchemaScript
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services/' },
            { name: 'Unscripted Street Interviews', url: '/services/unscripted-street-interviews/' },
          ]),
          faqSchema(FAQ),
        ]}
      />

      {/* HERO */}
      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: 'Unscripted Street Interviews' }]} />
        <Eyebrow>Path 2 · Unscripted</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6 max-w-4xl">
          Unscripted street interviews. <span className="text-accent">Real strangers. Real reactions.</span>
        </h1>
        <Lead className="max-w-3xl mb-8">
          No script. No actors. We stop real strangers on the street and ask real questions. The reactions are what
          you ship. Highest trust ceiling in the format, longest durability in an ad account.
        </Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {/* WHEN TO PICK UNSCRIPTED */}
      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>When to pick unscripted</Eyebrow>
            <H2 className="mt-4">If trust is the lever, this is the lane.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              Unscripted is the right pick when the audience needs to see a real person say it before they’ll
              believe the brand says it. Repositioning, skepticism-heavy categories, trust-led launches.
            </p>
            <p className="text-lead text-text-700">
              Slower per usable beat than scripted — you can’t direct a stranger. But the trust ceiling, and the
              ad-account longevity, are in a different class.
            </p>
          </div>
        </div>
      </Section>

      {/* BEST FOR */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Best for</Eyebrow>
          <H2 className="mt-4">Three signals you should go unscripted.</H2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {[
            { title: 'Trust-led campaigns', body: 'Skeptical categories, social-proof-driven verticals, anywhere the audience needs to hear it from a real person first.' },
            { title: 'Repositioning a category', body: 'When you’re trying to shift how people think about a product type — real reactions move the needle that polished ads can’t.' },
            { title: 'Highest watch time', body: 'Cold-traffic ad accounts where retention is the bottleneck. Unscripted delivers the longest hold per dollar spent.' },
          ].map((p, i) => (
            <div key={p.title} className="relative rounded-2xl bg-white border border-border p-6 lg:p-7 card-hover hover:border-ink-900/30 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-mono text-text-400 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <div className="text-lg lg:text-xl font-extrabold text-ink-900 mb-2 tracking-tight">{p.title}</div>
              <div className="text-text-700 text-sm leading-relaxed">{p.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* AUTHENTICITY ON SET */}
      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>How it stays real</Eyebrow>
            <H2 className="mt-4">How we preserve authenticity on an unscripted shoot.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              Unscripted only works if the strangers on camera are actually unprompted. We never feed answers,
              never cast in advance, and never ask people to do another take with a different opinion. What you
              see is what was actually said the moment the question landed.
            </p>
            <p className="text-lead text-text-700">
              The trade-off is variance. Some strangers light up the camera. Some don’t connect. We over-shoot —
              talking to ten to twenty people for every one we use — so the final cut is built entirely from
              genuine, on-brand reactions. The variance becomes the asset, because the moments that survive are
              the moments viewers trust.
            </p>
            <p className="text-lead text-text-700">
              What unscripted captures that scripted can’t: real objections the audience also has, real surprise,
              and category insights from people who don’t know they’re saying something a brand will use. That’s
              the kind of social proof that holds up in an ad account for months, not weeks.
            </p>
          </div>
        </div>
      </Section>

      {/* WHAT YOU GET */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What you get</Eyebrow>
            <H2 className="mt-4">Every unscripted shoot, every time.</H2>
            <Lead className="mt-4">
              The deliverable list is the same baseline — packages differ on volume, hook variants, and turnaround.
            </Lead>
          </div>
          <div className="lg:col-span-7">
            <CheckList
              items={[
                'Edited videos in vertical 9:16',
                'Captioned and uncaptioned versions of each video',
                'Hook variations on every hero video',
                'Raw footage',
                'Ad-account-ready exports',
                'One-year ad-usage rights (paid + organic)',
                'On-the-ground production with permits',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Process</Eyebrow>
          <H2 className="mt-4">From brief to ad-ready in as little as 7–14 days.</H2>
        </div>
        <ProcessSteps
          steps={[
            { title: 'Strategy', body: 'Goals, audience, platform mix, hook lanes. We figure out what an honest stranger could say that would land for your brand.' },
            { title: 'Question design', body: 'We design questions so genuine answers naturally land on-brand. You approve before we shoot.' },
            { title: 'Casting & shoot', body: 'Real strangers, real environments. Permits handled. Multiple looks, multiple lanes, multiple voices captured.' },
            { title: 'Edit', body: 'Hook variations plus captioned and uncaptioned versions of each video. Built for TikTok, Reels, Shorts, and Meta.' },
            { title: 'Delivery', body: 'Edited videos, raw footage, captions, ad-account-ready exports. Full ad-usage rights for one year from purchase.' },
          ]}
        />
      </Section>

      {/* EXAMPLES */}
      <Section className="bg-paper-soft">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <Eyebrow>Examples</Eyebrow>
            <H2 className="mt-4">Recent unscripted work.</H2>
          </div>
          <Button href="/work/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {recentWork.map((v) => <VideoTile key={v.id} video={v} />)}
        </div>
      </Section>

      {/* UNSCRIPTED VS SCRIPTED — CROSS-LINK */}
      <Section>
        <div className="rounded-3xl border border-border bg-white p-8 lg:p-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <Eyebrow>Reconsidering?</Eyebrow>
              <h2 className="text-h2 font-extrabold tracking-tight mt-4 mb-3">
                The other path is <span className="text-accent">scripted street interviews</span>.
              </h2>
              <p className="text-text-700 leading-relaxed">
                If you have a script ready (or want us to write one with you) and need a hero ad on a tight deadline,
                the scripted approach (actor-led, brand-controlled) is the faster path.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button href="/services/scripted-street-interviews/" variant="secondary">See scripted →</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* MORE FROM US — internal cross-links to deepen graph */}
      <Section>
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-5">
          {[
            { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/', sub: 'The format unscripted is built around.' },
            { label: 'Testimonial Video', href: '/services/testimonial-video-production/', sub: 'Customer proof, real-stranger style.' },
            { label: 'Brand Reviews', href: '/reviews/', sub: 'What 600+ brand teams say about working with us.' },
            { label: 'Our Process', href: '/process/', sub: 'Brief to ad-ready in as little as 5–10 days.' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-2xl border border-border bg-white p-5 lg:p-6 card-hover hover:border-ink-900/30 transition-colors"
            >
              <div className="text-sm font-extrabold text-ink-900 tracking-tight group-hover:text-accent transition-colors">{l.label} →</div>
              <div className="text-xs text-text-700 mt-1 leading-snug">{l.sub}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>FAQ</Eyebrow>
          <H2 className="mt-4">Common questions about unscripted.</H2>
        </div>
        <FAQAccordion items={FAQ} />
      </Section>

      <FinalCTA headline="Ready to ship unscripted street interview ads?" />
    </>
  );
}
