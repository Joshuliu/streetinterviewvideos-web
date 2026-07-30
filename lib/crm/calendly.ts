import { and, eq, isNull, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { meetingPosition } from '@/lib/crm/board';

// Calendly → CRM sync. Calendly is the source of truth for meetings: whoever
// books (the funnel embed, Neil texting the booking link, a follow-up booked
// from a reschedule link), the booking lands in Calendly, and this sync pulls
// it into the CRM. It runs from /api/calendly-sync — pinged every 5 minutes by
// the auto-guests Apps Script (webhooks are a paid Calendly feature; polling
// on the script's existing free trigger is the budget version).
//
// Per scheduled event (active AND canceled, ±90 days):
// - upsert a lead_meetings row keyed on the event URI: time, cancellation,
//   board slot (re-slotted only when the TIME moved, so a hand-dragged call
//   keeps its spot).
// - attach it to the lead whose email matches the invitee (phone digits as
//   the fallback); merge-fill blank lead fields, never overwrite funnel data.
// - no lead? Create one (source 'calendly-direct') — that's Neil booking
//   someone who never touched the funnel. The funnel's Q&A blob (packed into
//   Calendly's one question by the embed) is parsed back out when present.
// - internal emails never become leads; a booking by the team is not a lead.

const INTERNAL_DOMAINS = ['streetinterviewvideos.com'];

interface CalendlyEvent {
  uri: string;
  status: 'active' | 'canceled';
  start_time: string;
}

interface CalendlyInvitee {
  uri: string;
  email: string;
  name?: string;
  status: 'active' | 'canceled';
  questions_and_answers?: Array<{ question?: string; answer?: string }>;
}

export interface SyncSummary {
  events: number;
  meetingsCreated: number;
  meetingsUpdated: number;
  meetingsCanceled: number;
  leadsCreated: number;
  skipped: number;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function calendlyJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`calendly ${res.status} for ${url.split('?')[0]}`);
  return (await res.json()) as T;
}

/** All pages of a Calendly collection endpoint. */
async function calendlyCollection<T>(firstUrl: string, token: string): Promise<T[]> {
  const out: T[] = [];
  let url: string | null = firstUrl;
  while (url) {
    const data: { collection?: T[]; pagination?: { next_page?: string | null } } = await calendlyJson(url, token);
    out.push(...(data.collection ?? []));
    url = data.pagination?.next_page ?? null;
  }
  return out;
}

/**
 * The funnel packs its three answers into the event's single question as
 * "Company: X\nWebsite: Y\nMonthly ad spend: Z" (see components/LeadFunnel).
 * Pull them back out of a direct booking's answer when someone used the link
 * with the prefill, or typed something in the same shape.
 */
function parseFunnelAnswer(invitee: CalendlyInvitee): { company: string; website: string; adspend: string } {
  const answer = (invitee.questions_and_answers ?? []).map((q) => q.answer ?? '').join('\n');
  const grab = (label: string) => {
    const m = answer.match(new RegExp(`^${label}:\\s*(.+)$`, 'mi'));
    return (m?.[1] ?? '').trim().slice(0, 300);
  };
  return { company: grab('Company'), website: grab('Website'), adspend: grab('Monthly ad spend') };
}

/** Same tier rule as the funnel: only the lowest tier is unqualified. */
function qualifiedFromAdspend(adspend: string): boolean | null {
  if (!adspend) return null;
  return adspend !== 'Under $5k';
}

const digits = (s: string) => s.replace(/\D/g, '');

function isInternalEmail(email: string): boolean {
  const domain = email.split('@')[1] ?? '';
  return INTERNAL_DOMAINS.includes(domain);
}

