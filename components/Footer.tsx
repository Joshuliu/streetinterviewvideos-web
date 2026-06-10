import Link from 'next/link';
import { SITE } from '@/lib/site';

const PRIMARY_LINKS = [
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'Services', href: '/services/' },
  { label: 'Process', href: '/process/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'About', href: '/about/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact', href: '/contact/' },
];

// Reachable SEO sub-pages, surfaced here so they're not orphaned.
// Intentionally lighter typography than the primary nav.
// Note: /services/video-production-for-brands/ stays alive at its URL but is
// intentionally not surfaced here, too weak to live in chrome.
const SERVICE_LINKS = [
  { label: 'Scripted Street Interviews', href: '/services/scripted-street-interviews/' },
  { label: 'Unscripted Street Interviews', href: '/services/unscripted-street-interviews/' },
  { label: 'Video Ad Production', href: '/services/video-ad-production/' },
  { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
  // Testimonial Video Production is hidden site-wide (format doesn't
  // match what we actually shoot). Page stays live at its URL for SEO.
  // { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
  { label: 'Branded Video Production', href: '/services/branded-video-production/' },
  { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
];

export function Footer() {
  return (
    <footer className="asphalt-bg text-white">
      <div className="max-w-site mx-auto px-6 lg:px-12 py-14 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Brand block */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              aria-label="StreetInterviewVideos.com, home"
              className="inline-block bg-white rounded-2xl px-5 py-4 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <img
                src="/siv-logo.png"
                alt="StreetInterviewVideos.com"
                width={991}
                height={791}
                className="h-20 w-auto"
              />
            </Link>
            <p className="mt-5 text-white/65 leading-relaxed max-w-sm text-sm">
              Street interview videos, UGC-style ads, and authentic short-form content for brands running TikTok,
              Instagram, Reels, Shorts, and Meta.
            </p>
          </div>

          {/* Primary nav */}
          <div className="lg:col-span-3">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/45 mb-4">Site</div>
            <ul className="space-y-2.5 text-sm text-white/85">
              {PRIMARY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-accent transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO sub-services */}
          <div className="lg:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-white/45 mb-4">Services</div>
            <ul className="space-y-2.5 text-sm text-white/70">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-accent transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="road-dash dark mt-12 mb-6" />
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/50">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} {SITE.name}. {SITE.tagline}</span>
            <Link href="/privacy/" className="hover:text-accent transition-colors">Privacy Policy</Link>
          </div>
          <div className="flex gap-5">
            <a href={SITE.social.instagram} className="hover:text-accent transition-colors">Instagram</a>
            <a href={SITE.social.tiktok} className="hover:text-accent transition-colors">TikTok</a>
            <a href={SITE.social.youtube} className="hover:text-accent transition-colors">YouTube</a>
            <a href={SITE.social.linkedin} className="hover:text-accent transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
