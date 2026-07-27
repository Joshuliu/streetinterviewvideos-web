import { NextRequest, NextResponse } from 'next/server';
import { audienceFromHost } from '@/lib/auth/config';
import { requestCode } from '@/lib/auth/otp';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

// Shared by both subdomains; the Host header decides the audience. The
// response is identical for known and unknown emails (spec §Auth 6).
export async function POST(req: NextRequest) {
  const audience = audienceFromHost(req.headers.get('host'));
  if (!audience) return NextResponse.json({ ok: false, error: 'bad_host' }, { status: 400 });

  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const result = await requestCode(email, audience, clientIp(req));
  if (!result.ok) {
    const status = result.error === 'rate_limited' ? 429 : 500;
    return NextResponse.json(result, { status });
  }
  return NextResponse.json({ ok: true });
}
