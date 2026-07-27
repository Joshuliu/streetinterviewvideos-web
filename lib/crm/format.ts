// Small date helpers for the CRM views. Dates are YYYY-MM-DD strings
// (Postgres date columns via drizzle string mode).

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  return `${MONTHS[m - 1]} ${d}${y !== now.getFullYear() ? ` ${y}` : ''}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(iso: string | null | undefined): boolean {
  return !!iso && iso < todayISO();
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return '—';
  return fmtDate(d.toISOString().slice(0, 10));
}
