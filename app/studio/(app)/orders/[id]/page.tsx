import { notFound } from 'next/navigation';
import { getClientSession } from '@/lib/auth/session';
import { StudioOrderView } from '@/components/crm/StudioOrderView';
import { loadStudioData } from '../../data';

export const dynamic = 'force-dynamic';

// A specific order: only reachable for orders on the session's own account.
export default async function StudioOrderPage({ params }: { params: { id: string } }) {
  const session = (await getClientSession())!;
  const data = await loadStudioData(session.accountId, params.id);
  if (!data || !data.current) notFound();

  return (
    <StudioOrderView
      brandFallback={data.account.company ?? data.account.name}
      order={data.current}
      milestones={data.current.milestones}
      clientNotes={data.clientNotes}
      otherOrders={data.others}
    />
  );
}
