import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/crm/LogoutButton';
import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Every page in this group requires a valid admin session — and every data
// mutation re-checks it server-side; this redirect is just the front door.
export default function TeamAppLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect('/login');
  return (
    <>
      <header className="border-b border-[#2a2a2a]">
        <div className="max-w-site mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-4">
          <div className="font-display text-sm text-[#e9e6da] tracking-wider truncate">SIV · TEAM</div>
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
