import { eq, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';

// What is LEFT of the Calendly integration after 2026-07-31.
//
// The Calendly -> CRM poll used to live here: it hit the Calendly API every
// five minutes and wrote a lead_meetings row per booking. It is gone. Google
// Calendar is now the CRM's only source of meetings (lib/crm/calendar.ts) —
// every Calendly booking reaches an admin's calendar anyway, via the
// auto-guests Apps Script, so polling Calendly as well simply recorded every
// call twice, in two tables that then disagreed.
//
// Calendly itself is untouched and still the booking system: the funnel embeds
// it, Neil sends its links, and scripts/calendly-auto-guests.gs still runs as
// studio@ adding Neil as a guest. Inviting him is now that script's whole job,
// and it is what puts a booking on the calendar this CRM reads.
//
// All that survives here is lead lookup, which /api/lead needs and which never
// had anything to do with Calendly's API.

function digits(s: string): string {
  return (s || '').replace(/\D/g, '');
}

/**
 * Find an existing lead by email, then by phone digits.
 *
 * Prefers live leads (not archived, not converted), then newest — so a
 * duplicate pair resolves to the row the team is actually working. Shared
 * with /api/lead, whose dedupe keeps a returning visitor on their existing
 * row instead of minting a twin.
 */
export async function findLeadByContact(email: string, phone: string) {
  const d = db();
  const byEmail = await d
    .select()
    .from(tables.leads)
    .where(eq(sql`lower(${tables.leads.email})`, email))
    .orderBy(
      sql`(${tables.leads.convertedAccountId} is null and ${tables.leads.archivedAt} is null) desc`,
      sql`${tables.leads.createdAt} desc`,
    )
    .limit(1);
  if (byEmail[0]) return byEmail[0];
  const ph = digits(phone);
  if (!ph) return null;
  const byPhone = await d
    .select()
    .from(tables.leads)
    .where(eq(sql`regexp_replace(${tables.leads.phone}, '\\D', '', 'g')`, ph))
    .orderBy(
      sql`(${tables.leads.convertedAccountId} is null and ${tables.leads.archivedAt} is null) desc`,
      sql`${tables.leads.createdAt} desc`,
    )
    .limit(1);
  return byPhone[0] ?? null;
}
