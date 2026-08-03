'use client';

import Script from 'next/script';

// Google Analytics 4 (gtag.js). The ID is public by design (it ships to the
// browser); NEXT_PUBLIC_GA_ID only exists so it can be rotated from Vercel
// env vars without a code change. SPA navigations are tracked by GA4's
// Enhanced Measurement (history-change page_view, on by default in the
// property), so no PageViewTracker is needed here.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-6TRJSLX1TW';

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
