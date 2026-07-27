import Link from 'next/link';
import { asc, desc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { MILESTONE_META, deriveStatus, isOrderCompleted, nextIncomplete } from '@/lib/crm/status';
import { fmtDate, isOverdue } from '@/lib/crm/format';
import { StatusChip } from '@/components/crm/StatusChip';

export const dynamic = 'force-dynamic';

// One row per account: current order, derived status, next milestone + target.
export default async function ClientsPage() {
  const d = db();
  const accounts = await d.select().from(tables.accounts).orderBy(asc(tables.accounts.name));
  const orders = await d.select().from(tables.orders).orderBy(desc(tables.orders.createdAt));
  const milestones = await d.select().from(tables.milestones);

  const byOrder = new Map<string, typeof milestones>();
  for (const m of milestones) {
    const list = byOrder.get(m.orderId) ?? [];
    list.push(m);
    byOrder.set(m.orderId, list);
  }

  const rows = accounts.map((account) => {
    const accountOrders = orders.map((o) => ({ ...o, milestones: byOrder.get(o.id) ?? [] })).filter((o) => o.accountId === account.id);
    const active = accountOrders.filter((o) => !isOrderCompleted(o.milestones));
    // "Current order" = the most recent active one (orders are newest-first).
    const current = active[0] ?? null;
    const next = current ? nextIncomplete(current.milestones) : null;
    return { account, current, next, extraActive: Math.max(0, active.length - 1), totalOrders: accountOrders.length };
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl">Clients</h1>
        <Link href="/clients/new" className="sign-btn-cta text-xs px-4 py-2">
          New Client
        </Link>
      </div>
      <ul className="divide-y divide-[#1f1f1f]">
        {rows.map(({ account, current, next, extraActive, totalOrders }) => (
          <li key={account.id}>
            <Link href={`/clients/${account.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 hover:bg-[#141414] -mx-3 px-3 rounded-lg transition-colors">
              <div className="min-w-0 flex-1 basis-48">
                <div className="text-sm font-semibold text-white break-words">{account.name}</div>
                <div className="text-xs text-[#9ca3af] mt-0.5 break-words">
                  {current ? (
                    <>
                      {current.title}
                      {current.brand ? ` · ${current.brand}` : ''}
                      {extraActive > 0 ? ` (+${extraActive} more)` : ''}
                    </>
                  ) : totalOrders > 0 ? (
                    'All orders completed'
                  ) : (
                    'No orders yet'
                  )}
                </div>
              </div>
              {current && <StatusChip status={deriveStatus(current.milestones)} />}
              <div className="text-xs text-[#9ca3af] basis-full sm:basis-auto">
                {next ? (
                  <>
                    Next: {MILESTONE_META[next.kind].label}
                    {next.targetDate && (
                      <span className={isOverdue(next.targetDate) ? 'text-[#f97316] font-semibold' : ''}> · {fmtDate(next.targetDate)}</span>
                    )}
                  </>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="text-sm text-[#9ca3af]">No clients yet. Add the first one.</p>}
    </div>
  );
}
