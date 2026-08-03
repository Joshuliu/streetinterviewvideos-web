'use client';

import Script from 'next/script';

// Microsoft Clarity session recording + heatmaps. The ID is public by design
// (it ships to the browser); NEXT_PUBLIC_CLARITY_ID only exists so it can be
// rotated from Vercel env vars without a code change. Clarity hooks the
// history API itself, so SPA navigations are tracked without a PageViewTracker.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? 'xwry1vqzug';

export function Clarity() {
  if (!CLARITY_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`}
    </Script>
  );
}
