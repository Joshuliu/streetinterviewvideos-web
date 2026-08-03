import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/crm/LoginForm';
import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default function TeamLoginPage() {
  if (getAdminSession()) redirect('/');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="font-display text-sm text-[var(--crm-strong)] tracking-wider mb-8">STREETINTERVIEWVIDEOS · TEAM</div>
      <LoginForm subtitle="Team access only." />
    </div>
  );
}
