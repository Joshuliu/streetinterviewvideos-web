import { unstable_cache } from 'next/cache';
import { asc } from 'drizzle-orm';
import { db, tables } from './db';
import type { WorkVideo } from './work';

// The portfolio's read side. Source of truth is the portfolio_videos table
// (edited from team., see app/team/(app)/portfolio); this module is what the
// MARKETING site reads. Rows come back in position order mapped onto the same
// WorkVideo shape the components have always consumed, with the slug playing
// the old `id` role, so /portfolio/[slug] URLs and every downstream component
// are unchanged.
//
// Cached under one tag: every team. portfolio mutation calls
// revalidatePortfolio(), which regenerates the homepage, /portfolio, the
// per-video pages, service pages and the sitemap on their next request. No
// deploy involved.

export const PORTFOLIO_TAG = 'portfolio';

// SERVER ONLY (db import) — don't pull this into client components; pass the
// videos down as props instead.
export const getPortfolioVideos = unstable_cache(
  async (): Promise<WorkVideo[]> => {
    const rows = await db()
      .select()
      .from(tables.portfolioVideos)
      .orderBy(asc(tables.portfolioVideos.position));
    return rows
      .filter((r) => r.published)
      .map((r) => ({
        id: r.slug,
        title: r.title,
        category: r.category,
        goal: r.goal,
        format: r.format,
        deliverables: r.deliverables,
        whyItWorked: r.whyItWorked,
        src: r.src,
        poster: r.poster,
        kind: r.kind,
      }));
  },
  ['portfolio-videos'],
  { tags: [PORTFOLIO_TAG] },
);
