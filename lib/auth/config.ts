// Shared auth config for the CRM (docs/crm_requirements.md). Team-only since
// 2026-08-30: the studio. client tracker and its logins were removed.

export type Audience = 'team';
export type Owner = 'josh' | 'neil';

export const SESSION_COOKIE: Record<Audience, string> = {
  team: 'siv_team_session',
};

export const SESSION_MAX_AGE_SECONDS: Record<Audience, number> = {
  team: 30 * 24 * 60 * 60,
};

export const OTP_TTL_MS = 10 * 60 * 1000; // codes expire in 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
// Per-email: silently stop sending after this many codes in the window (a
// visible error would leak which emails are on file). Per-IP: hard 429.
export const OTP_EMAIL_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };
export const OTP_IP_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 };

/** Admin allowlist for team.: env-configured, never the DB (spec §Auth 3). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Which task-list owner an admin email maps to. v1 has exactly two admins;
 * anything that isn't Neil is Joshua.
 */
export function emailToOwner(email: string): Owner {
  return normalizeEmail(email).split('@')[0].startsWith('neil') ? 'neil' : 'josh';
}

/** Resolve the auth audience from a request Host header, or null elsewhere. */
export function audienceFromHost(host: string | null): Audience | null {
  const sub = (host ?? '').split(':')[0].toLowerCase().split('.')[0];
  return sub === 'team' ? 'team' : null;
}
