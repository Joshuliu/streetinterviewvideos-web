import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import {
  Audience,
  OTP_EMAIL_LIMIT,
  OTP_IP_LIMIT,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  adminEmails,
  normalizeEmail,
} from './config';
import { sendOtpEmail } from './email';

function hashCode(code: string, email: string): string {
  // Email-salted so equal codes for different emails never share a hash.
  return createHash('sha256').update(`${code}:${email}`).digest('hex');
}

/** Is this email allowed to log in to this audience at all? */
async function isEligible(email: string, audience: Audience): Promise<boolean> {
  if (audience === 'team') return adminEmails().includes(email);
  const rows = await db()
    .select({ id: tables.loginEmails.id })
    .from(tables.loginEmails)
    .where(eq(tables.loginEmails.email, email))
    .limit(1);
  return rows.length > 0;
}

export type RequestCodeResult = { ok: true } | { ok: false; error: 'rate_limited' | 'send_failed' };

/**
 * Issue a login code. Deliberately returns ok for ineligible emails and for
 * per-email rate limiting (nothing is sent in either case): responses must
 * never reveal which emails are on file (spec §Auth 6). Only the per-IP limit
 * is a visible error, because it applies identically to every email.
 */
export async function requestCode(rawEmail: string, audience: Audience, ip: string): Promise<RequestCodeResult> {
  const email = normalizeEmail(rawEmail);

  const ipCutoff = new Date(Date.now() - OTP_IP_LIMIT.windowMs);
  const [{ count: ipCount }] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(tables.otpCodes)
    .where(and(eq(tables.otpCodes.ip, ip), gt(tables.otpCodes.createdAt, ipCutoff)));
  if (ipCount >= OTP_IP_LIMIT.max) return { ok: false, error: 'rate_limited' };

  if (!(await isEligible(email, audience))) return { ok: true };

  const emailCutoff = new Date(Date.now() - OTP_EMAIL_LIMIT.windowMs);
  const [{ count: emailCount }] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(tables.otpCodes)
    .where(and(eq(tables.otpCodes.email, email), gt(tables.otpCodes.createdAt, emailCutoff)));
  if (emailCount >= OTP_EMAIL_LIMIT.max) return { ok: true };

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  await db().insert(tables.otpCodes).values({
    email,
    codeHash: hashCode(code, email),
    audience,
    ip,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  try {
    await sendOtpEmail(email, code);
  } catch {
    return { ok: false, error: 'send_failed' };
  }
  return { ok: true };
}

export type VerifyCodeResult = { ok: true; email: string } | { ok: false; error: 'invalid' };

/**
 * Verify a code. Generic 'invalid' on every failure path (wrong code, expired,
 * attempts exhausted, unknown email): same no-enumeration rule as above.
 */
export async function verifyCode(rawEmail: string, audience: Audience, code: string): Promise<VerifyCodeResult> {
  const email = normalizeEmail(rawEmail);
  const invalid = { ok: false as const, error: 'invalid' as const };
  if (!/^\d{6}$/.test(code)) return invalid;

  const d = db();
  const candidates = await d
    .select()
    .from(tables.otpCodes)
    .where(
      and(
        eq(tables.otpCodes.email, email),
        eq(tables.otpCodes.audience, audience),
        isNull(tables.otpCodes.consumedAt),
        gt(tables.otpCodes.expiresAt, new Date()),
        lt(tables.otpCodes.attempts, OTP_MAX_ATTEMPTS),
      ),
    )
    .orderBy(sql`${tables.otpCodes.createdAt} desc`)
    .limit(1);
  if (candidates.length === 0) return invalid;
  const row = candidates[0];

  // Burn an attempt BEFORE comparing, atomically, so parallel guesses can't
  // exceed the cap (max 5 attempts per code, spec §Auth 2).
  const burned = await d
    .update(tables.otpCodes)
    .set({ attempts: sql`${tables.otpCodes.attempts} + 1` })
    .where(and(eq(tables.otpCodes.id, row.id), lt(tables.otpCodes.attempts, OTP_MAX_ATTEMPTS)))
    .returning({ id: tables.otpCodes.id });
  if (burned.length === 0) return invalid;

  const a = Buffer.from(hashCode(code, email));
  const b = Buffer.from(row.codeHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return invalid;

  // Re-check eligibility at redemption time (an email removed between
  // request and verify must not get a session).
  if (!(await isEligible(email, audience))) return invalid;

  await d.update(tables.otpCodes).set({ consumedAt: new Date() }).where(eq(tables.otpCodes.id, row.id));
  return { ok: true, email };
}
