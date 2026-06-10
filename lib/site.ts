// Resolve the canonical site URL for the *current deployment*.
// Priority:
//   1. Explicit NEXT_PUBLIC_SITE_URL override (lets you pin canonicals from Vercel env vars).
//   2. Vercel production deployment (custom domain via VERCEL_PROJECT_PRODUCTION_URL or fallback).
//   3. Vercel preview / branch deployment → use the preview URL itself
//      (so audits run against staging don't all canonical to a not-yet-live prod URL).
//   4. Local dev → use the production URL.
// This means: while production is not yet pointing at streetinterviewvideos.com,
// the staging deployment self-canonicalizes to its vercel.app URL (no broken
// canonical references). Once you point streetinterviewvideos.com at the
// project, canonicals automatically switch.
function resolveSiteUrl(): string {
  const fallback = 'https://streetinterviewvideos.com';
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercelEnv = process.env.VERCEL_ENV;
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const previewHost = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  if (vercelEnv === 'production' && prodHost) return `https://${prodHost}`;
  if ((vercelEnv === 'preview' || vercelEnv === 'development') && previewHost) {
    return `https://${previewHost}`;
  }
  return fallback;
}

const RESOLVED_URL = resolveSiteUrl();

export const SITE = {
  name: 'StreetInterviewVideos.com',
  domain: 'streetinterviewvideos.com',
  url: RESOLVED_URL,
  tagline: 'Real people. Real reactions. Social-first videos for brands.',
  bookingUrl: 'https://calendly.com/brandlaunchmediaagency/30min',
  contactEmail: 'hello@streetinterviewvideos.com',
  social: {
    instagram: 'https://instagram.com/streetinterviewvideos',
    tiktok: 'https://tiktok.com/@streetinterviewvideos',
    youtube: 'https://youtube.com/@streetinterviewvideos',
    linkedin: 'https://linkedin.com/company/streetinterviewvideos',
  },
  brandsServed: 600,
} as const;

export const CTA = {
  primary: 'Book a Call',
  secondary: 'View Work',
  examples: 'View Examples',
  packages: 'See Packages',
  build: 'Build My Campaign',
  brief: 'Send a Brief',
} as const;

// Single source of truth for the set of pages that are publicly routable +
// indexable. Anything not listed here either 404s or is rendered with
// noindex; sitemap generation reads from this set; and internal-link helpers
// filter against it so we never link to a hidden / 404 page.
export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/services/',
  '/services/scripted-street-interviews/',
  '/services/unscripted-street-interviews/',
  '/services/social-media-video-production/',
  '/services/branded-video-production/',
  '/services/testimonial-video-production/',
  '/services/video-ad-production/',
  '/services/street-interview-video-ads/',
  '/portfolio/',
  '/process/',
  '/reviews/',
  '/about/',
  '/faq/',
  '/contact/',
  '/privacy/',
]);

/** True if the given site-relative href points at a publicly indexable page. */
export function isPublicPath(href: string): boolean {
  // External URLs are out of scope.
  if (!href.startsWith('/')) return false;
  // Allow trailing-slash variants.
  const normalized = href.endsWith('/') ? href : href + '/';
  return PUBLIC_PATHS.has(normalized);
}

/** Filter a label/href list down to only links that resolve to public pages. */
export function filterPublicLinks<T extends { href: string }>(links: T[]): T[] {
  return links.filter((l) => isPublicPath(l.href));
}
