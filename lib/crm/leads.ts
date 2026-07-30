import type { leadMeetings, leads } from '@/lib/db/schema';

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

/** The lead's next upcoming meeting, else its most recent one — the single
 *  time to show on a one-line row. Canceled rows don't count. */
export function headlineMeeting(meetings: LeadMeetingRow[]): LeadMeetingRow | null {
  const live = meetings.filter((m) => !m.canceledAt);
  if (live.length === 0) return null;
  const now = Date.now();
  const upcoming = live
    .filter((m) => m.startAt && m.startAt.getTime() >= now)
    .sort((a, b) => a.startAt!.getTime() - b.startAt!.getTime());
  if (upcoming[0]) return upcoming[0];
  const unstamped = live.find((m) => !m.startAt);
  if (unstamped) return unstamped;
  return live.filter((m) => m.startAt).sort((a, b) => b.startAt!.getTime() - a.startAt!.getTime())[0] ?? null;
}

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; className: string }> = {
  converted: { label: 'Client', className: 'bg-[#0e4a22] text-[#a7f3c0] border-[#1f7a3a]' },
  archived: { label: 'Archived', className: 'bg-[#1a1a1a] text-[#6b6b6b] border-[#2a2a2a]' },
  booked: { label: 'Meeting booked', className: 'bg-[#9a3412]/40 text-[#fdba74] border-[#ea580c]' },
  qualified: { label: 'Qualified', className: 'bg-[#1a1a1a] text-[#ffc72c] border-[#3a3a3a]' },
  unqualified: { label: 'Unqualified', className: 'bg-[#1a1a1a] text-[#9ca3af] border-[#2a2a2a]' },
  partial: { label: 'Partial', className: 'bg-[#1a1a1a] text-[#9ca3af] border-[#2a2a2a]' },
};

/**
 * Resolve a booked Calendly event's start time. Returns null (never throws)
 * when the token is missing, the URI is off-domain, or the API call fails —
 * the lead still records the booking; admins can set the time by hand.
 */
export async function fetchCalendlyStartTime(eventUri: string): Promise<Date | null> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) return null;
  // Only ever call Calendly's own API host, whatever the client-supplied URI says.
  if (!/^https:\/\/api\.calendly\.com\/scheduled_events\/[A-Za-z0-9-]+$/.test(eventUri)) return null;
  try {
    const res = await fetch(eventUri, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error('[lead] calendly lookup failed', res.status);
      return null;
    }
    const data = (await res.json()) as { resource?: { start_time?: string } };
    const start = data.resource?.start_time;
    if (!start) return null;
    const date = new Date(start);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch (err) {
    console.error('[lead] calendly lookup error', err);
    return null;
  }
}
