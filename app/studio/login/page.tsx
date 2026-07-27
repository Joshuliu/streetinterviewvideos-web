import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/crm/LoginForm';
import { getClientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function StudioLoginPage() {
  if (await getClientSession()) redirect('/');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="font-display text-sm text-[#e9e6da] tracking-wider mb-8">STREETINTERVIEWVIDEOS · STUDIO</div>
      <LoginForm subtitle="Client access: enter the email on your account." />
    </div>
  );
}
