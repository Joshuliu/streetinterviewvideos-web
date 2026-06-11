import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow, H2, FinalCTA, Breadcrumb, TrustLine, FAQAccordion } from '@/components/Sections';
import { Button } from '@/components/Button';
import { HeroVideoWall } from '@/components/HeroVideoWall';
import { SITE, CTA } from '@/lib/site';
import { SchemaScript, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Services | StreetInterviewVideos.com',
  description:
    'Two ways into a street interview ad, bring a script and we cast actors, or bring nothing and we go shoot real strangers. Both paths ship vertical ads for TikTok, Reels, Shorts, and Meta.',
  alternates: { canonical: '/services/' },
};

// Collapsed by default so the hub stays visually lean (Neil's preference);
// the full answers are server-rendered in the DOM either way, which is what
// search crawlers and AI engines actually read.
const HUB_FAQ = [
  { q: 'What is a street interview video ad?', a: 'A short-form vertical ad built around interviews shot in real public environments, sidewalks, storefronts, events, instead of studios. Real people react on camera and a brand product or message is woven in. The format reads as content first and ad second, which is why feeds reward it.' },
  { q: 'Which service page should I be looking at?', a: 'Street Interview Video Ads is the headline format. Video Ad Production covers end-to-end paid ad creative. Social Media Video Production covers feed-native organic and paid short-form. Testimonial Video Production is street-style social proof. Branded Video Production is top-of-funnel brand storytelling. All five run on the same two production paths: scripted or unscripted.' },
  { q: 'Do you do scripted, unscripted, or both?', a: 'Both. Scripted uses actors to deliver a brand-controlled message reliably. Unscripted stops real strangers for reactions nobody could write. Most long-term clients use a scripted hero for cold traffic with unscripted proof behind it.' },
  { q: 'What is included in every package?', a: 'Edited vertical 9:16 videos, captioned and uncaptioned exports, raw footage, ad-account-ready files, and one-year paid ad-usage rights for TikTok, Meta, Reels, Shorts, and YouTube. Hook variations are available as a paid add-on.' },
  { q: 'How fast can you deliver?', a: 'As little as 5–10 days from brief to first cut for most projects. Unscripted typically runs 7–14 days. Bigger campaigns up to 21 days.' },
  { q: 'How do we get pricing?', a: 'Book a call or send a one-paragraph brief, brand, goal, platforms, timeline. We respond within one business day with format recommendations and a clear scope including deliverables and price.' },
];

