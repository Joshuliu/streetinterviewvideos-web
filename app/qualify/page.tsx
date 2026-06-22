import type { Metadata } from 'next';
import { LeadFunnel } from '@/components/LeadFunnel';

// /qualify/ is the lead funnel that replaces Meta lead-ad forms: a gated
// multi-step form (name/email → company/website → monthly ad spend) that
// ends on a prefilled Calendly. Name/email are captured after step 1 via
// /api/lead, so a lead is owned even if the visitor never books. utm_* on
// the landing URL flow through to the lead record and into Calendly.
//
// Point new Meta campaigns here. The older /book/ ad destination (instant
// Calendly popup over the homepage) is kept as-is for currently-live
// campaigns. noindex: this is an ad destination, not a content page.
export const metadata: Metadata = {
  title: 'Get Started | StreetInterviewVideos.com',
  robots: { index: false, follow: false },
};

export default function QualifyPage() {
  return <LeadFunnel />;
}
