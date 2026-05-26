'use client';

import { useEffect, useState } from 'react';
import { SITE, CTA } from '@/lib/site';

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  return (
    <div className="sticky-mobile-cta">
      <a
        href={SITE.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="sticky-mobile-book"
        className="sign-btn-cta w-full text-sm"
      >
        {CTA.primary}
      </a>
    </div>
  );
}
