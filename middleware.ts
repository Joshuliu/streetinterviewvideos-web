import { NextRequest, NextResponse } from 'next/server';

// Host-based routing for the CRM (docs/crm_requirements.md):
//   team.streetinterviewvideos.com → app/team (internal CRM)
// The apex domain keeps serving the marketing site and 404s the /team path so
// the CRM is only ever reachable through its subdomain. Local dev:
// team.localhost:3000 (browsers resolve *.localhost without /etc/hosts edits).
//
// studio.* (the old client tracker) was removed 2026-08-30: any request to it
// redirects to the marketing site, so a client with the link bookmarked lands
// on the homepage instead of an error. The subdomain can be deleted from
// Vercel/DNS whenever; this redirect just covers the interim.
//
// /api/* is exempt from rewriting — the auth endpoints read the Host header
// themselves to decide the audience.

function subdomain(req: NextRequest): string {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  return host.split('.')[0];
}

export function middleware(req: NextRequest) {
  const sub = subdomain(req);
  const { pathname } = req.nextUrl;

  if (sub === 'studio') {
    return NextResponse.redirect('https://www.streetinterviewvideos.com/', 308);
  }

  if (sub === 'team') {
    if (pathname.startsWith('/api/') || pathname === '/api') {
      return NextResponse.next();
    }
    // Guard against double-prefixing: the canonical path on the subdomain
    // never includes /team, so a direct /team path 404s here too.
    if (pathname === '/team' || pathname.startsWith('/team/')) {
      return NextResponse.rewrite(new URL('/__blocked', req.url));
    }
    const url = req.nextUrl.clone();
    url.pathname = `/team${pathname === '/' ? '' : pathname}`;
    const res = NextResponse.rewrite(url);
    // Belt-and-braces: the CRM must never end up in a search index.
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  // Apex (and www, previews, localhost): block direct access to the CRM route
  // group. Rewriting to a path that matches nothing renders the 404 page with
  // a real 404 status.
  if (pathname === '/team' || pathname.startsWith('/team/')) {
    return NextResponse.rewrite(new URL('/__blocked', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any path with a file extension (static assets,
  // sitemap.xml, robots.txt, icons). Everything else routes by host.
  matcher: ['/((?!_next/|.*\\..*).*)'],
};
