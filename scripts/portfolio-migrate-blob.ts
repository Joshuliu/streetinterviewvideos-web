// One-time move of the pre-CRM portfolio files out of the git repo:
// every portfolio_videos row whose src/poster still points at /videos/... or
// /posters/... gets its files uploaded to Vercel Blob and the row rewritten
// to the Blob URLs. Idempotent: already-migrated rows (https URLs) are
// skipped, so a re-run after a partial failure picks up where it left off.
//
// Needs BLOB_READ_WRITE_TOKEN (created when the Blob store is added to the
// Vercel project). AFTER a deploy with the rewritten rows is live and
// spot-checked, the files in public/videos + public/posters can be deleted
// from the repo — not before, or the deployed site 404s its own portfolio.
//
// Run: set -a; source .env.local; set +a; npx tsx scripts/portfolio-migrate-blob.ts

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { db, tables } from '../lib/db';

const pv = tables.portfolioVideos;

async function uploadLocal(publicPath: string, contentType: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', publicPath);
  const data = await readFile(filePath);
  const blob = await put(`portfolio${publicPath}`, data, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set. Create the Blob store in Vercel and pull the env first.');
    process.exit(1);
  }
  const rows = await db().select().from(pv);
  let moved = 0;
  for (const row of rows) {
    const needsSrc = row.src.startsWith('/');
    const needsPoster = row.poster.startsWith('/');
    if (!needsSrc && !needsPoster) continue;
    process.stdout.write(`${row.slug} ... `);
    const src = needsSrc ? await uploadLocal(row.src, 'video/mp4') : row.src;
    const poster = needsPoster ? await uploadLocal(row.poster, 'image/jpeg') : row.poster;
    await db().update(pv).set({ src, poster, updatedAt: new Date() }).where(eq(pv.id, row.id));
    moved++;
    console.log('done');
  }
  console.log(`${moved} rows migrated, ${rows.length - moved} already on Blob or skipped.`);
}

main().then(() => process.exit(0));
