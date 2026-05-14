import type { MetadataRoute } from 'next';
import { SITE, PUBLIC_PATHS } from '@/lib/site';

/**
 * Sitemap is driven directly by the PUBLIC_PATHS allowlist in lib/site.ts.
 * If a page isn't on that list it isn't reachable from chrome, isn't in the
 * sitemap, and (for [slug] handlers) returns 404. One source of truth.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  return Array.from(PUBLIC_PATHS).map((p) => {
    const isHome = p === '/';
    const isHub = p === '/services/' || p === '/work/';
    return {
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: isHome ? 1.0 : isHub ? 0.9 : 0.7,
    };
  });
}
