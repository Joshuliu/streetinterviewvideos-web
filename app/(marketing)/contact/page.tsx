import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine } from '@/components/Sections';
import { Button } from '@/components/Button';
import { SITE, CTA } from '@/lib/site';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Contact | StreetInterviewVideos.com',
  description:
    'Book a call or send a brief. We’ll respond within one business day with format recommendations and examples.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
        <Eyebrow>Contact</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Let’s build your next campaign.</h1>
        <Lead className="max-w-3xl mb-2">
          Book a call directly. We’ll review your goals, the platforms you’re running on, and the format that fits, then
          send a clear scope.
        </Lead>
        <p className="text-text-400 mb-8">Or send a brief by email. We respond in one business day.</p>
        <div className="mt-2"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white border border-border p-8 lg:p-10 shadow-sm">
              <Eyebrow>Book a call</Eyebrow>
              <h2 className="text-h2 font-extrabold tracking-tight mt-4 mb-3">15-minute discovery call.</h2>
              <p className="text-text-700 mb-8">Pick a time that works. We’ll talk format, goals, and recommendations. No deck.</p>
              <Button
                href={SITE.qualifyPath}
                variant="cta"
                size="lg"
                className="w-full sm:w-auto"
                dataCta="contact-book"
              >
                {CTA.primary}
              </Button>
              <div className="text-xs text-text-400 mt-4">
                Prefer email? <a href={`mailto:${SITE.contactEmail}`} className="underline hover:text-accent">{SITE.contactEmail}</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-ink-900 text-white p-8 lg:p-10">
              <Eyebrow dark>What to share</Eyebrow>
              <h3 className="text-h3 font-bold mt-4 mb-4">A short brief is all we need.</h3>
              <ul className="space-y-3 text-white/85 text-sm">
                {[
                  'Brand and category',
                  'Campaign goal (launch, awareness, paid acquisition, retargeting)',
                  'Platforms (TikTok, Meta, Reels, Shorts, YouTube)',
                  'Timeline',
                  'Examples of work you like',
                  'Anything off-limits',
                ].map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-sm text-white/70">
                We’ll send back format recommendations, example videos, and a clear scope after the call.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>What happens next</Eyebrow>
          <H2 className="mt-4 mb-8">After you reach out.</H2>
          <ol className="space-y-5">
            {[
              { n: '1', title: 'Reply within one business day', body: 'We confirm we can take the project, ask any clarifying questions, and propose a 15-minute discovery call so we can talk format and goals before any deck or quote.' },
              { n: '2', title: 'Discovery call', body: 'Goals, platforms, format fit (scripted vs unscripted vs hybrid), timeline, and budget range. We also flag whether scripted or unscripted is the better fit and why: so the recommendation is clear before you commit.' },
              { n: '3', title: 'Scope and start', body: 'You get a written scope with deliverables, hook count, post-production turnaround, paid usage rights, and price. Sign-off kicks off planning the same week: first cut typically lands inside ten days from there.' },
            ].map((s) => (
              <li key={s.n} className="flex gap-5 items-start">
                <div className="shrink-0 h-9 w-9 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-sm">{s.n}</div>
                <div>
                  <div className="text-base font-extrabold text-ink-900 mb-1">{s.title}</div>
                  <p className="text-text-700 text-[15px] leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-text-400 mt-8">
            The faster we have your goal, platforms, and timeline in writing, the faster we can quote, a one-paragraph
            brief is plenty to start.
          </p>
        </div>
      </Section>

      <FinalCTA headline="Ready when you are." />
    </>
  );
}
