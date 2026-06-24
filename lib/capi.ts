import { createHash } from 'crypto';

// Meta Conversions API (server-side) sender.
//
// Why: the browser pixel loses events to ad-blockers, iOS/ITP, and crashes.
// Sending the same conversion server-to-server — with a shared event_id so
// Meta dedups the browser + server copies — recovers that lost signal without
// double-counting. The server call goes to graph.facebook.com directly, so it
// can't be blocked the way the in-page facebook.com pixel call can.
//
// Dormant by design: if META_CAPI_TOKEN is unset this no-ops and returns
// { skipped: true }, exactly like LEAD_WEBHOOK_URL — so nothing breaks before
// the token is configured. The browser pixel keeps firing regardless.

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const CAPI_TOKEN = process.env.META_CAPI_TOKEN;
// Optional: when set, events show up in Meta Events Manager → Test events.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;
const GRAPH_VERSION = 'v21.0';

// Meta requires advanced-matching fields to be SHA-256 hashed after
// normalizing (trim + lowercase).
const norm = (v: string) => v.trim().toLowerCase();
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

export interface CapiEventInput {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  // Pulled from the incoming request (cookies / headers) by the route.
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}

export function capiConfigured(): boolean {
  return Boolean(PIXEL_ID && CAPI_TOKEN);
}

export async function sendCapiEvent(
  input: CapiEventInput
): Promise<{ ok: boolean; skipped?: boolean; status?: number }> {
  if (!PIXEL_ID || !CAPI_TOKEN) return { ok: true, skipped: true };

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [sha256(norm(input.email))];
  if (input.firstName) userData.fn = [sha256(norm(input.firstName))];
  if (input.lastName) userData.ln = [sha256(norm(input.lastName))];
  // fbp/fbc/ip/ua are NOT hashed (Meta matches them raw).
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId, // shared with the browser pixel → dedup
    action_source: 'website',
    user_data: userData,
  };
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl;
  if (input.customData) event.custom_data = input.customData;

  const body: Record<string, unknown> = { data: [event] };
  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
        CAPI_TOKEN
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      console.error('[capi] graph error', res.status, await res.text().catch(() => ''));
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error('[capi] send error', err);
    return { ok: false };
  }
}
