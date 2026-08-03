import Link from 'next/link';
import { redirect } from 'next/navigation';
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
      <header className="border-b border-[#2a2a2a]">
        <div className="max-w-site mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            {/* The mark alone: it's the same one as the favicon, and dropping
                the wordmark is what stops the nav colliding with "Log out" on
                a phone. aria-label because there's no text left to name it. */}
            <Link href="/" aria-label="Team home" className="flex items-center shrink-0">
              <img src="/siv-icon.png" alt="" width={96} height={96} className="h-7 w-7 shrink-0" />
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-[#9ca3af] hover:text-white transition-colors">
                My Tasks
              </Link>
              <Link href="/clients" className="text-[#9ca3af] hover:text-white transition-colors">
                Clients
              </Link>
              <Link href="/leads" className="text-[#9ca3af] hover:text-white transition-colors">
                Leads
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm text-[#9ca3af] hidden sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-site mx-auto px-6 lg:px-12 py-10">{children}</main>
    </>
  );
}
