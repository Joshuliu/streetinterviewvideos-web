import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack, FAQAccordion } from '@/components/Sections';
import { RoadProcess } from '@/components/RoadProcess';
import { SchemaScript, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Our Process | StreetInterviewVideos.com',
  description:
    'How we go from brief to ad-ready in as little as 5–10 days, strategy, scripting, casting, on-the-ground filming, editing, and platform-ready delivery.',
  alternates: { canonical: '/process/' },
};

const STEPS = [
  { title: 'Choose your format', body: 'Scripted, unscripted, hybrid. We help you pick based on goal.' },
  { title: 'Share your campaign goal', body: 'A short brief + product (if applicable) is enough to kick off. We can build the rest with you.' },
  { title: 'Strategy and creative direction', body: 'Hook lanes, format mix, casting model, locations, deliverable count. Locked before scripting.' },
  { title: 'Script and questions', body: 'We write or refine the questions and prompts. You always approve before we shoot.' },
  { title: 'Casting', body: 'Actors for scripted formats. Real strangers for unscripted.' },
  { title: 'Shoot day', body: 'On-the-ground production, vertical-first. We shoot what was scripted.' },
  { title: 'Edit', body: 'Hook variations and both captioned and uncaptioned versions of each video.' },
  { title: 'Delivery', body: 'Edited videos, raw footage, captions, ad-account-ready exports. Full ad-usage rights for one year from purchase.' },
  { title: 'Launch', body: 'Push it live. We follow up with what worked and what we’d test next based on the ad account signals.' },
];

// Collapsed by default so the page stays visually lean; the answers are in the
// server-rendered DOM either way, which is what search and AI engines read.
const TIMELINE_FAQ = [
  { q: 'How long does street interview video production take?', a: 'As little as 5–10 days from brief to first cut for most projects. Unscripted shoots tend to land at 7–14 days because capturing real variance takes street time. Bigger campaigns or complex shoots run up to 21 days. The real timeline is set on the kickoff call once we’ve seen the brief.' },
  { q: 'What affects the timeline most?', a: 'Three things: format (scripted is faster than unscripted per usable beat), shoot logistics (home-turf New York and Los Angeles shoots book faster than event or travel shoots), and approval speed, the faster your team signs off on script and casting, the faster we shoot.' },
  { q: 'What do we need to provide to start?', a: 'A one-paragraph brief covering your brand, the campaign goal, the platforms you run on, and the timeline. If the campaign is product-based, you ship us product ahead of the shoot. We build everything else with you.' },
  { q: 'Can you hit a specific launch date?', a: 'Usually, if the date is realistic when we scope it. Tell us the launch date on the call and we plan backwards from it, including a buffer for your review round.' },
  { q: 'What happens after delivery?', a: 'You get final files, raw footage, captions, and ad-account-ready exports with one-year paid usage rights. After launch we follow up on what the early ad-account signals show and what we’d test next from the same shoot.' },
  { q: 'What does a revision round cover?', a: 'The approved script is produced as written, if we make an error against it, we correct it at no charge. Personal-preference changes or a new script are scoped as a new order. This is why approvals happen before the shoot, not after.' },
];

export default function ProcessPage() {
  return (
    <>
      <SchemaScript data={[breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Process', url: '/process/' }]), faqSchema(TIMELINE_FAQ)]} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Process' }]} />
        <Eyebrow>Process</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">From brief to ad-ready in as little as 5–10 days.</h1>
        <Lead className="max-w-3xl mb-8">
          A 9-step production process built around speed, flexibility, and ad-account-ready output. Most projects turn
          around in as little as 5–10 days. Bigger campaigns and complex shoots can run up to 21 days, we set the
          timeline on the kickoff call.
        </Lead>
        <CTAStack secondaryHref="/portfolio/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <RoadProcess steps={STEPS} />
      </Section>

      <Section>
        <div className="max-w-3xl mb-10">
          <Eyebrow>Phase deep-dive</Eyebrow>
          <H2 className="mt-4">What actually happens in each phase.</H2>
          <Lead className="mt-4">
            The nine steps above are the full picture. The five blocks below are how the work actually breaks down on
            the calendar, what we’re doing, what we need from your team, and what to expect from us at each stage.
          </Lead>
        </div>
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {[
            {
              title: 'Planning',
              body: 'Day 1–2. We lock the goal, the platform mix, the format (scripted, unscripted, or hybrid), the deliverable count, and the timeline. From your team: a short brief and any examples you like. From us: a written scope you sign off on before scripting starts.',
            },
            {
              title: 'Creative prep',
              body: 'Day 2–4. Hook lanes, questions or script, casting brief, location plan, shot list. You approve before we shoot a frame. If we’re casting actors, we share casting options for sign-off; if unscripted, we confirm location permits and shoot windows.',
            },
            {
              title: 'Filming',
              body: 'Day 4–7. On-the-ground production. Vertical-first. Multiple lanes, multiple looks, multiple voices. We over-shoot deliberately so the edit has options. Most projects are one full shoot day; bigger campaigns run two to three.',
            },
            {
              title: 'Review and post production',
              body: 'Day 7–10. First-cut review with hook variations, captioned and uncaptioned exports, and platform-ready aspect ratios. The approved script is produced as written; if we make an error against it we correct it at no charge. Personal-preference changes or a new script are a new order.',
            },
            {
              title: 'Delivery and iteration',
              body: 'Day 10. Final files plus raw footage land in your folder. Ad-account-ready filenames, one-year paid ad-usage rights, captions exported as side-cars. After launch, we follow up with what the early ad-account signals are showing and what we’d test next from the same shoot.',
            },
          ].map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-white p-6 lg:p-7">
              <div className="text-base font-extrabold text-ink-900 mb-3 tracking-tight">{p.title}</div>
              <p className="text-text-700 text-[15px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-text-400 mt-8 max-w-2xl">
          Day counts above are the typical 5–10 day path. Bigger campaigns or more complex shoots run up to 21 days
         , we set the real timeline on the kickoff call once we’ve seen the brief.
        </p>
      </Section>

      <Section className="bg-paper-soft">
        <div className="max-w-3xl mb-10">
          <Eyebrow>Timelines</Eyebrow>
          <H2 className="mt-4">Timeline questions, answered.</H2>
        </div>
        <FAQAccordion items={TIMELINE_FAQ} />
      </Section>

      <FinalCTA />
    </>
  );
}
