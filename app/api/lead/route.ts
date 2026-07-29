import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { fetchCalendlyStartTime } from '@/lib/crm/leads';

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
  // funnel session, filled in as the visitor progresses. Runs alongside the
  // webhook forward; a DB failure never fails the visitor's flow.
  if (record.leadId) {
    try {
      const eventUri = (body.calendlyEventUri || '').toString().trim().slice(0, 300);
      const inviteeUri = (body.calendlyInviteeUri || '').toString().trim().slice(0, 300);
      // Resolve the booked meeting's start time from the Calendly API (no-op
      // without CALENDLY_API_TOKEN; admins can set the time by hand instead).
      const meetingAt = record.stage === 'booked' && eventUri ? await fetchCalendlyStartTime(eventUri) : null;
      const values = {
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
        ...(eventUri ? { calendlyEventUri: eventUri } : {}),
        ...(inviteeUri ? { calendlyInviteeUri: inviteeUri } : {}),
        ...(meetingAt ? { meetingAt } : {}),
      };
      await db()
        .insert(tables.leads)
        .values(values)
        .onConflictDoUpdate({
          target: tables.leads.funnelId,
          set: { ...values, updatedAt: sql`now()` },
        });
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
