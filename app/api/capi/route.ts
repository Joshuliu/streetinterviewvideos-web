import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, capiConfigured } from '@/lib/capi';

// Server-side Conversions API relay. The funnel POSTs here with the SAME
// event_id it passed to the browser pixel; we enrich with first-party cookies
// (_fbp/_fbc) and request IP / user-agent, then forward to Meta. Meta dedups
// the browser + server copies on (event_name, event_id). No-ops gracefully
// until META_CAPI_TOKEN is set (see lib/capi.ts).
export const runtime = 'nodejs';

// Only the deep conversion events are mirrored server-side.
const ALLOWED = new Set(['CompleteRegistration', 'Schedule', 'Lead']);

export async function POST(req: NextRequest) {
  let body: {
    eventName?: string;
    eventId?: string;
    email?: string;
    phone?: string;
    name?: string;
    eventSourceUrl?: string;
    customData?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const eventName = String(body.eventName || '');
  const eventId = String(body.eventId || '');
  if (!ALLOWED.has(eventName) || !eventId) {
    return NextResponse.json({ ok: false, error: 'bad_event' }, { status: 400 });
  }

  // First-party pixel cookies ride along with the request automatically.
  const fbp = req.cookies.get('_fbp')?.value;
  const fbc = req.cookies.get('_fbc')?.value;
  const userAgent = req.headers.get('user-agent') || undefined;
  const clientIp =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    undefined;

  const name = String(body.name || '').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || undefined;
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

  const result = await sendCapiEvent({
    eventName,
    eventId,
    eventSourceUrl: typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : undefined,
    email: typeof body.email === 'string' ? body.email : undefined,
    phone: typeof body.phone === 'string' ? body.phone : undefined,
    firstName,
    lastName,
    fbp,
    fbc,
    clientIp: clientIp || undefined,
    userAgent,
    customData:
      body.customData && typeof body.customData === 'object' ? body.customData : undefined,
  });

  // `configured` distinguishes "no token in this deployment's env" from
  // "token present but Meta rejected" — handy when verifying setup. Booleans
  // only; never leaks the token.
  return NextResponse.json({
    ok: true,
    configured: capiConfigured(),
    forwarded: !result.skipped && result.ok,
    status: result.status ?? null,
  });
}
