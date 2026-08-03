import type { calendarEvents, leads } from '@/lib/db/schema';
import { dateISO, daysSinceISO, fmtMeeting } from '@/lib/crm/format';

// Lead display status — derived, never stored (same philosophy as order
// status). Converted and archived trump everything; otherwise having a
// meeting (ever — a done call still means "we talked") beats the form
// answers: an "unqualified" lead Neil talked into a call reads as booked,
// with the form answer kept as history.
//
// A call ahead and a call behind are different states and must not share a
// chip: when every past call also read "Meeting booked", the rows with a call
// actually coming up were invisible in the pile. `booked` means there is one
// on the books; `met` means we've spoken and nothing is scheduled.
export type LeadStatus =
  | 'converted'
  | 'archived'
  | 'booked'
  | 'met'
  | 'qualified'
  | 'unqualified'
  | 'partial';

export type LeadRow = typeof leads.$inferSelect;
/** A call, mirrored from an admin's Google Calendar. */
export type LeadMeetingRow = typeof calendarEvents.$inferSelect;

/**
 * `calls` is every calendar event for the lead, canceled ones included (they
 * are filtered here). `now` is passed in so a page renders one clock.
 */
export function deriveLeadStatus(
  lead: Pick<LeadRow, 'convertedAccountId' | 'archivedAt' | 'stage' | 'qualified'>,
  calls: Pick<LeadMeetingRow, 'status' | 'startAt'>[],
  now: Date,
): LeadStatus {
  if (lead.convertedAccountId) return 'converted';
  if (lead.archivedAt) return 'archived';
  const live = calls.filter((c) => c.status !== 'cancelled');
  // A call with no time is one nobody has scheduled properly yet, not one that
  // has been and gone — it stays "booked" so it keeps asking to be dealt with.
  if (live.some((c) => !c.startAt || c.startAt.getTime() >= now.getTime())) return 'booked';
  if (live.length > 0) return 'met';
  if (lead.stage === 'booked') return 'booked';
  if (lead.qualified === false) return 'unqualified';
  if (lead.qualified === true) return 'qualified';
  return 'partial';
}

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; className: string }> = {
  converted: {
    label: 'Client',
    className: 'bg-[var(--crm-chip-green-bg)] text-[var(--crm-chip-green-text)] border-[var(--crm-chip-green-line)]',
  },
  archived: { label: 'Archived', className: 'bg-[var(--crm-soft)] text-[var(--crm-faint)] border-[var(--crm-line)]' },
  booked: {
    label: 'Meeting booked',
    className:
      'bg-[var(--crm-chip-orange-bg)] text-[var(--crm-chip-orange-text)] border-[var(--crm-chip-orange-line)]',
  },
  met: { label: 'Spoken to', className: 'bg-[var(--crm-soft)] text-[var(--crm-muted)] border-[var(--crm-line-2)]' },
  qualified: { label: 'Qualified', className: 'bg-[var(--crm-soft)] text-[var(--crm-warn-soft)] border-[var(--crm-line-2)]' },
  unqualified: { label: 'Unqualified', className: 'bg-[var(--crm-soft)] text-[var(--crm-muted)] border-[var(--crm-line)]' },
  partial: { label: 'Partial', className: 'bg-[var(--crm-soft)] text-[var(--crm-muted)] border-[var(--crm-line)]' },
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

// `order` is the ordering half of the hint. It's shown only while the list is
// on its default sort — leaving "soonest first" on screen under a name sort
// would be a lie, and a hint you can't trust is worse than none.
export const LEAD_HEAT_META: Record<LeadHeat, { label: string; hint: string; order?: string; empty: string }> = {
  upcoming: { label: 'Call booked', hint: 'Coming up', order: 'soonest first', empty: 'No calls on the books.' },
  recent: { label: 'Just talked', hint: 'Last 7 days, follow these up', empty: 'Nobody spoken to this week.' },
  warm: { label: 'Warm', hint: '1 to 4 weeks since contact', empty: 'Nothing warm right now.' },
  cold: { label: 'Gone quiet', hint: 'Over a month with no contact', empty: 'Nothing has gone quiet.' },
  new: { label: 'Never called', hint: 'Came in, never spoken to', empty: 'Nothing waiting.' },
};

const RECENT_DAYS = 7;
const COLD_DAYS = 30;

// ---------------------------------------------------------------------------
// Sorting. Heat is the default and the reason the sections exist; the other
// orders are for the times you're working the list a different way (calling
// down the biggest budgets, or checking what came in overnight). Sorting only
// ever reorders rows WITHIN a section — the grouping is the page.

export type LeadSort = 'heat' | 'newest' | 'spend' | 'name';

// "Warmest" rather than "Heat": heat is our word for the model, and a control
// nobody but us can read is a control nobody uses. Warm and cold leads are
// plain sales English.
export const LEAD_SORTS: { key: LeadSort; label: string }[] = [
  { key: 'heat', label: 'Warmest' },
  { key: 'newest', label: 'Newest' },
  { key: 'spend', label: 'Ad spend' },
  { key: 'name', label: 'Name' },
];

/** The funnel's ad-spend tiers, lowest first (components/LeadFunnel.tsx). */
const ADSPEND_TIERS = ['Under $5k', '$5k–25k', '$25k–100k', '$100k–500k', '$500k–1M', '$1M+'];

/** Tier index + 1, so an unanswered or unrecognised value sorts last at 0. */
export function adspendRank(adspend: string | null | undefined): number {
  const i = adspend ? ADSPEND_TIERS.indexOf(adspend) : -1;
  return i + 1;
}

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
  const live = meetings.filter((m) => m.status !== 'cancelled');
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
