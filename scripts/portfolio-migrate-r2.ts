// One-time move of the portfolio media from Vercel Blob to Cloudflare R2
// (2026-08-31, so the stack runs without a paid Vercel plan). Two phases,
// both idempotent — a re-run after a partial failure picks up where it
// left off:
//
//  1. Upload: every file in the local Blob mirror (~/siv-blob-mirror,
//     written by the migration session; falls back to MIRROR_DIR env) is
//     uploaded to R2 under its identical `portfolio/...` key. Files whose
//     key already exists in R2 are skipped.
//  2. Rewrite: every portfolio_videos row whose src/poster still points at
//     *.blob.vercel-storage.com is rewritten to R2_PUBLIC_BASE_URL/<key>,
//     but ONLY after a HEAD confirms the object exists in R2.
//
// AFTER a run, the marketing pages still serve the old URLs from the
// 'portfolio' tag cache: hit /api/portfolio/revalidate/ (x-sync-key:
// CALENDLY_SYNC_SECRET) or save any video in team. to flush it. The Blob
// store itself is deleted manually later, once the site is spot-checked —
// not before, or rollback means re-uploading.
//
// Run: set -a; source .env.local; set +a; npx tsx scripts/portfolio-migrate-r2.ts

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { eq } from 'drizzle-orm';
import { db, tables } from '../lib/db';
import { r2ObjectExists, r2PublicUrl } from '../lib/r2';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const pv = tables.portfolioVideos;
const MIRROR = process.env.MIRROR_DIR ?? path.join(os.homedir(), 'siv-blob-mirror');
const BLOB_HOST = /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
});

function contentTypeFor(file: string): string {
  if (/\.mp4$/i.test(file)) return 'video/mp4';
  if (/\.mov$/i.test(file)) return 'video/quicktime';
  if (/\.jpe?g$/i.test(file)) return 'image/jpeg';
  return 'application/octet-stream';
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function uploadPhase(): Promise<void> {
  let uploaded = 0, skipped = 0;
  for await (const file of walk(MIRROR)) {
    const key = path.relative(MIRROR, file).split(path.sep).join('/');
    if (key === 'manifest.json') continue;
    if (await r2ObjectExists(key)) { skipped++; continue; }
    const body = await readFile(file);
    await s3.send(new PutObjectCommand({
      Bucket: required('R2_BUCKET'),
      Key: key,
      Body: body,
      ContentType: contentTypeFor(key),
    }));
    uploaded++;
    const size = (await stat(file)).size;
    console.log(`uploaded ${key} (${(size / 1e6).toFixed(1)}MB)`);
  }
  console.log(`upload phase: ${uploaded} uploaded, ${skipped} already present`);
}

function blobUrlToKey(u: string): string | null {
  if (!BLOB_HOST.test(u)) return null;
  return new URL(u).pathname.replace(/^\/+/, '');
}

async function rewritePhase(): Promise<void> {
  const rows = await db().select().from(pv);
  let rewritten = 0, untouched = 0, missing = 0;
  for (const row of rows) {
    const updates: Partial<{ src: string; poster: string }> = {};
    for (const field of ['src', 'poster'] as const) {
      const key = blobUrlToKey(row[field]);
      if (!key) continue;
      if (!(await r2ObjectExists(key))) {
        console.error(`MISSING in R2, row "${row.slug}" ${field}: ${key}`);
        missing++;
        continue;
      }
      updates[field] = r2PublicUrl(key);
    }
    if (Object.keys(updates).length === 0) { untouched++; continue; }
    await db().update(pv).set({ ...updates, updatedAt: new Date() }).where(eq(pv.id, row.id));
    rewritten++;
    console.log(`rewrote "${row.slug}": ${Object.keys(updates).join(', ')}`);
  }
  console.log(`rewrite phase: ${rewritten} rows rewritten, ${untouched} untouched, ${missing} MISSING`);
  if (missing > 0) process.exitCode = 1;
}

(async () => {
  await uploadPhase();
  await rewritePhase();
})();
