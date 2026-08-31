'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { deleteR2Urls } from '@/lib/r2';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { PORTFOLIO_TAG } from '@/lib/portfolio';

// Server actions for the team. portfolio editor. Every mutation re-checks the
// admin session, then revalidates BOTH surfaces: the 'portfolio' tag (which
// regenerates the marketing homepage, /portfolio, per-video pages, service
// pages and sitemap on their next request — that's how a save goes live with
// no deploy) and the /team layout (so the editor itself re-renders).

function requireAdmin() {
  const session = getAdminSession();
  if (!session) throw new Error('unauthorized');
  return session;
}

function refresh() {
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath('/team', 'layout');
}

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateResult = { ok: true; id: string } | { ok: false; error: string };

const str = (fd: FormData, key: string) => (fd.get(key) ?? '').toString().trim();

const pv = tables.portfolioVideos;

// An R2 URL is ours to clean up (media moved to Cloudflare R2 2026-08-31).
// Anything else — a legacy /videos/... repo path, or a leftover Vercel Blob
// URL from before the migration — is left alone.
async function deleteBlobs(urls: string[]) {
  // Best-effort: a row must never survive because storage cleanup hiccuped.
  try {
    await deleteR2Urls(urls);
  } catch (e) {
    console.error('[portfolio] R2 cleanup failed', e);
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'video';
  const existing = new Set(
    (await db().select({ slug: pv.slug }).from(pv)).map((r) => r.slug),
  );
  if (!existing.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!existing.has(candidate)) return candidate;
  }
}

type Fields = {
  title: string;
  category: string;
  goal: string;
  format: string;
  deliverables: string;
  whyItWorked: string;
  kind: 'scripted' | 'unscripted';
};

function readFields(fd: FormData): Fields | { error: string } {
  const title = str(fd, 'title').slice(0, 200);
  if (!title) return { error: 'A title is required' };
  const kind = str(fd, 'kind');
  if (kind !== 'scripted' && kind !== 'unscripted') return { error: 'Pick scripted or unscripted' };
  return {
    title,
    category: str(fd, 'category').slice(0, 120),
    goal: str(fd, 'goal').slice(0, 1000),
    format: str(fd, 'format').slice(0, 300),
    deliverables: str(fd, 'deliverables').slice(0, 300),
    whyItWorked: str(fd, 'whyItWorked').slice(0, 2000),
    kind,
  };
}

// New videos land at the BOTTOM of the order: appearing on the homepage
// top-6 or in the featured pair is a deliberate drag, not a side effect of
// uploading.
export async function createVideo(fd: FormData): Promise<CreateResult> {
  requireAdmin();
  const fields = readFields(fd);
  if ('error' in fields) return { ok: false, error: fields.error };
  const src = str(fd, 'src');
  const poster = str(fd, 'poster');
  if (!src || !poster) return { ok: false, error: 'Upload the video and pick a poster frame first' };

  const rows = await db().select({ position: pv.position }).from(pv);
  const maxPos = rows.reduce((m, r) => Math.max(m, r.position), 0);
  const slug = await uniqueSlug(fields.title);
  const [row] = await db()
    .insert(pv)
    .values({ ...fields, slug, src, poster, position: maxPos + 1024 })
    .returning({ id: pv.id });
  refresh();
  return { ok: true, id: row.id };
}

export async function updateVideo(fd: FormData): Promise<ActionResult> {
  requireAdmin();
  const id = str(fd, 'id');
  if (!id) return { ok: false, error: 'Missing id' };
  const fields = readFields(fd);
  if ('error' in fields) return { ok: false, error: fields.error };

  const [current] = await db().select().from(pv).where(eq(pv.id, id));
  if (!current) return { ok: false, error: 'Video not found' };

  // Media replacement is optional on edit: blank means keep what's there.
  // A replaced Blob file is deleted so storage doesn't accrete orphans.
  const src = str(fd, 'src') || current.src;
  const poster = str(fd, 'poster') || current.poster;
  const orphans: string[] = [];
  if (src !== current.src) orphans.push(current.src);
  if (poster !== current.poster) orphans.push(current.poster);

  await db()
    .update(pv)
    .set({ ...fields, src, poster, updatedAt: new Date() })
    .where(eq(pv.id, id));
  await deleteBlobs(orphans);
  refresh();
  return { ok: true };
}

export async function setVideoPublished(id: string, published: boolean): Promise<ActionResult> {
  requireAdmin();
  await db().update(pv).set({ published, updatedAt: new Date() }).where(eq(pv.id, id));
  refresh();
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  requireAdmin();
  const [row] = await db().select({ src: pv.src, poster: pv.poster }).from(pv).where(eq(pv.id, id));
  if (!row) return { ok: false, error: 'Video not found' };
  await db().delete(pv).where(eq(pv.id, id));
  await deleteBlobs([row.src, row.poster]);
  refresh();
  return { ok: true };
}

// Drag-drop reorder: the same fractional-midpoint model as the task board.
// beforeId/afterId are the rows either side of the drop slot (null at the
// edges); the moved row takes the midpoint.
export async function moveVideo(
  id: string,
  beforeId: string | null,
  afterId: string | null,
): Promise<ActionResult> {
  requireAdmin();
  const rows = await db()
    .select({ id: pv.id, position: pv.position })
    .from(pv)
    .orderBy(asc(pv.position));
  const before = beforeId ? rows.find((r) => r.id === beforeId) : undefined;
  const after = afterId ? rows.find((r) => r.id === afterId) : undefined;
  if (beforeId && !before) return { ok: false, error: 'Reorder went stale. Refresh and try again' };
  if (afterId && !after) return { ok: false, error: 'Reorder went stale. Refresh and try again' };

  let position: number;
  if (before && after) position = (before.position + after.position) / 2;
  else if (after) position = after.position - 1024;
  else if (before) position = before.position + 1024;
  else return { ok: false, error: 'Nothing to reorder against' };

  await db().update(pv).set({ position, updatedAt: new Date() }).where(eq(pv.id, id));
  refresh();
  return { ok: true };
}
