import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { MILESTONE_META, defaultMilestones } from '@/lib/crm/status';
import { NewOrderForm } from '@/components/crm/ClientForms';

export const dynamic = 'force-dynamic';

// New order: the 5-milestone template with owners and target dates pre-filled
// from the defaults, editable before saving (spec §team. views 4).
export default async function NewOrderPage({ params }: { params: { id: string } }) {
  const [account] = await db().select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();
  const defaults = defaultMilestones().map((m) => ({
    kind: m.kind,
    label: MILESTONE_META[m.kind].label,
    owner: m.owner,
    targetDate: m.targetDate,
  }));

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-1">New Order</h1>
      <p className="text-sm text-[#9ca3af] mb-6">for {account.name}</p>
      <NewOrderForm accountId={account.id} accountName={account.name} defaults={defaults} />
    </div>
  );
}
