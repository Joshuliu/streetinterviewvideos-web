import type { Metadata } from 'next';
import Link from 'next/link';
import { SCRIPTED_WORK_VIDEOS } from '@/lib/work';
import { VideoTile } from '@/components/VideoCard';
import { Button } from '@/components/Button';
import { SITE, CTA } from '@/lib/site';
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
  title: 'Scripted Street Interviews | StreetInterviewVideos.com',
  description:
    'Actor-led street interview videos for brands. Cleaner edit, brand-controlled message, fastest path to a hero ad for cold paid acquisition.',
  alternates: { canonical: '/services/scripted-street-interviews/' },
};

const FAQ = [
  { q: 'How is "scripted" different from a regular commercial?', a: 'The format is still street-interview, vertical, real-environment, real-feeling. The script just sets the questions, hook beats, and brand mention so the edit is reliable. Actors are cast to deliver like real people, not like talent.' },
  { q: 'Why pick scripted over unscripted?', a: 'When you need the ad to consistently land a specific brand message, hit a specific hook, and be ad-account-ready on a deadline. Unscripted is higher trust but slower per usable beat.' },
  { q: 'Do the actors feel like real people?', a: 'Yes, that’s the whole casting brief. We cast non-traditional, age- and demo-appropriate talent. The format reads as native because the environment and reactions are real even when the words are scripted.' },
  { q: 'Can we approve the script before the shoot?', a: 'Always. Brand approves questions, hook beats, and CTA before we shoot a frame.' },
  { q: 'How many videos do we get?', a: '20+ edited videos per shoot day, plus captioned and uncaptioned exports and raw footage. Hook variations are available as a paid add-on.' },
  { q: 'How fast is turnaround?', a: 'As little as 5–10 days from brief to first cut. Bigger campaigns up to 21 days.' },
  { q: 'How much does a scripted street interview shoot cost?', a: 'It depends on shoot days, video count, casting, and hook variations, so we scope per project instead of publishing a rate card. A one-paragraph brief is enough to get a clear scope with deliverables and price. One-year paid usage rights are included in every package.' },
  { q: 'Can we mix scripted and unscripted in one campaign?', a: 'Yes, and most long-term clients do. A scripted hero carries the message on cold traffic while unscripted reactions run behind it as proof. Both can come out of the same production cycle.' },
  { q: 'Who owns the videos?', a: 'You do. Every package includes the edited videos, raw footage, and one year of paid ad-usage rights across TikTok, Meta, Reels, Shorts, and YouTube.' },
  { q: 'Where do you film?', a: 'Primarily New York and Los Angeles. Specific events and brand-requested locations are accommodated case by case.' },
];

const recentWork = SCRIPTED_WORK_VIDEOS.slice(0, 6);

