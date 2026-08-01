import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/crm/LogoutButton';
import { getClientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function StudioAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();
  if (!session) redirect('/login');
  return (
    <>
      <header className="border-b border-border bg-paper">
        <div className="max-w-site mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {/* Same mark as the favicon, so the tab and the header match. */}
            <img src="/siv-icon.png" alt="" width={96} height={96} className="h-7 w-7 shrink-0" />
            <div className="font-display text-sm text-ink-900 tracking-wider truncate">STREETINTERVIEWVIDEOS</div>
          </div>
          <LogoutButton light />
        </div>
      </header>
      <main className="max-w-site mx-auto px-6 lg:px-12 py-10">{children}</main>
    </>
  );
}
