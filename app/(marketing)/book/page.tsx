import type { Metadata } from 'next';
import HomePage from '../page';

// Ad landing link: /book/ renders the homepage with the Calendly popup
// already open (see components/CalendlyBooking.tsx, which triggers on this
// path). Used as the destination on Meta lead-ad thank-you screens, so a
// lead can book immediately but lands on the site if they close the popup.
// Supports ?name= and ?email= prefill plus utm_* passthrough to Calendly.
// noindex: this is an ad destination, not a content page, and it duplicates
// the homepage.
//
// NOTE: kept as-is so existing Meta campaigns pointing at /book/ stay
// functional. The new multi-step lead funnel lives at /qualify/
// (app/qualify/page.tsx). Move campaigns over to /qualify/ when ready.
export const metadata: Metadata = {
  title: 'Book a Call | StreetInterviewVideos.com',
  robots: { index: false, follow: false },
};

export default HomePage;
