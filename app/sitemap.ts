import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { SERVICES } from '@/lib/services';
import { INDUSTRIES } from '@/lib/industries';
import { WORK_CATEGORIES } from '@/lib/work';
import { CASE_STUDIES } from '@/lib/case-studies';
import { RESOURCE_TOPICS, RESOURCE_ARTICLES } from '@/lib/resources';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes = [
    '/',
    '/services/',
    '/industries/',
    '/work/',
    '/case-studies/',
    '/process/',
    '/reviews/',
    '/about/',
    '/faq/',
    '/contact/',
    '/resources/',
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }));

  const services = SERVICES.map((s) => ({
    url: `${base}/services/${s.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: s.priority === 0 ? 1.0 : s.priority === 1 ? 0.9 : 0.7,
  }));

  const industries = INDUSTRIES.map((i) => ({
    url: `${base}/industries/${i.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const work = WORK_CATEGORIES.map((c) => ({
    url: `${base}/work/${c.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const cases = CASE_STUDIES.map((c) => ({
    url: `${base}/case-studies/${c.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const topics = RESOURCE_TOPICS.map((t) => ({
    url: `${base}/resources/${t.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const articles = RESOURCE_ARTICLES.map((a) => ({
    url: `${base}/resources/${a.topic}/${a.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...services, ...industries, ...work, ...cases, ...topics, ...articles];
}