export default function ServicesHub() {
  return (
    <>
      <SchemaScript data={[breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Services', url: '/services/' }]), faqSchema(HUB_FAQ)]} />

      {/* HERO, compact dark video-wall, matches homepage energy */}
      <section className="relative bg-ink-900 text-white overflow-hidden min-h-[440px] lg:min-h-[520px] flex flex-col">
        <HeroVideoWall />
        <div className="relative flex-1 max-w-site mx-auto w-full px-6 lg:px-12 pt-16 lg:pt-20 pb-14 lg:pb-16 flex flex-col justify-center">
          <div className="max-w-3xl">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
            <span className="kicker dark inline-flex items-center gap-2.5">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 pulse-dot" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Services
            </span>
            <h1 className="text-display-2 lg:text-display-1 headline-display mt-5 mb-5">
              Two ways in. <span className="text-accent">One street interview ad.</span>
            </h1>
            <p className="text-lead text-white/85 max-w-2xl mb-6">
              Bring a script and we’ll cast actors to execute it. Bring nothing and we’ll go stop real
              strangers on camera. Either path ends with a hero ad for TikTok, Reels, Shorts, and Meta.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#paths"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors"
              >
                Pick your path
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-slow" aria-hidden><path d="M3 5l4 4 4-4" /></svg>
              </a>
              <span className="text-white/40 text-sm">·</span>
              <TrustLine dark />
            </div>
          </div>
        </div>
      </section>

      {/* TWO PATHS, side-by-side, fits in one viewport */}
      <Section id="paths" className="bg-paper-soft">
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {/* Path 1 */}
          <Link
            href="/services/scripted-street-interviews/"
            className="group relative flex flex-col rounded-3xl border border-border bg-white p-7 lg:p-8 card-hover hover:border-ink-900/30 overflow-hidden"
          >
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Path 1
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-ink-900 mb-3 leading-tight">
              “I have a script,<br className="hidden sm:block" /> or want one written.”
            </h2>
            <p className="text-text-700 leading-relaxed mb-5 text-[15px]">
              Actor-led production. Brand-controlled message. The fastest path to a hero ad your media buyer can scale.
              No script yet? We’ll write one with you, anchored to your product.
            </p>
            <ul className="space-y-2 border-t border-border pt-4 mb-5">
              {[
                'Cold paid acquisition',
                'Brand-message control',
                'Tight launch timelines',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-ink-900">
                  <span className="mt-0.5 text-accent shrink-0">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,7 6,11 12,3" /></svg>
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                Start with a script
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
              </span>
            </div>
          </Link>

          {/* Path 2 */}
          <Link
            href="/services/unscripted-street-interviews/"
            className="group relative flex flex-col rounded-3xl border border-ink-900 bg-ink-900 text-white p-7 lg:p-8 card-hover overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-12 w-60 h-60 rounded-full bg-accent/15 blur-3xl pointer-events-none"
            />
            <div className="relative flex flex-col h-full">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Path 2
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight">
                “I want real strangers,<br className="hidden sm:block" /> no script.”
              </h2>
              <p className="text-white/80 leading-relaxed mb-5 text-[15px]">
                No actors. No rehearsal. We stop strangers, ask the question, and ship the reactions you got. Highest
                trust ceiling in the format. Longest durability in an ad account.
              </p>
              <ul className="space-y-2 border-t border-white/15 pt-4 mb-5">
                {[
                  'Trust-led campaigns',
                  'Repositioning a category',
                  'Highest watch time',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                    <span className="mt-0.5 text-accent shrink-0">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,7 6,11 12,3" /></svg>
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <span className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 bg-accent text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                  Start unscripted
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href={SITE.bookingUrl} external variant="cta" dataCta="services-book">
            {CTA.primary}
          </Button>
          <span className="text-sm text-text-700">Not sure which fits? Book a call and we’ll recommend.</span>
        </div>
      </Section>

      {/* USE CASES, how brands actually use the work */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>Use cases</Eyebrow>
            <H2 className="mt-4">Brands use our videos for:</H2>
            <ul className="mt-6 space-y-3">
              {[
                'Paid video ads',
                'Social media content',
                'Testimonial-style proof',
                'Branded video campaigns',
                'Product launch creative',
                'Real-reaction ad concepts',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink-900 text-base">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 space-y-5 text-lead text-text-700 leading-relaxed">
            <p>
              The format stays the same, real people, vertical, social-first. What changes is the goal. Some brands
              come to us for a single hero hook to scale on paid; others for a steady drumbeat of feed-native social.
            </p>
            <p>
              Need scroll-stopping{' '}
              <Link href="/services/video-ad-production/" className="text-ink-900 font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors">
                video ad production
              </Link>
              ? Want a feed-native{' '}
              <Link href="/services/social-media-video-production/" className="text-ink-900 font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors">
                social media video production
              </Link>{' '}
              partner? Looking for distinctive{' '}
              <Link href="/services/branded-video-production/" className="text-ink-900 font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors">
                branded video production
              </Link>
              ? We’ve structured campaigns around all of these.
            </p>
            <p className="text-sm text-text-400">
              You don’t pick the use case yourself, we figure it out on the kickoff call based on your
              product and goal.
            </p>
          </div>
        </div>
      </Section>

      {/* SERVICE CATEGORIES — temporarily hidden.
          The "Testimonial Video Production" entry is a different format
          (customers self-recording) that doesn't match what we actually
          shoot. Until we either rewrite that category or remove the
          testimonial entry + retitle the section, the whole section is
          off the index page. The individual service pages stay alive at
          their URLs for SEO.

      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Specialized formats</Eyebrow>
          <H2 className="mt-4">The five service categories we run.</H2>
          <Lead className="mt-4">
            The two paths above are how the work gets shot. The five categories below are how it gets used ,
            paid ads, organic social, customer proof, brand storytelling, and the headline format we are named for.
            Pick the one that matches your goal, or let us recommend on the kickoff call.
          </Lead>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {[
            { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/', body: 'The headline format. Interview-led short-form ads shot in real environments, used as paid ads on TikTok, Meta, Reels, Shorts, and YouTube.' },
            { label: 'Video Ad Production', href: '/services/video-ad-production/', body: 'End-to-end paid ad production: hook lanes, on-camera CTA, multiple variants per shoot, ad-account-ready exports the same week.' },
            { label: 'Social Media Video Production', href: '/services/social-media-video-production/', body: 'Feed-native short-form built for TikTok, Reels, Shorts, and Meta: both organic and paid distribution from one shoot.' },
            { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/', body: 'Testimonial-style proof shot street-interview style. Real strangers, real environments, multi-voice cuts that read as proof, not as commercials.' },
            { label: 'Branded Video Production', href: '/services/branded-video-production/', body: 'Brand storytelling that feels like content first and advertising second. Top- and mid-funnel video designed to earn watch time and brand affinity.' },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover hover:border-ink-900/30 transition-colors"
            >
              <div className="text-base font-extrabold text-ink-900 tracking-tight group-hover:text-accent transition-colors">{s.label} →</div>
              <p className="text-text-700 text-sm leading-relaxed mt-3">{s.body}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-sm text-text-400 max-w-2xl">
          Not sure which category fits your campaign? The answer usually clarifies on the kickoff call once we
          understand the goal, the platform mix, and where the video sits in your funnel.
        </p>
      </Section>
      */}

      {/* HUB FAQ — collapsed reveal keeps the page visually lean */}
      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Before the call</Eyebrow>
          <H2 className="mt-4">Quick answers.</H2>
        </div>
        <FAQAccordion items={HUB_FAQ} />
      </Section>

      <FinalCTA />
    </>
  );
}
