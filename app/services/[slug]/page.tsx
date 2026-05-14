import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES, SERVICE_BY_SLUG } from '@/lib/services';
import { ALL_WORK_VIDEOS } from '@/lib/work';
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
    openGraph: { title: service.title, description: service.meta, url: `/services/${service.slug}/`, type: 'website' },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  if (!PUBLIC_SERVICE_SLUGS.has(params.slug)) notFound();
  const service = SERVICE_BY_SLUG[params.slug];
  if (!service) notFound();

  const isTestimonial = service.slug === 'testimonial-video-production';
  const isBranded = service.slug === 'branded-video-production';
  const isSocialMedia = service.slug === 'social-media-video-production';

  // Only surface related-service cards that are themselves public; otherwise we'd
  // be linking to hidden/404 pages.
  const related = service.related
    .filter((s) => PUBLIC_SERVICE_SLUGS.has(s))
    .map((s) => SERVICE_BY_SLUG[s])
    .filter(Boolean);
  const featuredWork = ALL_WORK_VIDEOS.slice(0, 6);

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
            <CTAStack secondaryHref="/work/" secondaryLabel={CTA.examples} />
            <div className="mt-8"><TrustLine /></div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {featuredWork.slice(0, 4).map((v) => (
              <VideoTile key={v.id} video={v} />
            ))}
          </div>
        </div>
      </Section>

      {/* WHAT IT MEANS — branded-only, explanatory framing */}
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
                We are a video production agency that specializes in interview-led, social-first formats — street
                interviews, public reactions, founder-led brand films, and UGC-style branded content video production —
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

      {/* FEEL COMFORTABLE — testimonial-only, sits between Solution and Formats */}
      {isTestimonial && (
        <Section className="bg-paper-soft">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>On set</Eyebrow>
              <H2 className="mt-4">How we help customers feel comfortable on camera.</H2>
              <Lead className="mt-4">
                Most clients have never sat for an interview before. The first thirty seconds usually feel stiff. Our
                job on the day is to get past that as fast as possible so the rest of the footage sounds like a real
                person talking about a real product or service.
              </Lead>
            </div>
            <div className="lg:col-span-7">
              <PillarCards
                pillars={[
                  {
                    title: 'Off-camera warm-up',
                    body: 'We chat about anything for ten minutes before the camera rolls — coffee, traffic, weekend. By the time we ask the real questions, the customer is just continuing a conversation.',
                  },
                  {
                    title: 'Prompts, never scripts',
                    body: 'Your customer sees the topics they\u2019ll talk about, never the exact lines. Their answers come out in their own voice, not your marketing voice.',
                  },
                  {
                    title: 'The first two takes are throwaways',
                    body: 'We tell every interviewee the first two takes don\u2019t count. It removes the pressure to be perfect. The third take is usually the one that builds trust on camera.',
                  },
                ]}
              />
            </div>
          </div>
        </Section>
      )}

      {/* GRAB ATTENTION — social-media-only */}
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
                    body: 'We pre-test multiple hook lanes before the shoot. The opening question, the visual, the on-screen text — all of it is engineered for grabbing attention from a target audience that is scrolling, not searching.',
                  },
                  {
                    title: 'Native vertical post production',
                    body: 'Post-production cuts to the rhythm of the platform — fast cuts, captions burned in, no lower-thirds. The videos look like the rest of the feed, not like ads imported from elsewhere.',
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

      {/* MARKETING STRATEGY — branded-only */}
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
                    body: 'A single shoot day gives you 8–20 cuts. Always-on social, mid-funnel content, and paid retargeting all run from the same library — so production cost drops per usable asset.',
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
          <Button href="/work/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {featuredWork.map((v) => (
            <VideoTile key={v.id} video={v} />
          ))}
        </div>
      </Section>

      {/* INCLUDED — heading + lead are testimonial-specific when applicable */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What you get</Eyebrow>
            <H2 className="mt-4">
              {isTestimonial
                ? 'What our testimonial video production includes.'
                : isSocialMedia
                ? 'What social media video production includes.'
                : 'Every package, every time.'}
            </H2>
            <Lead className="mt-4">
              {isTestimonial
                ? 'Every customer testimonial video shoot ships with the same baseline deliverables. Packages differ on volume, hook variations, and post-production turnaround.'
                : isSocialMedia
                ? 'Every social media video production project ships with the same baseline deliverables. Packages differ on volume, number of hooks, and post-production turnaround.'
                : 'No surprises. The deliverable list is the same baseline across packages — packages differ on volume, hooks, and turnaround.'}
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
                { label: 'See Recent Work', href: '/work/' },
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

      {/* AUTHENTIC VS OVER-SCRIPTED — testimonial-only essay block */}
      {isTestimonial && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Why this works</Eyebrow>
            <H2 className="mt-4">Why authentic testimonial videos build more trust than over-scripted brand content.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                The brands that score highest on trust have all moved the same direction over the last five years —
                away from over-produced corporate testimonials and toward something that feels closer to a real
                interview. Most video production companies still default to the suit, the chair, the boardroom. We
                don’t, because viewers don’t finish those videos.
              </p>
              <p>
                A testimonial that looks scripted gets read as scripted no matter how true it is. Authentic-feeling
                client testimonials — real customers, real environments, prompted instead of scripted — hold attention
                longer in the feed, build trust faster inside a paid ad account, and survive a real media budget more
                reliably than polished alternatives. That’s the whole pitch for our testimonial video production:
                proof that the target audience actually believes.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* WHEN BRANDED BEATS TRADITIONAL — branded-only essay */}
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
                offer. Everywhere else — awareness, brand build, trust, repositioning — branded videos in a real-person
                format outperform polished video production services on watch time, cost-per-view, and recall. That’s
                the case for choosing an interview-led production agency over a generic video production company for
                this layer of your marketing.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* MARKETING STRATEGY — social-media-only */}
      {isSocialMedia && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>In a marketing strategy</Eyebrow>
            <H2 className="mt-4">How these videos support a marketing strategy.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Social media video marketing only works when it’s tied to a real digital marketing plan. We build
                every shoot around the marketing goals you walk in with — awareness, install volume, retention, paid
                acquisition — and design the deliverables to feed both organic and paid channels from the same
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

      {/* HOW TO TELL WHICH PERFORM — social-media-only */}
      {isSocialMedia && (
        <Section className="bg-paper-soft">
          <div className="max-w-3xl">
            <Eyebrow>What good looks like</Eyebrow>
            <H2 className="mt-4">How brands can tell which videos perform.</H2>
            <div className="mt-6 space-y-5 text-text-700 text-lead leading-relaxed">
              <p>
                Hook rate (3-second view rate) and hold rate (full-watch rate) are the two metrics that predict almost
                everything else. A video with a strong hook rate but weak hold means the opening is working and the
                middle isn’t — usually a pacing fix. A video with weak hook rate gets cut and replaced with a different
                hook lane.
              </p>
              <p>
                We track key engagement metrics across every variant from the same shoot and feed the next shoot’s
                hook list with what worked. Three production cycles in, the creative pipeline gets sharp enough that
                CPMs drop and watch time climbs — the compounding payoff of treating social media video production as
                an iterative system, not a one-and-done deliverable.
              </p>
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