/**
 * The lead a person maps to: email match first, phone digits as the fallback.
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

export async function syncCalendlyMeetings(): Promise<SyncSummary> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) throw new Error('CALENDLY_API_TOKEN is not set');
  const d = db();
  const summary: SyncSummary = {
    events: 0,
    meetingsCreated: 0,
    meetingsUpdated: 0,
    meetingsCanceled: 0,
    leadsCreated: 0,
    skipped: 0,
  };

  const me = await calendlyJson<{ resource: { current_organization: string } }>('https://api.calendly.com/users/me', token);
  const org = me.resource.current_organization;

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const min = new Date(now - 90 * DAY).toISOString();
  const max = new Date(now + 90 * DAY).toISOString();
  // No status filter: canceled events are exactly how we learn about
  // cancellations and reschedules (a reschedule = cancel + fresh event).
  const events = await calendlyCollection<CalendlyEvent>(
    `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(org)}&min_start_time=${min}&max_start_time=${max}&count=100`,
    token,
  );
  summary.events = events.length;

  for (const event of events) {
    const invitees = await calendlyCollection<CalendlyInvitee>(`${event.uri}/invitees?count=100`, token);
    // One-on-one events: one invitee. Guard anyway; skip events with none.
    const invitee = invitees[0];
    if (!invitee?.email) {
      summary.skipped++;
      continue;
    }
    const email = invitee.email.trim().toLowerCase();
    const startAt = new Date(event.start_time);
    const canceled = event.status === 'canceled';

    const [existing] = await d
      .select()
      .from(tables.leadMeetings)
      .where(eq(tables.leadMeetings.calendlyEventUri, event.uri));

    if (existing) {
      const timeMoved = existing.startAt?.getTime() !== startAt.getTime();
      const cancelFlips = canceled !== !!existing.canceledAt;
      if (timeMoved || cancelFlips || !existing.calendlyInviteeUri) {
        await d
          .update(tables.leadMeetings)
          .set({
            startAt,
            calendlyInviteeUri: invitee.uri,
            canceledAt: canceled ? existing.canceledAt ?? new Date() : null,
            // Re-slot on the board only when the TIME moved — a repeat sync
            // must not stomp the spot an admin dragged the call to.
            ...(timeMoved ? { position: meetingPosition(startAt) } : {}),
            updatedAt: new Date(),
          })
          .where(eq(tables.leadMeetings.id, existing.id));
        summary.meetingsUpdated++;
        if (cancelFlips && canceled) summary.meetingsCanceled++;
      }
      continue;
    }

    // New event. Find (or create) its lead.
    let lead = await findLeadByContact(email, '');
    if (!lead) {
      if (isInternalEmail(email) || canceled) {
        // Team bookings never become leads; neither does a booking already
        // canceled before we ever saw it.
        summary.skipped++;
        continue;
      }
      const parsed = parseFunnelAnswer(invitee);
      const [created] = await d
        .insert(tables.leads)
        .values({
          stage: 'booked',
          name: (invitee.name ?? '').trim().slice(0, 200),
          email,
          company: parsed.company.slice(0, 200),
          website: parsed.website.slice(0, 300),
          adspend: parsed.adspend.slice(0, 60),
          qualified: qualifiedFromAdspend(parsed.adspend),
          source: 'calendly-direct',
        })
        .returning();
      lead = created;
      summary.leadsCreated++;
    } else if (!canceled) {
      // A fresh booking is live interest: resurface an archived lead, and
      // stamp the funnel-progress marker. Funnel-captured fields stay as the
      // funnel wrote them — Calendly only fills blanks.
      const parsed = parseFunnelAnswer(invitee);
      await d
        .update(tables.leads)
        .set({
          stage: 'booked',
          archivedAt: null,
          ...(lead.name ? {} : { name: (invitee.name ?? '').trim().slice(0, 200) }),
          ...(lead.company ? {} : { company: parsed.company.slice(0, 200) }),
          ...(lead.website ? {} : { website: parsed.website.slice(0, 300) }),
          ...(lead.adspend ? {} : { adspend: parsed.adspend.slice(0, 60), qualified: qualifiedFromAdspend(parsed.adspend) }),
          updatedAt: new Date(),
        })
        .where(eq(tables.leads.id, lead.id));
    }

    await d.insert(tables.leadMeetings).values({
      leadId: lead.id,
      startAt,
      canceledAt: canceled ? new Date() : null,
      position: meetingPosition(startAt),
      calendlyEventUri: event.uri,
      calendlyInviteeUri: invitee.uri,
    });
    summary.meetingsCreated++;
  }

  // A hand-entered meeting that later gets its Calendly twin synced would
  // double up on the board. Cheap guard: drop manual rows whose lead gained a
  // Calendly row at the same start time.
  await d.execute(sql`
    delete from lead_meetings m
    where m.calendly_event_uri is null
      and exists (
        select 1 from lead_meetings c
        where c.lead_id = m.lead_id
          and c.calendly_event_uri is not null
          and c.start_at = m.start_at
      )
      and m.notes = ''
  `);

  return summary;
}
