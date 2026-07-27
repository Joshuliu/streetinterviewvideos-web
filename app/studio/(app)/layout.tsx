import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/crm/LogoutButton';
import { getClientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function StudioAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();
  if (!session) redirect('/login');
  return (
    <>
      <header className="border-b border-[#2a2a2a]">
        <div className="max-w-site mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-4">
          <div className="font-display text-sm text-[#e9e6da] tracking-wider truncate">STREETINTERVIEWVIDEOS</div>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-site mx-auto px-6 lg:px-12 py-10">{children}</main>
    </>
  );
}
