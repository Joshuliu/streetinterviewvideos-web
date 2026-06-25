import { NextResponse } from 'next/server';
import { sendTelegram, escapeHtml } from '@/lib/telegram';

// Stages that trigger a Telegram alert:
//   contact     → new lead the moment we have contact details (catches bailers)
//   qualified   → finished the form with a qualifying budget (full responses)
//   unqualified → finished the form but under $5k (full responses)
//   booked      → picked a Calendly time
// The Google Sheet still holds every stage; this is the ping. To trim the
// noise, remove a stage from this set.
const TELEGRAM_STAGES = new Set(['contact', 'qualified', 'unqualified', 'booked']);

const STAGE_HEADERS: Record<string, string> = {
  contact: '🟢 <b>New lead</b>',
  qualified: '🔥 <b>Qualified lead</b>',
  unqualified: '⚪ <b>Unqualified lead</b> · under $5k/mo',
  booked: '📅 <b>Call booked</b>',
};

function telegramMessage(r: {
  stage: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  adspend: string;
  utm: Record<string, string>;
}): string {
  // Header, then a blank line, then one labelled line per answer we have.
  const lines: string[] = [STAGE_HEADERS[r.stage] || '🟢 <b>Lead update</b>', ''];
  if (r.name) lines.push(`👤 <b>Name:</b> ${escapeHtml(r.name)}`);
  if (r.email) lines.push(`✉️ <b>Email:</b> ${escapeHtml(r.email)}`);
  if (r.phone) lines.push(`📞 <b>Phone:</b> ${escapeHtml(r.phone)}`);
  if (r.company) lines.push(`🏢 <b>Company:</b> ${escapeHtml(r.company)}`);
  if (r.website) lines.push(`🔗 <b>Website:</b> ${escapeHtml(r.website)}`);
  if (r.adspend) lines.push(`💰 <b>Ad spend:</b> ${escapeHtml(r.adspend)}/mo`);
  if (r.utm?.utm_source) {
    const campaign = r.utm.utm_campaign ? ` · ${escapeHtml(r.utm.utm_campaign)}` : '';
    lines.push(`🎯 <b>Source:</b> ${escapeHtml(r.utm.utm_source)}${campaign}`);
  }
  return lines.join('\n');
}

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

  // Telegram ping for the key moments (no-op unless configured). Started here so
  // it runs in parallel with the webhook; awaited before returning so the
  // serverless function doesn't freeze the in-flight request.
  const notify = TELEGRAM_STAGES.has(record.stage)
    ? sendTelegram(telegramMessage(record))
    : Promise.resolve({ ok: true, skipped: true } as const);

  // Forward to the lead destination (Sheet/Zap/CRM). Failures here never fail
  // the visitor's flow.
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

  const tg = await notify;
  return NextResponse.json({
    ok: true,
    forwarded,
    notified: TELEGRAM_STAGES.has(record.stage) && !tg.skipped && tg.ok,
  });
}
