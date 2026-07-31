import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { GAP_DAYS, defaultMilestones, milestoneLabel } from '@/lib/crm/status';
import { todayISO } from '@/lib/crm/format';
import { NewOrderForm } from '@/components/crm/ClientForms';

export const dynamic = 'force-dynamic';

// New order: the milestone template with owners pre-filled and ONE editable
// deadline — the first step's (spec §team. views 4). The rest are projected.
export default async function NewOrderPage({ params }: { params: { id: string } }) {
  const [account] = await db().select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();
  const defaults = defaultMilestones().map((m) => ({
    kind: m.kind,
    label: milestoneLabel(m.kind),
    // The one label that depends on the order: swapped live by the checkbox.
    labelNoProduct: milestoneLabel(m.kind, false),
    owner: m.owner,
    gapDays: GAP_DAYS[m.kind],
    targetDate: m.targetDate,
  }));

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-1">New Order</h1>
      <p className="text-sm text-[#9ca3af] mb-6">
        for {account.name}
        {account.company ? ` (${account.company})` : ''}
      </p>
      <NewOrderForm accountId={account.id} defaultBrand={account.company ?? ''} today={todayISO()} defaults={defaults} />
    </div>
  );
}
