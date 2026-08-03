// One-time seed: copy the hardcoded portfolio (lib/work.ts) into
// portfolio_videos, preserving the curated order as positions 1024, 2048, ...
// (fractional drag inserts take midpoints, so the gaps matter).
//
// Idempotent: rows are keyed on slug and skipped if present, so re-running
// after a partial failure only fills the holes. src/poster keep their
// /videos/... /posters/... paths — the Blob migration script rewrites them.
//
// Run: set -a; source .env.local; set +a; npx tsx scripts/portfolio-seed.ts

import { db, tables } from '../lib/db';
import { ALL_WORK_VIDEOS } from '../lib/work';

async function main() {
  const existing = await db().select({ slug: tables.portfolioVideos.slug }).from(tables.portfolioVideos);
  const have = new Set(existing.map((r) => r.slug));

  let inserted = 0;
  for (let i = 0; i < ALL_WORK_VIDEOS.length; i++) {
    const v = ALL_WORK_VIDEOS[i];
    if (have.has(v.id)) continue;
    await db().insert(tables.portfolioVideos).values({
      slug: v.id,
      title: v.title,
      category: v.category,
      goal: v.goal,
      format: v.format,
      deliverables: v.deliverables,
      whyItWorked: v.whyItWorked,
      src: v.src,
      poster: v.poster,
      kind: v.kind,
      position: (i + 1) * 1024,
    });
    inserted++;
  }
  console.log(`seeded ${inserted} of ${ALL_WORK_VIDEOS.length} videos (${have.size} already present)`);
}

main().then(() => process.exit(0));
