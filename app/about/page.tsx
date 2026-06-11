import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack, PillarCards } from '@/components/Sections';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'About | StreetInterviewVideos.com',
  description:
    'We help brands turn real conversations into high-performing short-form content. 700+ brands. Street interviews, UGC ads, testimonials, and branded video.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
        <Eyebrow>About</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">We turn real conversations into ad creative.</h1>
        <Lead className="max-w-3xl mb-8">
          StreetInterviewVideos.com produces street interview videos, UGC-style ads, testimonial-style content, and
          social-first video campaigns for brands that need authentic short-form video.
        </Lead>
        <CTAStack secondaryHref="/portfolio/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>Why street interviews</Eyebrow>
            <H2 className="mt-4">We specialized when most agencies didn’t.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              The polished brand video industry was built for TV and trade shows. Modern brands need video that survives
              a TikTok feed and feeds a Meta ad account.
            </p>
            <p className="text-lead text-text-700">
              We picked the format that does both, street interview-led short-form video, and built a production
              system around it. Real people. Real reactions. Real ad creative.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>What we do</Eyebrow>
          <H2 className="mt-4">A short list of the things we’re actually good at.</H2>
        </div>
        <PillarCards
          pillars={[
            { title: 'Street interview ads', body: 'Scripted, unscripted, and hybrid formats: built for TikTok, Reels, Shorts, and Meta.' },
            { title: 'UGC-style video ads', body: 'Real-person UGC ads built without the fake creator feel. No AI on camera.' },
            { title: 'Testimonial video', body: 'Testimonial-style proof shot in a street-interview format. Real strangers, multi-voice cuts, social-first, ad-ready.' },
            { title: 'Branded content video', body: 'Branded video that feels like content first and advertising second.' },
            { title: 'Event video and activations', body: 'On-the-ground reactions and short-form clips from launches, pop-ups, and trade shows.' },
            { title: 'Ad creative pipelines', body: 'Repeatable creative systems that ship 20+ fresh ads a month.' },
          ]}
        />
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>Our point of view</Eyebrow>
            <H2 className="mt-4">How we think about authenticity, creative, and brand outcomes.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              Authenticity is the lever. Polished commercials lost the feed years ago, the audience scrolls past
              anything that pattern-matches as advertising. Real reactions, real environments, and real subjects are
              what earn attention now, and that is the discipline we built the company around.
            </p>
            <p className="text-lead text-text-700">
              Creative is the work. Most brands do not need more creative volume, they need creative variance:
              multiple hooks, multiple lanes, and multiple voices from a single shoot so the ad account has something
              fresh to test every cycle. We design every shoot to ship as a creative pipeline, not a single asset.
            </p>
            <p className="text-lead text-text-700">
              Brand outcomes are the only scoreboard. Hook rate, hold rate, cost per acquisition, ad-account
              longevity. Pretty footage that does not move those numbers is footage we do not ship. The point of
              authentic interview video is performance, the format only matters because it works.
            </p>
          </div>
        </div>
      </Section>

      <Section dark>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow dark>Our experience</Eyebrow>
            <h2 className="text-display-2 font-extrabold tracking-tight mt-5 mb-6">700+ brands. Across DTC, beauty, food, apps, B2B, events, and local.</h2>
            <p className="text-white/80 text-lead mb-8">
              We’ve produced video for category-disruptor DTC brands, household-name beauty companies, fast-growing
              apps, B2B SaaS founders, beverage brands, and local businesses launching their first paid social
              campaign.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 lg:gap-5">
            {[
              { stat: '700+', label: 'Brand clients' },
              { stat: '5–10 days', label: 'Fastest turnaround' },
              { stat: '20+', label: 'Ads per shoot' },
              { stat: 'NYC · LA', label: 'Primary cities' },
            ].map((s) => (
              <div key={s.label} className="relative rounded-2xl border border-white/15 p-6 lg:p-7 overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/25 transition-colors">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-accent leading-none">{s.stat}</div>
                <div className="text-xs uppercase tracking-widest text-white/70 mt-3">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Why brands choose us</Eyebrow>
          <H2 className="mt-4">Three reasons we hear over and over.</H2>
        </div>
        <PillarCards
          pillars={[
            { title: 'We pick a format and run it well', body: 'Street-interview-led short-form. Specialization beats generalist polish in 2026.' },
            { title: 'We ship at brand pace', body: 'Performance accounts need fresh creative every two weeks. We design shoots to feed that.' },
            { title: 'We protect brand voice without killing reaction', body: 'Brand-safe scripting plus on-the-ground capture. Native energy with brand alignment.' },
          ]}
        />
      </Section>

      <FinalCTA />
    </>
  );
}
