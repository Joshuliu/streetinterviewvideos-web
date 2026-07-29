import { getClientSession } from '@/lib/auth/session';
import { StudioOrderView } from '@/components/crm/StudioOrderView';
import { loadStudioData } from './data';

export const dynamic = 'force-dynamic';

// Landing: straight onto the single active order (spec §studio. views 2).
export default async function StudioHomePage() {
  const session = (await getClientSession())!;
  const data = await loadStudioData(session.accountId);

  if (!data || !data.current) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl mb-3">Welcome, {data?.account.name ?? 'there'}</h1>
        <p className="text-sm text-text-400">
          No orders yet. Once your first order kicks off, you’ll track every step of it here.
        </p>
      </div>
    );
  }

  return (
    <StudioOrderView
      brandFallback={data.account.company ?? data.account.name}
      order={data.current}
      milestones={data.current.milestones}
      clientNotes={data.clientNotes}
      otherOrders={data.others}
      onboarding={data.onboarding}
    />
  );
}
