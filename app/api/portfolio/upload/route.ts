import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';
import { presignR2Put, r2PublicUrl } from '@/lib/r2';

// Presigned-URL exchange for client-side R2 uploads from the team. portfolio
// editor (2026-08-31: was a Vercel Blob token mint — see git history). The
// browser uploads straight to R2 (a portfolio video would blow through the
// serverless 4.5MB body cap in a heartbeat); this route only signs the PUT,
// and only for a logged-in admin.
//
// The 500MB cap and content-type rules are enforced in the form before it
// asks for a URL; a presigned PUT can't hard-enforce size server-side, which
// is acceptable for an admin-only tool.

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set(['video/mp4', 'video/quicktime', 'image/jpeg']);

export async function POST(request: Request): Promise<NextResponse> {
  if (!getAdminSession()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { pathname, contentType } = (await request.json()) as { pathname?: string; contentType?: string };
    if (!pathname || !contentType || !ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }
    // Same shape Blob's addRandomSuffix produced: collisions impossible, and
    // a re-upload of the same filename never overwrites a published object.
    const clean = pathname.replace(/[^a-zA-Z0-9._/-]+/g, '-').replace(/^\/+/, '');
    const suffix = crypto.randomUUID().slice(0, 8);
    const key = clean.replace(/(\.[a-zA-Z0-9]+)?$/, (ext) => `-${suffix}${ext}`);
    const uploadUrl = await presignR2Put(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl: r2PublicUrl(key) });
  } catch (e) {
    console.error('[portfolio/upload]', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 400 });
  }
}
