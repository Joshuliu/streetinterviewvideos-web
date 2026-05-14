import type { Metadata } from 'next';
import { Section, Eyebrow, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack } from '@/components/Sections';
import { RoadProcess } from '@/components/RoadProcess';
import { SchemaScript, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Our Process | StreetInterviewVideos.com',
  description:
    'How we go from brief to ad-ready in as little as 5–10 days — strategy, scripting, casting, on-the-ground filming, editing, and platform-ready delivery.',
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
  { title: 'Delivery', body: 'Edited videos, raw footage, captions, ad-account-ready exports. You own everything.' },
  { title: 'Launch', body: 'Push it live. We follow up with what worked and what we’d test next based on the ad account signals.' },
];

export default function ProcessPage() {
  return (
    <>
      <SchemaScript data={breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Process', url: '/process/' }])} />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Process' }]} />
        <Eyebrow>Process</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">From brief to ad-ready in as little as 5–10 days.</h1>
        <Lead className="max-w-3xl mb-8">
          A 9-step production process built around speed, flexibility, and ad-account-ready output. Most projects turn
          around in as little as 5–10 days. Bigger campaigns and complex shoots can run up to 21 days — we set the
          timeline on the kickoff call.
        </Lead>
        <CTAStack secondaryHref="/work/" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      <Section className="bg-paper-soft">
        <RoadProcess steps={STEPS} />
      </Section>

      <FinalCTA />
    </>
  );
}
