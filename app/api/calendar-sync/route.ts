import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { syncCalendars } from '@/lib/crm/calendar';

// Mirror the admins' Google Calendars into the CRM (lib/crm/calendar.ts).
//
// Runs on the Vercel cron declared in vercel.json, which issues a GET. POST is
// the same job by hand for a backfill or a debug run. Auth accepts either the
// cron secret Vercel attaches, or the shared sync key in a header — the second
// is what makes a manual run possible from a terminal.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const summary = await syncCalendars();
    // A calendar that answers with nothing is almost always a share that was
    // never accepted, so say so loudly rather than reporting a clean run.
    if (summary.skippedCalendars.length) {
      console.error('[calendar-sync] no events from', summary.skippedCalendars.join(', '));
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('[calendar-sync]', err);
    return NextResponse.json({ ok: false, error: 'sync_failed' }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
