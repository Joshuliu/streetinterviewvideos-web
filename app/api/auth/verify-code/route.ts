import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, audienceFromHost } from '@/lib/auth/config';
import { verifyCode } from '@/lib/auth/otp';
import { createSessionToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const audience = audienceFromHost(req.headers.get('host'));
  if (!audience) return NextResponse.json({ ok: false, error: 'bad_host' }, { status: 400 });

  let email: unknown, code: unknown;
  try {
    ({ email, code } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (typeof email !== 'string' || typeof code !== 'string') {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const result = await verifyCode(email, audience, code.trim());
  if (!result.ok) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  // Host-only cookie (no Domain attribute): the team. session never leaks to
  // any other subdomain.
  res.cookies.set(SESSION_COOKIE[audience], createSessionToken(result.email, audience), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS[audience],
  });
  return res;
}
