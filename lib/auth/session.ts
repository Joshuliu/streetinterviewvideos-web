import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import {
  Audience,
  Owner,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  adminEmails,
  emailToOwner,
  normalizeEmail,
} from './config';

// Stateless HMAC-signed session cookies. No session table: every read
// re-checks the email against the admin allowlist, so removing an email
// revokes access immediately instead of waiting out the cookie.

interface SessionPayload {
  email: string;
  aud: Audience;
  exp: number; // unix seconds
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(payloadB64: string): string {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url');
}

export function createSessionToken(email: string, audience: Audience): string {
  const payload: SessionPayload = {
    email: normalizeEmail(email),
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS[audience],
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string | undefined, audience: Audience): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
  } catch {
    return null;
  }
  if (payload.aud !== audience) return null;
  if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export interface AdminSession {
  email: string;
  owner: Owner;
}

/** Valid team. session, or null. Re-checks the env allowlist on every call. */
export function getAdminSession(): AdminSession | null {
  const token = cookies().get(SESSION_COOKIE.team)?.value;
  const payload = verifySessionToken(token, 'team');
  if (!payload) return null;
  if (!adminEmails().includes(payload.email)) return null;
  return { email: payload.email, owner: emailToOwner(payload.email) };
}
