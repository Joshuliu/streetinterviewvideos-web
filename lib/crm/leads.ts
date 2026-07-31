import type { leadMeetings, leads } from '@/lib/db/schema';
import { dateISO, daysSinceISO, fmtMeeting } from '@/lib/crm/format';

// Lead display status — derived, never stored (same philosophy as order
// status). Converted and archived trump everything; otherwise having a
// meeting (ever — a done call still means "we talked") beats the form
// answers: an "unqualified" lead Neil talked into a call reads as booked,
// with the form answer kept as history.
export type LeadStatus = 'converted' | 'archived' | 'booked' | 'qualified' | 'unqualified' | 'partial';

export type LeadRow = typeof leads.$inferSelect;
export type LeadMeetingRow = typeof leadMeetings.$inferSelect;

/** `hasMeeting`: the lead has at least one non-canceled lead_meetings row. */
export function deriveLeadStatus(
  lead: Pick<LeadRow, 'convertedAccountId' | 'archivedAt' | 'stage' | 'qualified'>,
  hasMeeting: boolean,
): LeadStatus {
  if (lead.convertedAccountId) return 'converted';
  if (lead.archivedAt) return 'archived';
  if (hasMeeting || lead.stage === 'booked') return 'booked';
  if (lead.qualified === false) return 'unqualified';
  if (lead.qualified === true) return 'qualified';
  return 'partial';
}

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; className: string }> = {
  converted: { label: 'Client', className: 'bg-[#0e4a22] text-[#a7f3c0] border-[#1f7a3a]' },
  archived: { label: 'Archived', className: 'bg-[#1a1a1a] text-[#6b6b6b] border-[#2a2a2a]' },
  booked: { label: 'Meeting booked', className: 'bg-[#9a3412]/40 text-[#fdba74] border-[#ea580c]' },
  qualified: { label: 'Qualified', className: 'bg-[#1a1a1a] text-[#ffc72c] border-[#3a3a3a]' },
  unqualified: { label: 'Unqualified', className: 'bg-[#1a1a1a] text-[#9ca3af] border-[#2a2a2a]' },
  partial: { label: 'Partial', className: 'bg-[#1a1a1a] text-[#9ca3af] border-[#2a2a2a]' },
};

// ---------------------------------------------------------------------------
// Heat: how live a lead is, derived from what already happened to it.
//
// The funnel's own marker stops updating the moment a call is booked, so
// "Meeting booked" ends up meaning both "call is tomorrow" and "call was five
// weeks ago and nobody followed up" — which is what made the list unreadable.
// Heat replaces it with the two things that are actually known without anyone
// maintaining a field: is there a call ahead, and how long since the last one
// (or the last note written about them). Nothing is stored; this recomputes on
// every render the same way order status does.
//
// The note side matters as much as the call side: a note is Neil recording
// that something happened, so a lead he wrote up yesterday reads as live even
// if the call itself was a fortnight ago.

export type LeadHeat = 'upcoming' | 'recent' | 'warm' | 'cold' | 'new';

/** Sections render in this order, hottest first. */
export const LEAD_HEAT_ORDER: LeadHeat[] = ['upcoming', 'recent', 'warm', 'cold', 'new'];

export const LEAD_HEAT_META: Record<LeadHeat, { label: string; hint: string; empty: string }> = {
  upcoming: { label: 'Call booked', hint: 'Coming up, soonest first', empty: 'No calls on the books.' },
  recent: { label: 'Just talked', hint: 'Last 7 days, follow these up', empty: 'Nobody spoken to this week.' },
  warm: { label: 'Warm', hint: '1 to 4 weeks since contact', empty: 'Nothing warm right now.' },
  cold: { label: 'Gone quiet', hint: 'Over a month with no contact', empty: 'Nothing has gone quiet.' },
  new: { label: 'Never called', hint: 'Came in, never spoken to', empty: 'Nothing waiting.' },
};

const RECENT_DAYS = 7;
const COLD_DAYS = 30;

export interface LeadHeatResult {
  tier: LeadHeat;
  /** Sort key within the tier, ascending. */
  sort: number;
  /** Plain English for why the lead sits where it does, shown on the row. */
  reason: string;
  /** Non-canceled meetings, so a row can say "3 calls". */
  calls: number;
}

function agoLabel(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

/**
 * `noteDates` are the YYYY-MM-DD dates of this lead's internal notes (any
 * order). `now` is passed in so a page renders one consistent clock across
 * every lead.
 */
export function leadHeat(
  lead: Pick<LeadRow, 'stage' | 'createdAt'>,
  meetings: LeadMeetingRow[],
  noteDates: string[],
  now: Date,
): LeadHeatResult {
  const live = meetings.filter((m) => !m.canceledAt);
  const calls = live.length;
  const nowMs = now.getTime();

  // A booked call with no time is the most urgent row on the page: it can't
  // land on the task board until someone enters the time by hand. Sorts above
  // every real time (which are epoch millis, so always positive).
  if (live.some((m) => !m.startAt) || (calls === 0 && lead.stage === 'booked')) {
    return { tier: 'upcoming', sort: -1, reason: 'Call booked, time not set', calls };
  }

  const next = live
    .filter((m) => m.startAt && m.startAt.getTime() >= nowMs)
    .sort((a, b) => a.startAt!.getTime() - b.startAt!.getTime())[0];
  if (next) {
    return { tier: 'upcoming', sort: next.startAt!.getTime(), reason: `Call ${fmtMeeting(next.startAt)}`, calls };
  }

  // Last touch: the most recent thing that actually happened. Calls become
  // business-timezone days so they compare as strings against note dates.
  const lastCall = live
    .filter((m) => m.startAt)
    .map((m) => dateISO(m.startAt!))
    .sort()
    .pop();
  const lastNote = [...noteDates].sort().pop();
  const last = lastCall && lastNote ? (lastCall >= lastNote ? lastCall : lastNote) : (lastCall ?? lastNote);

  if (!last) {
    const days = Math.floor((nowMs - lead.createdAt.getTime()) / 86_400_000);
    // Negated so ascending sort puts the newest arrival first.
    return { tier: 'new', sort: -lead.createdAt.getTime(), reason: `Came in ${agoLabel(days)}`, calls };
  }

  const days = daysSinceISO(last);
  const tier: LeadHeat = days <= RECENT_DAYS ? 'recent' : days <= COLD_DAYS ? 'warm' : 'cold';
  return {
    tier,
    sort: days,
    reason: `Last ${last === lastCall ? 'call' : 'note'} ${agoLabel(days)}`,
    calls,
  };
}
