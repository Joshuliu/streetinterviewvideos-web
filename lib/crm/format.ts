// Date helpers for the CRM views. Dates are YYYY-MM-DD strings (Postgres
// date columns via drizzle string mode). "Today" is always computed in the
// business timezone (America/Los_Angeles): the server runs in UTC, and a
// naive toISOString() would flip to tomorrow every evening PT.

const BUSINESS_TZ = 'America/Los_Angeles';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Today's date in the business timezone, as YYYY-MM-DD. */
export function todayISO(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Date().toLocaleDateString('en-CA', { timeZone: BUSINESS_TZ });
}

/** Add days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const currentYear = Number(todayISO().slice(0, 4));
  return `${MONTHS[m - 1]} ${d}${y !== currentYear ? ` ${y}` : ''}`;
}

/** "Today" / "Tomorrow" / "Yesterday" / weekday name, for task-list day headers. */
export function dayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  if (iso === addDaysISO(today, -1)) return 'Yesterday';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

/**
 * The instant a business-timezone day begins, for comparing timestamp columns
 * against a YYYY-MM-DD day. `new Date(iso)` would give midnight UTC, which is
 * 5pm the previous day in PT.
 */
export function dayStart(iso: string): Date {
  const utcMidnight = new Date(`${iso}T00:00:00Z`);
  // Standard offset trick: how far the business-tz wall clock sits from UTC at
  // that instant. Midnight never lands inside a DST gap (transitions are 2am).
  const inTz = new Date(utcMidnight.toLocaleString('en-US', { timeZone: BUSINESS_TZ }));
  const inUtc = new Date(utcMidnight.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(utcMidnight.getTime() + (inUtc.getTime() - inTz.getTime()));
}

export function isOverdue(iso: string | null | undefined): boolean {
  return !!iso && iso < todayISO();
}

/**
 * Whole days from a YYYY-MM-DD day to today, in the business timezone.
 * Negative for a future date. Both ends are anchored at noon UTC so a DST
 * transition can't round a 24-hour gap to 0 or 2.
 */
export function daysSinceISO(iso: string): number {
  const then = Date.parse(`${iso}T12:00:00Z`);
  const now = Date.parse(`${todayISO()}T12:00:00Z`);
  return Math.round((now - then) / 86_400_000);
}

/** The business-timezone calendar date of a timestamp, as YYYY-MM-DD. */
export function dateISO(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: BUSINESS_TZ });
}

/** Clock time in the business timezone: "2:00 PM". */
export function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: BUSINESS_TZ });
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return '';
  return fmtDate(dateISO(d));
}

/** Meeting timestamp in the business timezone: "Wed, Jul 30 · 2:00 PM". */
export function fmtMeeting(d: Date | null | undefined): string {
  if (!d) return '';
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: BUSINESS_TZ });
  return `${weekday}, ${fmtDate(dateISO(d))} · ${fmtTime(d)}`;
}
