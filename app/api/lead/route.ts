import { NextResponse } from 'next/server';

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

type LeadStage = 'partial' | 'complete';

interface LeadPayload {
  stage: LeadStage;
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
    stage: body.stage === 'complete' ? 'complete' : 'partial',
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

  if (!WEBHOOK_URL) {
    // No destination configured yet. Log so it shows up in Vercel function
    // logs, and succeed so the funnel proceeds. Wire LEAD_WEBHOOK_URL to a
    // Sheet/Zap/CRM to start collecting the reach-out list.
    console.log('[lead] captured (no LEAD_WEBHOOK_URL configured):', JSON.stringify(record));
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      console.error('[lead] webhook responded', res.status);
      // Don't fail the visitor's flow over a downstream hiccup.
      return NextResponse.json({ ok: true, forwarded: false });
    }
  } catch (err) {
    console.error('[lead] webhook error', err);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
