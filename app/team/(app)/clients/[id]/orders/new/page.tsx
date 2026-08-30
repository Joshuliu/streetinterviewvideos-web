import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { todayISO } from '@/lib/crm/format';
import { NewOrderForm } from '@/components/crm/ClientForms';

export const dynamic = 'force-dynamic';

// New order: title, brand, placed date, status and notes. That's the whole
// record since the 2026-08-30 simplification — no milestones.
export default async function NewOrderPage({ params }: { params: { id: string } }) {
  const [account] = await db().select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-1">New Order</h1>
      <p className="text-sm text-[var(--crm-muted)] mb-6">
        for {account.name}
        {account.company ? ` (${account.company})` : ''}
      </p>
      <NewOrderForm accountId={account.id} defaultBrand={account.company ?? ''} today={todayISO()} />
    </div>
  );
}