export default function ScriptedPage() {
  return (
    <>
      <SchemaScript
        data={[
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services/' },
            { name: 'Scripted Street Interviews', url: '/services/scripted-street-interviews/' },
          ]),
          faqSchema(FAQ),
        ]}
      />

      {/* HERO */}
      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: 'Scripted Street Interviews' }]} />
        <Eyebrow>Path 1 · Scripted</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6 max-w-4xl">
          Scripted street interviews. <span className="text-accent">Brand-controlled, ad-account-ready.</span>
        </h1>
        <Lead className="max-w-3xl mb-8">
          Actor-led street interviews where the questions, hook beats, and brand mentions are planned in advance.
          Cleaner edit, reliable hook delivery, the fastest path to a hero ad you can actually scale on cold traffic.
        </Lead>
        <CTAStack secondaryHref="/portfolio/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {/* WHEN TO PICK SCRIPTED */}
      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>When to pick scripted</Eyebrow>
            <H2 className="mt-4">If you need a hero ad that reliably hits, this is the lane.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              Scripted is the right pick when the brand message has to land specifically, the hook has to deliver on the
              first frame, and the timeline doesn’t allow for the higher variance of pure unscripted capture.
            </p>
            <p className="text-lead text-text-700">
              It still reads as native, vertical, real environment, real-feeling delivery. The script is a planning
              tool, not a teleprompter.
            </p>
          </div>
        </div>
      </Section>

      {/* BEST FOR */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Best for</Eyebrow>
          <H2 className="mt-4">Three signals you should go scripted.</H2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {[
            { title: 'Cold paid acquisition', body: 'When the ad needs to do the convincing on first watch: you want every hook firing the same way every time.' },
            { title: 'Brand-message control', body: 'When the messaging has to land exactly. Compliance, regulatory copy, specific differentiator: scripted protects that.' },
            { title: 'Speed to a hero ad', body: 'When you need a reliable hero in the next two weeks, not a stack of variance you have to sort through.' },
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

      {/* QUESTIONS AND CAMPAIGN FIT */}
      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>How scripts get written</Eyebrow>
            <H2 className="mt-4">How we structure questions and prompts for scripted shoots.</H2>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <p className="text-lead text-text-700">
              A scripted street interview script isn’t a monologue. It’s a short stack of questions and prompt
              beats that the actor delivers like a real person being interviewed. The questions are the structure;
              the answers stay loose enough to land natively on camera.
            </p>
            <p className="text-lead text-text-700">
              We typically build three layers per shoot: the hook question (what stops the scroll), one or two
              product questions (what the brand actually wants the audience to take away), and a closing beat (the
              line we want the viewer leaving with). Brand approves all three before we shoot a frame.
            </p>
            <p className="text-lead text-text-700">
              Where scripted street interviews fit in a campaign: hero ads for cold paid acquisition, launch
              creative on a tight timeline, and any moment when the brand message has to land precisely the same
              way every time the ad runs.
            </p>
          </div>
        </div>
      </Section>

      {/* SCRIPTED VS UNSCRIPTED, DECISION GUIDE */}
      <Section dark>
        <div className="max-w-3xl mb-10">
          <Eyebrow dark>The decision</Eyebrow>
          <H2 className="mt-4">Scripted vs unscripted, decided in sixty seconds.</H2>
          <p className="text-lead text-white/80 mt-4">
            The honest version of the comparison, the same one we walk through on the kickoff call. Neither lane
            is better. They buy different things with the same budget.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { dim: 'Message control', s: 'Exact. Hook, claim, and CTA land the same way every take.', u: 'Directional. Questions are designed so honest answers land on-brand, but nobody is handed lines.' },
            { dim: 'Trust ceiling', s: 'High for the format, far above studio ads, below real strangers.', u: 'The highest available. Reactions are verifiably unrehearsed, and audiences can tell.' },
            { dim: 'Speed to a hero ad', s: 'Fastest. As little as 5–10 days from brief to first cut.', u: 'Slower per usable beat, as little as 7–14 days, because variance has to be captured and cut.' },
            { dim: 'Edit variance', s: 'Low. You know roughly what the hero looks like before the shoot.', u: 'High, and it’s the asset. The unprompted lines nobody could write are what survive the edit.' },
            { dim: 'Funnel fit', s: 'Cold paid acquisition, launches on deadlines, compliance-sensitive claims.', u: 'Trust-led campaigns, skeptical categories, retargeting proof, repositioning.' },
          ].map((row) => (
            <div key={row.dim} className="rounded-2xl border border-white/15 bg-white/5 p-5 lg:p-6">
              <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/45 mb-3">{row.dim}</div>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
                <div>
                  <div className="text-xs font-extrabold text-accent mb-1">Scripted</div>
                  <p className="text-white/80 text-sm leading-relaxed">{row.s}</p>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white/60 mb-1">Unscripted</div>
                  <p className="text-white/80 text-sm leading-relaxed">{row.u}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-white/60 max-w-2xl">
          Most brands that run the format long-term end up using both, a scripted hero for cold traffic, unscripted
          proof behind it. If you’re unsure, that’s literally what the kickoff call is for.
        </p>
      </Section>

      {/* WHAT YOU GET */}
      <Section>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>What you get</Eyebrow>
            <H2 className="mt-4">Every scripted shoot, every time.</H2>
            <Lead className="mt-4">
              The deliverable list is the same baseline, packages differ on volume, hook variants, and turnaround.
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
                'Actor releases',
                'On-camera brand direction',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Process</Eyebrow>
          <H2 className="mt-4">From brief to ad-ready in as little as 5–10 days.</H2>
        </div>
        <ProcessSteps
          steps={[
            { title: 'Strategy', body: 'Goals, audience, platform mix, hook lanes: locked before scripting.' },
            { title: 'Script & questions', body: 'We write or refine the questions, hook beats, and brand mentions. You always approve before we shoot.' },
            { title: 'Casting & shoot', body: 'Actors cast for native delivery. Shot vertical-first on real streets, in real environments.' },
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
            <H2 className="mt-4">Recent scripted work.</H2>
          </div>
          <Button href="/portfolio/" variant="secondary">View All Work</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {recentWork.map((v) => <VideoTile key={v.id} video={v} />)}
        </div>
      </Section>

      {/* SCRIPTED VS UNSCRIPTED, CROSS-LINK */}
      <Section>
        <div className="rounded-3xl border border-border bg-white p-8 lg:p-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <Eyebrow>Reconsidering?</Eyebrow>
              <h2 className="text-h2 font-extrabold tracking-tight mt-4 mb-3">
                The other path is <span className="text-accent">unscripted street interviews</span>.
              </h2>
              <p className="text-text-700 leading-relaxed">
                If you don’t have a script and want real strangers reacting on camera, no actors, no
                rehearsal, the unscripted approach might fit better.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button href="/services/unscripted-street-interviews/" variant="secondary">See unscripted →</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* MORE FROM US, internal cross-links to deepen graph */}
      <Section>
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-5">
          {[
            { label: 'Video Ad Production', href: '/services/video-ad-production/', sub: 'Paid social ads built around scripted hooks.' },
            { label: 'Social Media Video', href: '/services/social-media-video-production/', sub: 'Feed-native shorts, captioned and ready.' },
            { label: 'Our Process', href: '/process/', sub: 'Brief to ad-ready in as little as 5–10 days.' },
            { label: 'Brand Reviews', href: '/reviews/', sub: 'What 700+ brand teams say about working with us.' },
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
          <H2 className="mt-4">Common questions about scripted.</H2>
        </div>
        <FAQAccordion items={FAQ} />
      </Section>

      <FinalCTA headline="Ready to ship a scripted hero ad?" />
    </>
  );
}
