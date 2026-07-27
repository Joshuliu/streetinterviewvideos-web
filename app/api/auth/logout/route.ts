import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, audienceFromHost } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const audience = audienceFromHost(req.headers.get('host'));
  if (!audience) return NextResponse.json({ ok: false, error: 'bad_host' }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE[audience], '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
