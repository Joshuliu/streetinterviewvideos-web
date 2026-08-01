import { ExternalAccountClient } from 'google-auth-library';

// Read-only access to the admins' own Google Calendars.
//
// There is NO service account key here and there cannot be one: the GCP org
// enforces `iam.managed.disableServiceAccountKeyCreation`. Auth is Vercel's
// OIDC token traded at Google's STS for an impersonated service account token,
// so the only credential in play is short-lived and minted per request.
//
// There is also no domain-wide delegation. Neil and Josh each SHARED their
// calendar with the service account address, which is why only their two
// calendars are readable rather than every calendar in the domain. A calendar
// that was never shared answers 404 — see readCalendar's handling.
//
// Vercel stamps the deploy environment into the OIDC subject, so `production`
// and `development` are separate IAM principals and both are bound. `preview`
// is not, so preview deploys cannot authenticate; that is deliberate, not a
// bug to chase.

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export interface GCalEvent {
  /** Stable across every attendee's copy of the event — the dedupe key. */
  iCalUID: string;
  summary: string;
  /** Null for an event Google returned without a usable start. */
  startAt: Date | null;
  endAt: Date | null;
  allDay: boolean;
  status: string;
  attendees: string[];
  htmlLink: string | null;
  /** The join link, resolved from whichever field the organiser used. */
  meetingUrl: string | null;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

/**
 * An access token for the service account, via Vercel OIDC -> STS ->
 * impersonation. Cached per token lifetime by the client itself.
 */
let client: ReturnType<typeof ExternalAccountClient.fromJSON> | null = null;

function authClient() {
  if (client) return client;
  const projectNumber = required('GCP_PROJECT_NUMBER');
  const pool = required('GCP_WIF_POOL_ID');
  const provider = required('GCP_WIF_PROVIDER_ID');
  const serviceAccount = required('GCP_SERVICE_ACCOUNT_EMAIL');

  client = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${pool}/providers/${provider}`,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateAccessToken`,
    // Read the token per call rather than closing over it: Vercel rotates
    // VERCEL_OIDC_TOKEN between invocations, and a captured one goes stale.
    subject_token_supplier: {
      getSubjectToken: async () => required('VERCEL_OIDC_TOKEN'),
    },
  });
  if (!client) throw new Error('could not build the workload identity client');
  client.scopes = [SCOPE];
  return client;
}

export async function googleAccessToken(): Promise<string> {
  const token = (await authClient().getAccessToken()).token;
  if (!token) throw new Error('no access token returned from impersonation');
  return token;
}

interface RawEvent {
  iCalUID?: string;
  summary?: string;
  status?: string;
  htmlLink?: string;
  hangoutLink?: string;
  location?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string; resource?: boolean }>;
}

/**
 * Where the call happens. Calendly bookings all carry a Meet link; a vendor's
 * Zoom invite tends to put the URL in `location` instead, and an in-person
 * meeting has neither. Google's event page is the last resort — always there,
 * and better than a dead tap.
 */
function joinLink(raw: RawEvent): string | null {
  if (raw.hangoutLink) return raw.hangoutLink;
  const video = raw.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri;
  if (video) return video;
  const location = (raw.location ?? '').trim();
  if (/^https?:\/\//i.test(location)) return location.split(/\s+/)[0];
  return raw.htmlLink ?? null;
}

function toEvent(raw: RawEvent): GCalEvent | null {
  if (!raw.iCalUID) return null;
  const allDay = !raw.start?.dateTime && !!raw.start?.date;
  const parse = (part?: { dateTime?: string; date?: string }) => {
    const v = part?.dateTime ?? part?.date;
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  return {
    iCalUID: raw.iCalUID,
    summary: (raw.summary ?? '').slice(0, 500),
    startAt: parse(raw.start),
    endAt: parse(raw.end),
    allDay,
    status: raw.status ?? 'confirmed',
    // Meeting rooms and other resources are not people; dropping them here
    // keeps them out of the "is there an outside attendee" question later.
    attendees: (raw.attendees ?? []).filter((a) => a.email && !a.resource).map((a) => a.email!.toLowerCase()),
    htmlLink: raw.htmlLink ?? null,
    meetingUrl: joinLink(raw),
  };
}

/**
 * Every event on one calendar in the window, recurring ones expanded into
 * their individual occurrences. Returns [] (never throws) when the calendar
 * isn't shared with the service account, so one unshared admin can't take the
 * whole sync down.
 */
export async function readCalendar(
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
  token: string,
): Promise<GCalEvent[]> {
  const out: GCalEvent[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('timeMin', timeMin.toISOString());
    url.searchParams.set('timeMax', timeMax.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');
    url.searchParams.set('showDeleted', 'true');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      // 404 = never shared with us, 403 = shared at free/busy only. Both are
      // setup problems on one calendar, not reasons to fail the whole run.
      console.error(`[gcal] ${calendarId} responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return out;
    }
    const data = (await res.json()) as { items?: RawEvent[]; nextPageToken?: string };
    for (const raw of data.items ?? []) {
      const ev = toEvent(raw);
      if (ev) out.push(ev);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return out;
}
