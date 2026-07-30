import { fmtMeeting } from '@/lib/crm/format';
import type { LeadMeetingRow } from '@/lib/crm/leads';

// Shaping meeting rows for display. Shared by the lead page and the client
// page, which show the same list of calls: before conversion you read it on
// the lead, after conversion on the client.

/** A call, ready to render. */
export interface MeetingView {
  id: string;
  /** "Wed, Jul 30 · 10:30 AM", or null when the time never synced. */
  label: string | null;
  /** datetime-local string for the editor, business timezone. */
  initialLocal: string;
  canceled: boolean;
  done: boolean;
  /** Hand-entered (no Calendly event behind it): editable and removable. */
  manual: boolean;
}

/** A call counts as done an hour past its start. */
const DONE_AFTER_MS = 60 * 60 * 1000;

/** datetime-local default in the business timezone (both admins are PT). */
function localValue(d: Date | null): string {
  if (!d) return '';
  // sv-SE formats as "YYYY-MM-DD HH:MM:SS" — exactly datetime-local's shape.
  return d.toLocaleString('sv-SE', { timeZone: 'America/Los_Angeles' }).slice(0, 16).replace(' ', 'T');
}

/** Upcoming soonest-first, then time-unknown, then past newest-first, canceled
 *  at the bottom. */
function byRelevance(a: LeadMeetingRow, b: LeadMeetingRow): number {
  const now = Date.now();
  const rank = (m: LeadMeetingRow) => (m.canceledAt ? 3 : !m.startAt ? 1 : m.startAt.getTime() >= now ? 0 : 2);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  const ta = a.startAt?.getTime() ?? 0;
  const tb = b.startAt?.getTime() ?? 0;
  return ra === 0 ? ta - tb : tb - ta;
}

export function toMeetingViews(rows: LeadMeetingRow[]): MeetingView[] {
  const now = Date.now();
  return [...rows].sort(byRelevance).map((m) => ({
    id: m.id,
    label: m.startAt ? fmtMeeting(m.startAt) : null,
    initialLocal: localValue(m.startAt),
    canceled: !!m.canceledAt,
    done: !!m.startAt && !m.canceledAt && now > m.startAt.getTime() + DONE_AFTER_MS,
    manual: !m.calendlyEventUri,
  }));
}
