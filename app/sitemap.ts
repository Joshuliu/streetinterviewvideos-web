import type { MetadataRoute } from 'next';
import { SITE, PUBLIC_PATHS } from '@/lib/site';
import { ALL_WORK_VIDEOS } from '@/lib/work';

/**
 * Sitemap is driven by the PUBLIC_PATHS allowlist in lib/site.ts plus the
 * per-video portfolio URLs sourced from lib/work.ts. If a page isn't on
 * either list it isn't reachable from chrome, isn't in the sitemap, and
 * (for [slug] handlers) returns 404.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = Array.from(PUBLIC_PATHS).map((p) => {
    const isHome = p === '/';
    const isHub = p === '/services/' || p === '/portfolio/';
    return {
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: isHome ? 1.0 : isHub ? 0.9 : 0.7,
    };
  });

  // One URL per portfolio video so each clip is independently indexable
  // and shareable as /portfolio/[slug].
  const videoEntries: MetadataRoute.Sitemap = ALL_WORK_VIDEOS.map((v) => ({
    url: `${base}/portfolio/${v.id}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...videoEntries];
}
