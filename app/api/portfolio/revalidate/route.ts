import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PORTFOLIO_TAG } from '@/lib/portfolio';

// Flush the 'portfolio' tag cache from outside the app — added 2026-08-31 so
// scripts/portfolio-migrate-r2.ts (and any future storage/URL migration) can
// make rewritten rows live without a hand save in team. Auth mirrors
// /api/calendar-sync: the shared sync key, or the cron secret.

export const dynamic = 'force-dynamic';

function matches(given: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(req: Request): boolean {
  const bearer = (req.headers.get('authorization') ?? '').replace(/^Bearer /, '');
  if (bearer && matches(bearer, process.env.CRON_SECRET)) return true;
  const key = req.headers.get('x-sync-key') ?? '';
  return !!key && matches(key, process.env.CALENDLY_SYNC_SECRET);
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, revalidated: PORTFOLIO_TAG });
}
