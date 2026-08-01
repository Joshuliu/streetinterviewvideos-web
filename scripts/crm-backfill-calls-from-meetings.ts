import { and, eq, isNotNull } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { meetingPosition } from '@/lib/crm/board';

// One-off: carry every lead_meetings row into calendar_events, so the CRM can
// read calls from ONE table.
//
// Why this is needed at all: calendar_events only reaches back to 2026-07-28,
// because that is when the auto-guests Apps Script started putting Calendly
// bookings on Neil's calendar, and the sync only reads a ±30 day window.
// lead_meetings goes back to 2026-06-02 and holds 25 hand-made rows that are
// the ONLY record of the calls booked through the old brandlaunch Calendly
// account (see CLAUDE.md). Repointing the readers without this step would
// silently erase two months of history from the leads list and wreck the heat
// ordering.
//
// Carried rows get a synthetic `ical_uid` in the `siv-legacy:` namespace.
// Google will never emit one of those, so the calendar sync can neither
// overwrite nor duplicate them — it only ever touches UIDs it saw on a
// calendar. They also carry `linked_manually`, so the match stays put.
//
// Safe to re-run: it skips anything already carried, and skips any meeting
// that the calendar sync already covers on its own.

/** A lead_meeting and a calendar_event this close together are the same call. */
const SAME_CALL_MS = 5 * 60 * 1000;

const LEGACY_PREFIX = 'siv-legacy:';

async function main() {
  const apply = process.argv.includes('--apply');
  const d = db();

  const [meetings, events, leads] = await Promise.all([
    d.select().from(tables.leadMeetings),
    d.select().from(tables.calendarEvents),
    d.select({ id: tables.leads.id, name: tables.leads.name, email: tables.leads.email, accountId: tables.leads.convertedAccountId }).from(tables.leads),
  ]);
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const already = new Set(events.map((e) => e.icalUid));

  // Real calendar rows for the same lead at the same time: the sync already
  // has this call, so carrying it over would show it twice on the lead page.
  const synced = events
    .filter((e) => e.leadId && e.startAt && !e.icalUid.startsWith(LEGACY_PREFIX))
    .map((e) => ({ leadId: e.leadId!, t: e.startAt!.getTime() }));

  let carried = 0;
  let skippedSynced = 0;
  let skippedAlready = 0;

  for (const m of meetings) {
    const uid = `${LEGACY_PREFIX}${m.id}`;
    if (already.has(uid)) {
      skippedAlready++;
      continue;
    }
    if (m.startAt && synced.some((s) => s.leadId === m.leadId && Math.abs(s.t - m.startAt!.getTime()) < SAME_CALL_MS)) {
      skippedSynced++;
      continue;
    }
    const lead = leadById.get(m.leadId);
    const who = lead?.name || lead?.email || 'a lead';
    const values = {
      icalUid: uid,
      // Neil takes the sales calls; that is the board these have always been
      // on, and there is nothing in lead_meetings recording an owner.
      owners: ['neil'],
      summary: `${who} and Street Interview Videos`,
      startAt: m.startAt,
      endAt: null,
      allDay: false,
      status: m.canceledAt ? 'cancelled' : 'confirmed',
      // The lead's own address, so outsideAttendees() reads the same as it
      // does for a synced row.
      attendees: lead?.email ? [lead.email.toLowerCase()] : [],
      htmlLink: null,
      meetingUrl: null,
      leadId: m.leadId,
      accountId: lead?.accountId ?? null,
      linkedManually: true,
      ...(m.startAt ? { position: meetingPosition(m.startAt) } : {}),
    };
    if (apply) await d.insert(tables.calendarEvents).values(values);
    carried++;
  }

  console.log(
    `${apply ? 'carried' : 'WOULD carry'} ${carried} of ${meetings.length} lead_meetings\n` +
      `  skipped ${skippedSynced} already covered by the calendar sync\n` +
      `  skipped ${skippedAlready} carried by an earlier run`,
  );
  if (!apply) console.log('\nDry run. Re-run with --apply to write.');
  process.exit(0);
}

main();
