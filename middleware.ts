import { NextRequest, NextResponse } from 'next/server';

// Host-based routing for the CRM surfaces (docs/crm_requirements.md):
//   team.streetinterviewvideos.com   → app/team    (internal CRM)
//   studio.streetinterviewvideos.com → app/studio  (client order tracker)
// The apex domain keeps serving the marketing site and 404s the /team and
// /studio paths so the CRM is only ever reachable through its subdomains.
// Local dev: team.localhost:3000 / studio.localhost:3000 (browsers resolve
// *.localhost without /etc/hosts edits).
//
// /api/* is exempt from rewriting — the auth endpoints are shared by both
// subdomains and read the Host header themselves to decide the audience.

const SUBDOMAIN_APPS: Record<string, string> = {
  team: '/team',
  studio: '/studio',
};

function subdomainApp(req: NextRequest): string | null {
  const host = (req.headers.get('host') ?? '').split(':')[0].toLowerCase();
  const sub = host.split('.')[0];
  if (!(sub in SUBDOMAIN_APPS)) return null;
  // Accept team.<anything> — production, *.localhost, and Vercel preview
  // aliases all route the same way.
  return SUBDOMAIN_APPS[sub];
}

export function middleware(req: NextRequest) {
  const app = subdomainApp(req);
  const { pathname } = req.nextUrl;

  if (app) {
    if (pathname.startsWith('/api/') || pathname === '/api') {
      return NextResponse.next();
    }
    // Guard against double-prefixing and against reaching the *other* app's
    // pages from this subdomain: any direct /team or /studio path 404s here
    // too, because the canonical path on a subdomain never includes it.
    if (pathname === '/team' || pathname === '/studio' || pathname.startsWith('/team/') || pathname.startsWith('/studio/')) {
      return NextResponse.rewrite(new URL('/__blocked', req.url));
    }
    const url = req.nextUrl.clone();
    url.pathname = `${app}${pathname === '/' ? '' : pathname}`;
    const res = NextResponse.rewrite(url);
    // Belt-and-braces: the CRM must never end up in a search index.
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  // Apex (and www, previews, localhost): block direct access to the CRM
  // route groups. Rewriting to a path that matches nothing renders the 404
  // page with a real 404 status.
  if (pathname === '/team' || pathname === '/studio' || pathname.startsWith('/team/') || pathname.startsWith('/studio/')) {
    return NextResponse.rewrite(new URL('/__blocked', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any path with a file extension (static assets,
  // sitemap.xml, robots.txt, icons). Everything else routes by host.
  matcher: ['/((?!_next/|.*\\..*).*)'],
};
