import { eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { adminEmails, emailToOwner, normalizeEmail, type Owner } from '@/lib/auth/config';
import { meetingPosition } from '@/lib/crm/board';
import { googleAccessToken, readCalendar, type GCalEvent } from '@/lib/crm/gcal';

// Google Calendar -> CRM. Google is the primary driver of what shows on the
// task board: whoever books (the funnel's Calendly embed, Neil texting a link,
// a client emailing to arrange a call), the meeting ends up on an admin's
// calendar, and this pulls it in. Nothing is ever written back to Google.
//
// The funnel still creates the LEAD on its own (app/api/lead), independently of
// whether a call gets booked, so by the time an event arrives here the person
// is usually already in the CRM and matching just has to find them.

/** How far either side of now to keep mirrored. */
const WINDOW_DAYS = 30;

// Addresses that are US, so they never count as "the person we're meeting".
// The domain covers the admins and studio@ (a guest on every Calendly
// booking); the extras are personal addresses that show up as guests on real
// internal events and would otherwise read as outside prospects.
const INTERNAL_DOMAINS = ['streetinterviewvideos.com'];
const INTERNAL_EXTRA = ['joshuliu@gmail.com'];

export function isInternalAddress(email: string): boolean {
  const e = normalizeEmail(email);
  return INTERNAL_DOMAINS.some((d) => e.endsWith(`@${d}`)) || INTERNAL_EXTRA.includes(e);
}

/**
 * Whose calendars to read. Defaults to the admin allowlist narrowed to the
 * company domain, because ADMIN_EMAILS also carries a personal Gmail that is
 * (rightly) not shared with the service account and answered 404 on the first
 * run. `GCAL_CALENDARS` overrides it if the two ever need to diverge.
 */
export function calendarIds(): string[] {
  const explicit = (process.env.GCAL_CALENDARS ?? '')
    .split(',')
    .map((s) => normalizeEmail(s))
    .filter(Boolean);
  if (explicit.length) return explicit;
  return adminEmails().filter((e) => INTERNAL_DOMAINS.some((d) => e.endsWith(`@${d}`)));
}

/**
 * Calendly does not delete a canceled booking, it RENAMES the event to
 * "Canceled: <original title>" and leaves the status confirmed. Going by
 * Google's status alone left canceled calls sitting on the board looking live
 * — the Jul 31 Sohail call was the one that showed it.
 */
export function isCanceledEvent(ev: { status: string; summary: string }): boolean {
  return ev.status === 'cancelled' || /^cancell?ed:/i.test(ev.summary.trim());
}

/** The attendees who aren't us, in the order Google returned them. */
export function outsideAttendees(attendees: string[]): string[] {
  return attendees.filter((a) => !isInternalAddress(a));
}

export interface CalendarSyncSummary {
  calendars: number;
  eventsSeen: number;
  meetings: number;
  created: number;
  updated: number;
  matched: number;
  unmatched: number;
  skippedCalendars: string[];
}

interface Merged extends GCalEvent {
  owners: Owner[];
}

/**
 * Fetch every admin calendar and collapse the results to one entry per
 * MEETING. The same call on two calendars arrives twice with an identical
 * `iCalUID` and differing `id`s, so keying on the UID is what stops a joint
 * call becoming two board rows.
 */
async function collectEvents(timeMin: Date, timeMax: Date, skipped: string[]): Promise<Merged[]> {
  const token = await googleAccessToken();
  const byUid = new Map<string, Merged>();

  for (const email of calendarIds()) {
    const owner = emailToOwner(email);
    const events = await readCalendar(email, timeMin, timeMax, token);
    if (events.length === 0) skipped.push(email);
    for (const ev of events) {
      const existing = byUid.get(ev.iCalUID);
      if (existing) {
        if (!existing.owners.includes(owner)) existing.owners.push(owner);
        // Keep whichever copy actually has a time; attendee lists can be
        // trimmed on a guest's copy, so prefer the longer one.
        if (!existing.startAt && ev.startAt) existing.startAt = ev.startAt;
        if (ev.attendees.length > existing.attendees.length) existing.attendees = ev.attendees;
      } else {
        byUid.set(ev.iCalUID, { ...ev, owners: [owner] });
      }
    }
  }
  return [...byUid.values()];
}

/** Look up every outside address in one pass: leads first, then client logins. */
async function buildMatchers(events: Merged[]) {
  const emails = [...new Set(events.flatMap((e) => outsideAttendees(e.attendees)))];
  if (emails.length === 0) {
    return { leadByEmail: new Map<string, { id: string; accountId: string | null }>(), accountByEmail: new Map<string, string>() };
  }
  const d = db();
  const [leadRows, loginRows] = await Promise.all([
    d
      .select({ id: tables.leads.id, email: tables.leads.email, accountId: tables.leads.convertedAccountId })
      .from(tables.leads)
      .where(inArray(tables.leads.email, emails)),
    d
      .select({ email: tables.loginEmails.email, accountId: tables.loginEmails.accountId })
      .from(tables.loginEmails)
      .where(inArray(tables.loginEmails.email, emails)),
  ]);

  const leadByEmail = new Map<string, { id: string; accountId: string | null }>();
  // Newest lead wins when one person filled the funnel more than once; the
  // query returns them unordered, so take the first and don't fight over it.
  for (const l of leadRows) {
    if (!leadByEmail.has(normalizeEmail(l.email))) {
      leadByEmail.set(normalizeEmail(l.email), { id: l.id, accountId: l.accountId });
    }
  }
  const accountByEmail = new Map<string, string>();
  for (const l of loginRows) accountByEmail.set(normalizeEmail(l.email), l.accountId);
  return { leadByEmail, accountByEmail };
}

/**
 * Who this meeting is with. Walks the outside attendees in order and takes the
 * first that resolves — to a lead (the usual case, since the funnel creates
 * the lead before the call), else to a client's studio login. No match is a
 * perfectly ordinary outcome: Neil booked someone new, or it's a vendor
 * selling to us. Those rows show on the board with no link, to be attached by
 * hand or ignored.
 */
function matchEvent(
  event: Merged,
  leadByEmail: Map<string, { id: string; accountId: string | null }>,
  accountByEmail: Map<string, string>,
): { leadId: string | null; accountId: string | null } {
  for (const email of outsideAttendees(event.attendees)) {
    const lead = leadByEmail.get(email);
    if (lead) return { leadId: lead.id, accountId: lead.accountId };
    const accountId = accountByEmail.get(email);
    if (accountId) return { leadId: null, accountId };
  }
  return { leadId: null, accountId: null };
}

export async function syncCalendars(): Promise<CalendarSyncSummary> {
  const now = Date.now();
  const timeMin = new Date(now - WINDOW_DAYS * 864e5);
  const timeMax = new Date(now + WINDOW_DAYS * 864e5);
  const skippedCalendars: string[] = [];

  const events = await collectEvents(timeMin, timeMax, skippedCalendars);
  const summary: CalendarSyncSummary = {
    calendars: calendarIds().length,
    eventsSeen: events.length,
    meetings: events.length,
    created: 0,
    updated: 0,
    matched: 0,
    unmatched: 0,
    skippedCalendars,
  };
  if (events.length === 0) return summary;

  const d = db();
  const { leadByEmail, accountByEmail } = await buildMatchers(events);
  const uids = events.map((e) => e.iCalUID);
  const existingRows = await d
    .select({
      icalUid: tables.calendarEvents.icalUid,
      startAt: tables.calendarEvents.startAt,
      position: tables.calendarEvents.position,
      linkedManually: tables.calendarEvents.linkedManually,
      leadId: tables.calendarEvents.leadId,
      accountId: tables.calendarEvents.accountId,
    })
    .from(tables.calendarEvents)
    .where(inArray(tables.calendarEvents.icalUid, uids));
  const existing = new Map(existingRows.map((r) => [r.icalUid, r]));

  for (const ev of events) {
    const prev = existing.get(ev.iCalUID);
    // A hand-made link is a human's answer and outranks our guess forever.
    const match = prev?.linkedManually
      ? { leadId: prev.leadId, accountId: prev.accountId }
      : matchEvent(ev, leadByEmail, accountByEmail);
    if (match.leadId || match.accountId) summary.matched++;
    else summary.unmatched++;

    // Re-slot on the board only when the TIME moved, so a row someone dragged
    // keeps its place through every unrelated edit.
    const timeMoved = (prev?.startAt?.getTime() ?? null) !== (ev.startAt?.getTime() ?? null);
    const position =
      prev && !timeMoved
        ? prev.position
        : ev.startAt
          ? meetingPosition(ev.startAt)
          : undefined;

    const values = {
      icalUid: ev.iCalUID,
      owners: ev.owners,
      summary: ev.summary,
      startAt: ev.startAt,
      endAt: ev.endAt,
      allDay: ev.allDay,
      status: isCanceledEvent(ev) ? 'cancelled' : ev.status,
      attendees: ev.attendees,
      htmlLink: ev.htmlLink,
      meetingUrl: ev.meetingUrl,
      leadId: match.leadId,
      accountId: match.accountId,
      updatedAt: new Date(),
      ...(position === undefined ? {} : { position }),
    };

    if (prev) {
      await d.update(tables.calendarEvents).set(values).where(eq(tables.calendarEvents.icalUid, ev.iCalUID));
      summary.updated++;
    } else {
      await d.insert(tables.calendarEvents).values(values);
      summary.created++;
    }
  }

  return summary;
}
