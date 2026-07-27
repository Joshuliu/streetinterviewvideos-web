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

/** "Today" / "Tomorrow" / weekday name, for task-list day headers. */
export function dayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

export function isOverdue(iso: string | null | undefined): boolean {
  return !!iso && iso < todayISO();
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return '';
  return fmtDate(d.toLocaleDateString('en-CA', { timeZone: BUSINESS_TZ }));
}
