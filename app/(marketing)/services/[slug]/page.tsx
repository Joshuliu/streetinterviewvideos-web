import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SERVICES, SERVICE_BY_SLUG } from '@/lib/services';
import { getPortfolioVideos } from '@/lib/portfolio';
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
import { SITE, CTA, filterPublicLinks } from '@/lib/site';
import { SchemaScript, serviceSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';

// Only these service slugs are publicly indexable. Every other slug in
// lib/services.ts is intentionally not part of the live site (yet) and
// should 404 + stay out of the sitemap.
const PUBLIC_SERVICE_SLUGS = new Set([
  'social-media-video-production',
  'branded-video-production',
  'testimonial-video-production',
  'video-ad-production',
  'street-interview-video-ads',
]);

export async function generateStaticParams() {
  return SERVICES.filter((s) => PUBLIC_SERVICE_SLUGS.has(s.slug)).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!PUBLIC_SERVICE_SLUGS.has(params.slug)) return { robots: { index: false, follow: false } };
  const service = SERVICE_BY_SLUG[params.slug];
  if (!service) return {};
  return {
    title: service.title,
    description: service.meta,
    alternates: { canonical: `/services/${service.slug}/` },
    openGraph: {
      title: service.title,
      description: service.meta,
      url: `/services/${service.slug}/`,
      type: 'website',
      // The root app/opengraph-image.png file convention is suppressed when a
      // segment defines its own openGraph, so reference the same image here.
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  if (!PUBLIC_SERVICE_SLUGS.has(params.slug)) notFound();
  const service = SERVICE_BY_SLUG[params.slug];
  if (!service) notFound();

  const isTestimonial = service.slug === 'testimonial-video-production';
  const isBranded = service.slug === 'branded-video-production';
  const isSocialMedia = service.slug === 'social-media-video-production';
  const isVideoAd = service.slug === 'video-ad-production';
  const isStreetInterview = service.slug === 'street-interview-video-ads';

  // Only surface related-service cards that are themselves public; otherwise we'd
  // be linking to hidden/404 pages.
  const related = service.related
    .filter((s) => PUBLIC_SERVICE_SLUGS.has(s))
    .map((s) => SERVICE_BY_SLUG[s])
    .filter(Boolean);
  const featuredWork = (await getPortfolioVideos()).slice(0, 6);

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
            <CTAStack secondaryHref="/portfolio/" secondaryLabel={CTA.examples} />
            <div className="mt-8"><TrustLine /></div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {featuredWork.slice(0, 4).map((v) => (
              <VideoTile key={v.id} video={v} />
            ))}
          </div>
        </div>
      </Section>

      {/* WHAT IT MEANS, branded-only, explanatory framing */}
      {isBranded && (
        <Section>
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>The discipline</Eyebrow>
              <H2 className="mt-4">What branded video production means here.</H2>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <p className="text-lead text-text-700">
                Branded video production, in the way we practice it, is short-form video content built around real
                people instead of brand-voice scripts. The goal isn’t a polished commercial. It’s video content that
                earns the first three seconds in a feed and then carries a clear brand message under the surface.
              </p>
              <p className="text-lead text-text-700">
                We are a video production agency that specializes in interview-led, social-first formats, street
                interviews, public reactions, founder-led brand films, and UGC-style branded content video production ,
                not the corporate brand-film template that most video production services still ship by default.
              </p>
            </div>
          </div>
        </Section>
      )}

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

      {/* FEEL COMFORTABLE, testimonial-only, sits between Solution and Formats */}
      {isTestimonial && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>On the street</Eyebrow>
              <H2 className="mt-4">How we get strangers to open up on camera.</H2>
              <Lead className="mt-4">
                Nobody we stop has prepared for an interview. The first thirty seconds usually feel guarded. Our job
                on the day is to get past that as fast as possible so the footage sounds like a real person talking
                about a real product or service.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'A hook worth stopping for',
                    body: 'A free product, a blind test, a question people actually want to answer. The right opener pulls strangers in willingly, and willing people give real reactions.',
                  },
                  {
                    title: 'Prompts, never scripts',
                    body: 'We ask questions, we never hand out lines. Answers come out in the person\u2019s own voice, not your marketing voice, which is the entire trust signal of the format.',
                  },
                  {
                    title: 'Volume buys honesty',
                    body: 'We talk to far more people than make the final cut. The edit keeps only the genuine moments, the unprompted lines that build trust on camera because nobody could have written them.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

      {/* CTA-BUILT ADS, video-ad-only */}
      {isVideoAd && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>How we build ads</Eyebrow>
              <H2 className="mt-4">How we build ads around a clear call to action.</H2>
              <Lead className="mt-4">
                Every video ad we produce is reverse-engineered from the action you want the viewer to take.
                Hook lanes, mid-roll beats, and post-production cards all serve that one outcome, not a generic
                brand impression.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'CTA-first scripting',
                    body: 'We lock the call to action before the hook. Then we engineer 3–8 opening lines that all earn the right to ask for that specific action, install, signup, purchase, demo, follow.',
                  },
                  {
                    title: 'Real-person delivery',
                    body: 'Our creative team casts and directs for native delivery, not for talent-reel polish. Real-person ad creative converts because viewers don\u2019t register it as advertising until the call to action lands.',
                  },
                  {
                    title: 'High-quality post production',
                    body: 'Burned-in captions, on-screen CTA cards in multiple variants, vertical aspect ratio handled per platform. Same shoot, multiple end-card tests, your post-production library is built for iterative testing.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

      {/* GRAB ATTENTION, social-media-only */}
      {isSocialMedia && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>On the feed</Eyebrow>
              <H2 className="mt-4">How we make videos that grab attention.</H2>
              <Lead className="mt-4">
                Most short-form video fails in the first second. The hook is the entire game. We design every social
                media video around the question: would a real person stop scrolling for this?
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'Hook-first scripting',
                    body: 'We pre-test multiple hook lanes before the shoot. The opening question, the visual, the on-screen text, all of it is engineered for grabbing attention from a target audience that is scrolling, not searching.',
                  },
                  {
                    title: 'Native vertical post production',
                    body: 'Post-production cuts to the rhythm of the platform, fast cuts, captions burned in, no lower-thirds. The videos look like the rest of the feed, not like ads imported from elsewhere.',
                  },
                  {
                    title: 'Multiple variants to test',
                    body: 'Every hero gets 3–8 hook variations so you can ship one shoot day as a full week of paid testing across social media platforms. Engaging videos that double as a creative pipeline.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

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

      {/* MARKETING STRATEGY, branded-only */}
      {isBranded && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>In a marketing strategy</Eyebrow>
              <H2 className="mt-4">How authentic branded videos fit into your marketing strategy.</H2>
              <Lead className="mt-4">
                Branded video sits at the top and middle of the funnel. Done right, one shoot powers months of
                video marketing without forcing your team to constantly re-brief a new production agency.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'Awareness for your target audience',
                    body: 'Branded videos open with a real moment your target audience recognizes. Trust lands before the logo does, which is what the algorithm rewards on TikTok and Reels.',
                  },
                  {
                    title: 'Brand affinity at scale',
                    body: 'A single shoot day gives you 20+ cuts. Always-on social, mid-funnel content, and paid retargeting all run from the same library, so production cost drops per usable asset.',
                  },
                  {
                    title: 'Compelling narratives, repeatable cadence',
                    body: 'We design every shoot to feed compelling narratives across multiple platforms, then hand over the raw footage so your team can keep cutting after the campaign window closes.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

      {/* EXAMPLES */}
      <Section className="bg-paper-soft">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <Eyebrow>Examples</Eyebrow>
            <H2 className="mt-4">Recent {service.shortLabel.toLowerCase()} work</H2>
            <Lead className="mt-3">{service.examplesIntro}</Lead>
          </div>
          <Button href="/portfolio/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {featuredWork.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      {/* INCLUDED, heading + lead are testimonial-specific when applicable */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What you get</Eyebrow>
            <H2 className="mt-4">
              {isTestimonial
                ? 'What our testimonial video production includes.'
                : isSocialMedia
                ? 'What social media video production includes.'
                : isVideoAd
                ? 'What our video ad production covers.'
                : 'Every package, every time.'}
            </H2>
            <Lead className="mt-4">
              {isTestimonial
                ? 'Every testimonial-style shoot ships with the same baseline deliverables. Packages differ on volume, hook variations, and post-production turnaround.'
                : isSocialMedia
                ? 'Every social media video production project ships with the same baseline deliverables. Packages differ on volume, number of hooks, and post-production turnaround.'
                : isVideoAd
                ? 'Every video ad production engagement ships with the same baseline deliverables. Packages differ on volume of ads, number of hook variants, and post-production turnaround.'
                : 'No surprises. The deliverable list is the same baseline across packages, packages differ on volume, hooks, and turnaround.'}
            </Lead>
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
            {/* Always include the high-value public hubs (process / reviews / work
                / contact) alongside any of the service's own valid internal links.
                Boosts inbound link counts for those pages without spamming chrome. */}
            <InternalLinkBlock
              links={[
                ...filterPublicLinks(service.internalLinks),
                { label: 'Our Process', href: '/process/' },
                { label: 'Brand Reviews', href: '/reviews/' },
                { label: 'See Recent Work', href: '/portfolio/' },
                { label: 'Book a Call', href: '/contact/' },
              ]}
            />
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

      {/* AUTHENTIC VS OVER-SCRIPTED, testimonial-only essay block */}
      {isTestimonial && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Why this works</Eyebrow>
            <H2 className="mt-4">Why authentic testimonial videos build more trust than over-scripted brand content.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                The brands that score highest on trust have all moved the same direction over the last five years ,
                away from over-produced corporate testimonials and toward something that feels closer to a real
                interview. Most video production companies still default to the suit, the chair, the boardroom. We
                don’t, because viewers don’t finish those videos.
              </p>
              <p>
                A testimonial that looks scripted gets read as scripted no matter how true it is. So we build
                testimonial-style proof from real strangers in real environments, prompted instead of scripted. It
                holds attention longer in the feed, builds trust faster inside a paid ad account, and survives a real
                media budget more reliably than polished client testimonial videos. That’s the whole pitch for our
                testimonial video production: proof that the target audience actually believes.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* WHEN BRANDED BEATS TRADITIONAL, branded-only essay */}
      {isBranded && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Why this works</Eyebrow>
            <H2 className="mt-4">When branded videos work better than traditional ads.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Traditional ads were designed for an audience that couldn’t scroll past them. That audience doesn’t
                really exist anymore. On TikTok, Reels, Shorts, and Meta, an ad that looks like an ad gets two seconds
                of attention and then a swipe. Interview-led branded video gets six. The math on the rest of a paid
                media plan follows from there.
              </p>
              <p>
                Where traditional ads still beat branded video: tightly timed direct-response promos with a one-line
                offer. Everywhere else, awareness, brand build, trust, repositioning, branded videos in a real-person
                format outperform polished video production services on watch time, cost-per-view, and recall. That’s
                the case for choosing an interview-led production agency over a generic video production company for
                this layer of your marketing.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* MARKETING STRATEGY, social-media-only */}
      {isSocialMedia && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>In a marketing strategy</Eyebrow>
            <H2 className="mt-4">How these videos support a marketing strategy.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Social media video marketing only works when it’s tied to a real digital marketing plan. We build
                every shoot around the marketing goals you walk in with, awareness, install volume, retention, paid
                acquisition, and design the deliverables to feed both organic and paid channels from the same
                production run.
              </p>
              <p>
                The output is a content library, not a one-off ad. One shoot day gives you a hero ad, 5–15
                organic-ready clips, multiple hook variations, and raw footage. Your team can keep cutting effective
                video months after the shoot wraps.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* HOW TO TELL WHICH PERFORM, social-media-only */}
      {isSocialMedia && (
        <Section className="bg-paper-soft">
          <div className="max-w-3xl">
            <Eyebrow>What good looks like</Eyebrow>
            <H2 className="mt-4">How brands can tell which videos perform.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Hook rate (3-second view rate) and hold rate (full-watch rate) are the two metrics that predict almost
                everything else. A video with a strong hook rate but weak hold means the opening is working and the
                middle isn’t, usually a pacing fix. A video with weak hook rate gets cut and replaced with a different
                hook lane.
              </p>
              <p>
                We track key engagement metrics across every variant from the same shoot and feed the next shoot’s
                hook list with what worked. Three production cycles in, the creative pipeline gets sharp enough that
                CPMs drop and watch time climbs, the compounding payoff of treating social media video production as
                an iterative system, not a one-and-done deliverable.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* CONCEPT → POST PRODUCTION, video-ad-only */}
      {isVideoAd && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>End to end</Eyebrow>
            <H2 className="mt-4">From concept to post production.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Our video ad production runs end-to-end. We concept the campaign with your team, write the hook
                lanes and call-to-action variants, cast the talent or real strangers, shoot vertical-first on real
                streets, and own every step through post production. There is no hand-off to another video production
                services vendor halfway through, same creative team from kickoff to final export.
              </p>
              <p>
                The output is a batch of high-quality vertical video ads, each with multiple hook openings and CTA
                cards, captioned and uncaptioned exports, raw footage, and ad-account-ready filenames. Hand it to your
                media buyer and start testing the same week the cut lands.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* WHY THIS FORMAT, street-interview-only essay */}
      {isStreetInterview && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Why this format</Eyebrow>
            <H2 className="mt-4">What street interview videos are, and why they outperform polished ads.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Street interview videos are short-form vertical clips built around interviews shot in real
                environments, sidewalks, storefronts, events, public spaces, instead of studios. The format
                reads as native because everything in frame is real: the location, the subject’s reactions, the
                ambient sound. It looks like the rest of the feed instead of an ad imported from another era of
                marketing.
              </p>
              <p>
                Brands run street interview videos for the same three reasons: <strong>authentic reactions</strong>{' '}
                the audience reads as social proof on first watch, <strong>credibility</strong> that polished
                commercials can’t generate, and <strong>scalability</strong> in a paid ad account where a single
                shoot day produces eight to twenty variants for testing. The format absorbs the audience’s
                skepticism instead of triggering it.
              </p>
              <p>
                The difference from generic UGC is the production discipline. Generic UGC means random creators
                filming themselves at home, with whatever lighting, framing, and pacing they happen to bring.
                Street interview videos are produced, locations scouted, audio handled, captions burned, hooks
                pre-tested, but the on-camera subject is real. The result keeps the trust that creator content
                gives up nothing else and gains the consistency that paid media plans require.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* RECEIPTS, street-interview-only — real campaign outcomes from the portfolio */}
      {isStreetInterview && (
        <Section className="bg-paper-soft">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Receipts</Eyebrow>
            <H2 className="mt-4">What the format looks like when it works.</H2>
            <Lead className="mt-4">
              These aren’t hypotheticals. Every example below is real client work from the portfolio, with the
              moment that made it perform.
            </Lead>
          </div>
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                href: '/portfolio/mott-bow/',
                brand: 'Mott & Bow',
                title: 'The unprompted line',
                body: 'A free-shirt blind test pulled real strangers in, and one of them described the tee as “like a baby floating in a cloud.” Nobody writes that line. That’s the point, and it carried the whole comfort claim.',
              },
              {
                href: '/portfolio/cartablet/',
                brand: 'CarTablet',
                title: 'The price-reveal build',
                body: 'Multiple real interviewees guessed the price before the reveal: $1,100 guessed, $150 actual. The structure turns a discount into a story, and an off-the-cuff answer became the hook of the ad.',
              },
              {
                href: '/portfolio/zeus-hair/',
                brand: 'Zeus Hair Restoration',
                title: 'The repeatable mechanic',
                body: 'Strangers rated a photo 1–10, then saw the same face after a hair edit. Genuine “wait, no way” reactions, and a mechanic the brand can rerun with new faces every quarter.',
              },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-2xl border border-border bg-white p-6 lg:p-7 card-hover hover:border-ink-900/30 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-text-400 mb-3">{c.brand}</div>
                <div className="text-lg font-extrabold text-ink-900 tracking-tight mb-2 group-hover:text-accent transition-colors">
                  {c.title} →
                </div>
                <p className="text-text-700 text-sm leading-relaxed">{c.body}</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-text-400 max-w-2xl">
            The full library is on the <Link href="/portfolio/" className="underline hover:text-accent">portfolio page</Link>,
            every video there is real client work shipped to live ad accounts or active social channels.
          </p>
        </Section>
      )}

      {/* COST FACTORS, street-interview-only */}
      {isStreetInterview && (
        <Section dark>
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow dark>Pricing</Eyebrow>
              <H2 className="mt-4">What street interview video ads cost.</H2>
              <p className="text-lead text-white/80 mt-4">
                We don’t publish a rate card, because the honest answer depends on five variables. Here’s what
                actually moves the number, so you can walk into the call knowing what you’re scoping.
              </p>
            </div>
            <div className="lg:col-span-7 space-y-4">
              {[
                { k: 'Scripted vs unscripted', v: 'Scripted adds casting and script development. Unscripted adds street time, you talk to far more people than make the cut. Neither is automatically cheaper; they spend the budget in different places.' },
                { k: 'Shoot days and video count', v: 'One shoot day produces 20+ edited videos on most packages. More videos per day lowers your cost per asset, which is why we scope in libraries, not one-offs.' },
                { k: 'Hook variations', v: 'Hook variations are a paid add-on. Each one is a genuinely distinct opening, a different question, different on-screen text, different first frame, so your media buyer gets real test material.' },
                { k: 'Location and logistics', v: 'New York and Los Angeles are home turf. Specific events, other cities, or brand-requested locations are scoped case by case.' },
                { k: 'Usage rights', v: 'One year of paid ad-usage rights is included in every package, not sold separately. Raw footage is included too.' },
              ].map((row) => (
                <div key={row.k} className="rounded-2xl border border-white/15 bg-white/5 p-5 lg:p-6">
                  <div className="text-sm font-extrabold text-white mb-1.5">{row.k}</div>
                  <p className="text-white/75 text-sm leading-relaxed">{row.v}</p>
                </div>
              ))}
              <p className="text-white/60 text-sm pt-2">
                A one-paragraph brief is enough to get a clear scope, deliverables, hook count, turnaround, and
                price, usually within one business day of the call.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* CUSTOMER JOURNEY, testimonial-only */}
      {isTestimonial && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>Where they fit</Eyebrow>
              <H2 className="mt-4">Where customer testimonial videos fit in the customer journey.</H2>
              <Lead className="mt-4">
                A testimonial isn’t a single asset. It’s video content that earns its keep across multiple stages
                of the customer journey, from cold paid traffic through to active sales conversations.
              </Lead>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">Top of funnel, paid social</div>
                <p className="text-text-700 text-[15px] leading-relaxed">
                  Cold-traffic ads where a real person’s voice does the convincing the brand can’t. The clips run
                  as native short-form on TikTok, Reels, and Meta, built to feel like a real interview, not a
                  marketing asset.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">Mid funnel, retargeting and trust pages</div>
                <p className="text-text-700 text-[15px] leading-relaxed">
                  Interview footage from the same shoot powers retargeting ads, landing-page proof modules, and
                  on-site social-proof rails for visitors comparing your product or service against alternatives.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">Bottom funnel, sales and case study</div>
                <p className="text-text-700 text-[15px] leading-relaxed">
                  Long-form cuts double as sales-enablement video and case study reels. The same testimonial-style
                  clips become the proof your sales team and CS team send to prospects mid-cycle.
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* BRAND STORYTELLING, branded-only */}
      {isBranded && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>Brand storytelling</Eyebrow>
              <H2 className="mt-4">Storytelling built to earn the first three seconds.</H2>
              <Lead className="mt-4">
                Modern branded video production is about compelling narratives that survive the scroll. The
                polished brand-film template most video production services still ship gets two seconds of
                attention. We design every shoot to earn six.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'Open with a real moment',
                    body: 'The first frame is a real person, a real reaction, or a real environment your target audience recognizes. Brand context is layered in after attention is already won, not before.',
                  },
                  {
                    title: 'Carry one brand idea',
                    body: 'A branded video that tries to deliver four messages delivers none. We build each piece around a single brand idea, a category claim, a product truth, a customer outcome, and let the rest live in supporting cuts from the same shoot.',
                  },
                  {
                    title: 'End on something useful',
                    body: 'A memorable line viewers will quote in comments, a clear next action, or a beat that leaves the brand association. No fade-to-logo without earning it. Branded content that ends weakly gets shared less.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

      {/* PLATFORM FIT, social-media-only */}
      {isSocialMedia && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>Platform fit</Eyebrow>
              <H2 className="mt-4">What kinds of social videos we create, and where they fit.</H2>
              <Lead className="mt-4">
                Different social media platforms reward different things. We optimize each video for the channel
                it’s designed to run on, not a single master cut shipped everywhere.
              </Lead>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 lg:gap-5">
              <div className="rounded-2xl border border-border bg-white p-5 lg:p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">TikTok</div>
                <p className="text-text-700 text-[14px] leading-relaxed">
                  Hook-first edits, native pacing, fast cuts, captions burned in. Best for cold paid acquisition
                  and trend-adjacent organic.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 lg:p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">Instagram Reels</div>
                <p className="text-text-700 text-[14px] leading-relaxed">
                  Cleaner edit, tighter pacing, brand-safe framing. Best for engaging videos that move audiences
                  from awareness to consideration.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 lg:p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">YouTube Shorts</div>
                <p className="text-text-700 text-[14px] leading-relaxed">
                  Slightly longer hold, story-driven hooks, sound-on aware. Best for repurposing the strongest
                  cuts from a paid social shoot into Shorts-native content.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 lg:p-6">
                <div className="text-sm font-extrabold text-ink-900 mb-2">Meta (Facebook + Instagram feed)</div>
                <p className="text-text-700 text-[14px] leading-relaxed">
                  CTA-heavy variants, on-screen text reinforcement, captions for sound-off viewing. Best for
                  direct-response campaigns and retargeting.
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* HOOK MESSAGE CTA, video-ad-only */}
      {isVideoAd && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>The three layers</Eyebrow>
              <H2 className="mt-4">What goes into a video ad: hook, message, and call to action.</H2>
              <Lead className="mt-4">
                Every video ad we produce works in three layers. Each one is engineered separately, then stitched
                together by our creative team into something that reads as one continuous moment to the viewer.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'The hook',
                    body: 'The opening one to three seconds. A question, a pattern interrupt, a real reaction. We pre-test 3–8 hook lanes per shoot so your media buyer can ship variants the same week and find the winner inside the first round of testing.',
                  },
                  {
                    title: 'The message',
                    body: 'The mid-section that earns the right to ask for the action. A real-person line, a benefit framed as a reaction, or a category contrast. Crafted for native delivery, viewers do not register it as advertising until the call to action lands.',
                  },
                  {
                    title: 'The call to action',
                    body: 'The end card or on-screen CTA that asks for the conversion. Install, signup, purchase, demo, follow. We produce videos with multiple CTA cards in post production so you can A/B which ask converts, without a reshoot.',
                  },
                ]}
              />
            </div>
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
