'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { SITE, CTA } from '@/lib/site';

const NAV_LINKS = [
  { label: 'Services', href: '/services/' },
  { label: 'Work', href: '/work/' },
  { label: 'Process', href: '/process/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'About', href: '/about/' },
  { label: 'FAQ', href: '/faq/' },
];

// Two rivet dots so plates have rivets at all four corners
// (top corners come from the .hang-plate ::before / ::after).
function Plate({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`hang-plate ${className}`}>
      {children}
      <span aria-hidden className="rivet-bl" />
      <span aria-hidden className="rivet-br" />
    </span>
  );
}

export function NavBar() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  // Track scroll position so the floating nav can flip to a frosted backdrop
  // once page content scrolls under it. Without this, headings and body copy
  // collide visually with the brand sign and hamburger on mobile.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <header className={`nav-hanging${scrolled || mobileOpen ? ' is-scrolled' : ''}`}>
      <div className="nav-rod" />
      <div className="max-w-site mx-auto flex items-start justify-between gap-3 px-6 lg:px-10 xl:px-12 pt-0 pb-2">
        {/* LOGO sign */}
        <Link href="/" className="hang" aria-label="StreetInterviewVideos.com home">
          <Plate className="hang-plate--brand">
            StreetInterviewVideos<span className="dot">.com</span>
          </Plate>
        </Link>

        {/* NAV link signs (desktop) */}
        <nav className="hidden lg:flex items-start gap-2 xl:gap-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hang ${isActive(l.href) ? 'is-active' : ''}`}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              <Plate>{l.label}</Plate>
            </Link>
          ))}
        </nav>

        {/* CTA sign (desktop) */}
        <div className="hidden lg:block">
          <a
            href={SITE.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hang"
            data-cta="nav-book"
          >
            <Plate className="hang-plate--cta">{CTA.primary}</Plate>
          </a>
        </div>

        {/* Mobile: hamburger as a hanging sign */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="lg:hidden hang"
        >
          <Plate className="hang-plate--icon">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M2 3h14M2 7h14M2 11h14" />
            </svg>
          </Plate>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="nav-rod" />
          <div className="flex items-start justify-between px-6 pt-0 pb-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className="hang" aria-label="StreetInterviewVideos.com home">
              <Plate className="hang-plate--brand">
                StreetInterviewVideos<span className="dot">.com</span>
              </Plate>
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="hang">
              <Plate className="hang-plate--icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </Plate>
            </button>
          </div>

          {/* Mobile menu items: no mast (no visible rod to hang from) */}
          <nav className="px-6 py-6 space-y-4 flex flex-col items-start pb-32">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`hang hang--bare ${isActive(l.href) ? 'is-active' : ''}`}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                <Plate className="hang-plate--brand">{l.label}</Plate>
              </Link>
            ))}
          </nav>

          <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-border flex justify-center">
            <a
              href={SITE.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hang hang--bare"
            >
              <Plate className="hang-plate--cta">{CTA.primary}</Plate>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
