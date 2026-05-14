import type { Metadata } from 'next';
import { Section, Eyebrow, H2, Lead, FinalCTA, Breadcrumb, TrustLine, CTAStack, FAQAccordion } from '@/components/Sections';
import { SITE_FAQ } from '@/lib/faq';
import { SchemaScript, faqSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Street Interview Video FAQ | StreetInterviewVideos.com',
  description:
    'Common questions about street interview video pricing, production, actors vs real strangers, ad usage, raw footage, captions, and turnaround time.',
  alternates: { canonical: '/faq/' },
};

export default function FAQPage() {
  const allQs = SITE_FAQ.flatMap((c) => c.questions);
  return (
    <>
      <SchemaScript
        data={[
          faqSchema(allQs),
          breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq/' }]),
        ]}
      />

      <Section>
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
        <Eyebrow>FAQ</Eyebrow>
        <h1 className="text-display-1 headline-display mt-5 mb-6">Street interview video FAQ.</h1>
        <Lead className="max-w-3xl mb-8">
          Pricing, process, actors vs real people, ad usage, raw footage, captions, turnaround. The full list.
        </Lead>
        <CTAStack secondaryHref="/contact/" secondaryLabel="Contact Us" />
        <div className="mt-8"><TrustLine /></div>
      </Section>

      {SITE_FAQ.map((category) => (
        <Section key={category.category} className="bg-paper-soft odd:bg-white">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Eyebrow>Category</Eyebrow>
              <H2 className="mt-4">{category.category}</H2>
            </div>
            <div className="lg:col-span-8">
              <FAQAccordion items={category.questions} />
            </div>
          </div>
        </Section>
      ))}

      <FinalCTA />
    </>
  );
}
