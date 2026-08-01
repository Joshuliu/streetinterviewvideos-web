import { NextResponse } from 'next/server';

// RETIRED 2026-07-31. This used to poll the Calendly API and write a
// lead_meetings row per booking. Google Calendar is the CRM's only source of
// meetings now (/api/calendar-sync), and every Calendly booking reaches an
// admin's calendar via the auto-guests Apps Script, so polling Calendly as
// well recorded every call twice.
//
// The endpoint is kept as a no-op ON PURPOSE: scripts/calendly-auto-guests.gs
// still pings it every five minutes from a trigger inside the studio@ Google
// account, and the copy in this repo is a mirror, not the live one. Deleting
// the route would fill that script's execution log with failures until someone
// edits the live project. Once the ping is removed there (the CRM_SYNC_KEY
// property and the sync call), this file can go too.

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json({ ok: true, retired: 'replaced by /api/calendar-sync' });
}

export const GET = POST;
