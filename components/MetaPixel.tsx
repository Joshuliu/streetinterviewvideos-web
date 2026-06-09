'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

// Meta (Facebook) Pixel. ID lives in NEXT_PUBLIC_FB_PIXEL_ID so it can be
// rotated from Vercel env vars without a code change. The ID is public by
// design (it ships to the browser), the env var is purely for configurability.
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Fires a PageView on every client-side navigation. The base snippet below
// already fires the FIRST PageView on hard load, so we skip the initial mount
// here to avoid double-counting it. usePathname/useSearchParams must live
// behind a Suspense boundary (Next.js App Router requirement).
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  // No ID configured (e.g. a preview without the env var) → render nothing.
  if (!PIXEL_ID) return null;

  return (
    <>
      {/* Official Meta base pixel loader. Initialised once; subsequent
          PageViews come from PageViewTracker, never a re-init. */}
      <Script id="fb-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
