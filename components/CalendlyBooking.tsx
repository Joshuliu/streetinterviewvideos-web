'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { SITE } from '@/lib/site';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

const CALENDLY_ORIGIN = 'https://calendly.com';

// Query params we forward from our URL into the Calendly popup. name/email
// prefill the booking form (Calendly's standard prefill params); utm_* pass
// through so each booking carries its ad/campaign attribution into Calendly.
const FORWARDED_PARAMS = ['name', 'email', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

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

    // Auto-open mode for ad landing links: /book/ (a noindex route that
    // renders the homepage) and /?booking=1 both open the Calendly popup on
    // page load, with name/email prefill and utm_* attribution forwarded from
    // our URL into Calendly. Closing the popup leaves the visitor on the site
    // instead of a dead-end calendly.com tab. The URL is rewritten to "/"
    // after opening so a refresh or copied link doesn't re-trigger the popup.
    let pollId: ReturnType<typeof setInterval> | undefined;
    const params = new URLSearchParams(window.location.search);
    const isBookPath = window.location.pathname.replace(/\/+$/, '') === '/book';
    if (isBookPath || params.get('booking') === '1') {
      const calendlyUrl = new URL(SITE.bookingUrl);
      for (const key of FORWARDED_PARAMS) {
        const value = params.get(key);
        if (value) calendlyUrl.searchParams.set(key, value);
      }
      const cleanPath = isBookPath ? '/' : window.location.pathname;
      const openPopup = () => {
        if (!window.Calendly) return false;
        window.Calendly.initPopupWidget({ url: calendlyUrl.toString() });
        window.history.replaceState(null, '', cleanPath);
        return true;
      };
      if (!openPopup()) {
        // widget.js loads afterInteractive; poll briefly until it's ready.
        let attempts = 0;
        pollId = setInterval(() => {
          attempts += 1;
          if (openPopup() || attempts > 40) clearInterval(pollId);
        }, 250);
      }
    }

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('message', handleMessage);
      if (pollId) clearInterval(pollId);
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
