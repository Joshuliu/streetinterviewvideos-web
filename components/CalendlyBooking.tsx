'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

const CALENDLY_ORIGIN = 'https://calendly.com';

// Every "Book a Call" CTA on the site is an anchor pointing at the Calendly
// booking URL (lib/site.ts -> SITE.bookingUrl). Previously those opened
// calendly.com in a NEW TAB, which means the booking completed on a different
// origin in a different tab and our page never learned it happened — so there
// was no client-side conversion signal to give Meta.
//
// This component fixes that without editing every CTA: it intercepts clicks on
// any calendly.com link and opens Calendly as an on-page POPUP (an iframe
// overlay on our own domain). Calendly then postMessages booking lifecycle
// events back to this window, and we fire the Meta "Schedule" conversion when
// 'calendly.event_scheduled' arrives — i.e. only on a genuinely completed
// booking, never on page load or a bare button click.
export function CalendlyBooking() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Respect modified clicks (open-in-new-tab, etc.) and non-primary buttons.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!href.startsWith(CALENDLY_ORIGIN)) return;
      // If the widget script hasn't loaded yet, let the normal link navigation
      // happen so the user can still book — graceful degradation.
      if (!window.Calendly) return;
      e.preventDefault();
      window.Calendly.initPopupWidget({ url: href });
    }

    function handleMessage(e: MessageEvent) {
      if (e.origin !== CALENDLY_ORIGIN) return;
      const data = e.data as { event?: string } | null;
      if (!data || typeof data !== 'object') return;
      if (data.event !== 'calendly.event_scheduled') return;
      // Completed booking → fire the Meta Schedule standard event once.
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Schedule');
      }
    }

    document.addEventListener('click', handleClick);
    window.addEventListener('message', handleMessage);
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
