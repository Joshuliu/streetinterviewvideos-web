import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { syncCalendlyMeetings } from '@/lib/crm/calendly';

// Pull every Calendly booking into the CRM (lib/crm/calendly.ts). Pinged
// every 5 minutes by the auto-guests Apps Script (scripts/
// calendly-auto-guests.gs) — the free stand-in for Calendly webhooks — and
// callable by hand with the same key for a manual backfill.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function keyOk(req: Request): boolean {
  const secret = process.env.CALENDLY_SYNC_SECRET;
  if (!secret) return false;
  const given = req.headers.get('x-sync-key') ?? new URL(req.url).searchParams.get('key') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!keyOk(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const summary = await syncCalendlyMeetings();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('[calendly-sync]', err);
    return NextResponse.json({ ok: false, error: 'sync_failed' }, { status: 500 });
  }
}
