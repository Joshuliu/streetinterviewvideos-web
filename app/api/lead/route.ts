import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { fetchCalendlyStartTime, findLeadByContact } from '@/lib/crm/calendly';
import { meetingPosition } from '@/lib/crm/board';

// Telegram alerts now live in the Google Apps Script webhook (see
// scripts/google-sheet-lead-webhook.gs), NOT here — the Sheet is where each
// lead's message id is remembered, so the alert can edit ONE message in place
// (contact → qualified) instead of sending a new message per step, and fire a
// fresh ping on booking. This route just forwards the record to the webhook.

// Lead capture endpoint for the /book funnel. The funnel POSTs here twice:
//   1. stage: 'partial'  — right after step 1 (name + email), so a lead is
//      captured even if the visitor never reaches Calendly. This is the
//      replacement for Meta lead-ad forms: own the lead the moment we have
//      contact details.
//   2. stage: 'complete' — after step 3 (company, website, monthly ad spend),
//      the full qualified lead.
//
// Delivery is intentionally vendor-agnostic: we forward the JSON to whatever
// webhook URL is configured in LEAD_WEBHOOK_URL (a Google Apps Script Web App,
// Zapier/Make catch hook, CRM endpoint, etc.). If the env var is unset the
// route still returns 200 so the funnel keeps working end-to-end — we just
// haven't wired a destination yet.
const WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL;

interface LeadPayload {
  // Stable per-session id so the destination can upsert one row that fills in
  // as the visitor progresses, rather than appending a new row per step.
  leadId?: string;
  // Progress marker: contact → brand → qualified/unqualified → booked.
  stage?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  adspend?: string;
  // true once they pick a qualifying ad-spend tier, false on the lowest tier,
  // null before ad spend is answered (the partial, step-1 capture).
  qualified?: boolean | null;
  // UTM / attribution captured from the landing URL.
  utm?: Record<string, string>;
  // Sent with stage 'booked': the Calendly URIs from the embed's
  // event_scheduled message, used to resolve the meeting time server-side.
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Minimal validation — we always need a usable email to be worth capturing.
  if (!body || typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const record = {
    leadId: (body.leadId || '').toString().slice(0, 80),
    stage: (body.stage || '').toString().trim().slice(0, 40),
    name: (body.name || '').trim().slice(0, 200),
    email: body.email.trim().slice(0, 200),
    phone: (body.phone || '').trim().slice(0, 40),
    company: (body.company || '').trim().slice(0, 200),
    website: (body.website || '').trim().slice(0, 300),
    adspend: (body.adspend || '').trim().slice(0, 60),
    qualified: typeof body.qualified === 'boolean' ? body.qualified : null,
    utm: body.utm && typeof body.utm === 'object' ? body.utm : {},
    receivedAt: new Date().toISOString(),
    source: 'streetinterviewvideos.com/qualify',
  };

  // Upsert into the CRM's leads table (team. Leads section) — one row per
  // PERSON, matched by funnel session first, then by email/phone. Someone who
  // runs the funnel twice (unqualified on Monday, qualified on Tuesday) keeps
  // ONE row: the latest answers overwrite, nothing already known goes blank.
  // Runs alongside the webhook forward; a DB failure never fails the
  // visitor's flow.
  if (record.leadId) {
    try {
      const d = db();
      const [bySession] = await d.select().from(tables.leads).where(eq(tables.leads.funnelId, record.leadId));
      const byContact = bySession ?? (await findLeadByContact(record.email.toLowerCase(), record.phone));
      // A converted lead is a closed deal — a fresh funnel run by that person
      // starts a new one rather than reopening the old row.
      const existing = byContact && !byContact.convertedAccountId ? byContact : null;

      let leadRowId: string;
      if (existing) {
        await d
          .update(tables.leads)
          .set({
            // Adopt the new session so this visit's later posts match fast.
            funnelId: record.leadId,
            stage: record.stage,
            email: record.email,
            // Latest answers win, but a step-1 partial (blank company etc.)
            // never blanks what a fuller earlier run captured.
            ...(record.name ? { name: record.name } : {}),
            ...(record.phone ? { phone: record.phone } : {}),
            ...(record.company ? { company: record.company } : {}),
            ...(record.website ? { website: record.website } : {}),
            ...(record.adspend ? { adspend: record.adspend } : {}),
            ...(record.qualified !== null ? { qualified: record.qualified } : {}),
            ...(Object.keys(record.utm).length ? { utm: record.utm as Record<string, string> } : {}),
            // Coming back through the funnel is live interest again.
            archivedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(tables.leads.id, existing.id));
        leadRowId = existing.id;
      } else {
        const [created] = await d
          .insert(tables.leads)
          .values({
            funnelId: record.leadId,
            stage: record.stage,
            name: record.name,
            email: record.email,
            phone: record.phone,
            company: record.company,
            website: record.website,
            adspend: record.adspend,
            qualified: record.qualified,
            utm: record.utm as Record<string, string>,
            source: record.source,
          })
          .returning({ id: tables.leads.id });
        leadRowId = created.id;
      }

      // A booking gets its own lead_meetings row, keyed on the Calendly event
      // URI (the 5-minute Calendly sync upserts on the same key, so whichever
      // side lands first, there's one row). Meeting time from the Calendly
      // API; admins set it by hand on the lead when the lookup fails.
      const eventUri = (body.calendlyEventUri || '').toString().trim().slice(0, 300);
      const inviteeUri = (body.calendlyInviteeUri || '').toString().trim().slice(0, 300);
      if (record.stage === 'booked' && eventUri) {
        const startAt = await fetchCalendlyStartTime(eventUri);
        const [meeting] = await d
          .select()
          .from(tables.leadMeetings)
          .where(eq(tables.leadMeetings.calendlyEventUri, eventUri));
        if (!meeting) {
          await d.insert(tables.leadMeetings).values({
            leadId: leadRowId,
            startAt,
            ...(startAt ? { position: meetingPosition(startAt) } : {}),
            calendlyEventUri: eventUri,
            calendlyInviteeUri: inviteeUri,
          });
        } else if (startAt && meeting.startAt?.getTime() !== startAt.getTime()) {
          // Re-slot on the board only when the TIME actually moved: a repeat
          // post for the same booking must not stomp a hand-dragged spot.
          await d
            .update(tables.leadMeetings)
            .set({ startAt, position: meetingPosition(startAt), updatedAt: new Date() })
            .where(eq(tables.leadMeetings.id, meeting.id));
        }
      }
    } catch (err) {
      console.error('[lead] db upsert error', err);
    }
  }

  // Forward to the lead destination (the Apps Script webhook, which also sends
  // the Telegram alert). Failures here never fail the visitor's flow.
  let forwarded = false;
  if (WEBHOOK_URL) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      forwarded = res.ok;
      if (!res.ok) console.error('[lead] webhook responded', res.status);
    } catch (err) {
      console.error('[lead] webhook error', err);
    }
  } else {
    console.log('[lead] captured (no LEAD_WEBHOOK_URL configured):', JSON.stringify(record));
  }

  return NextResponse.json({ ok: true, forwarded });
}
