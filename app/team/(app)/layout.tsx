import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AutoRefresh } from '@/components/crm/AutoRefresh';
import { LogoutButton } from '@/components/crm/LogoutButton';
import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Every page in this group requires a valid admin session: and every data
// mutation re-checks it server-side; this redirect is just the front door.
export default function TeamAppLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect('/login');
  return (
    <>
      <AutoRefresh />
      <header className="border-b border-[var(--crm-line)]">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-12 h-14 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            {/* The mark alone: it's the same one as the favicon, and dropping
                the wordmark is what stops the nav colliding with "Log out" on
                a phone. aria-label because there's no text left to name it.
                Hidden below sm since Portfolio joined the nav (2026-08-03):
                four links + the mark + Log out don't fit 375px, and the mark
                is the one redundant element ("My Tasks" is also "/"). */}
            <Link href="/" aria-label="Team home" className="hidden sm:flex items-center shrink-0">
              <img src="/siv-icon.png" alt="" width={96} height={96} className="h-7 w-7 shrink-0" />
            </Link>
            <nav className="flex items-center gap-3 sm:gap-4 text-[13px] sm:text-sm">
              <Link href="/" className="text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors">
                My Tasks
              </Link>
              <Link href="/clients" className="text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors">
                Clients
              </Link>
              <Link href="/leads" className="text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors">
                Leads
              </Link>
              <Link href="/portfolio" className="text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors">
                Portfolio
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm text-[var(--crm-muted)] hidden sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-site mx-auto px-6 lg:px-12 py-10">{children}</main>
    </>
  );
}
