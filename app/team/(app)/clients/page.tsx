import Link from 'next/link';
import { asc, desc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { type ClientGroup } from '@/lib/crm/clients';
import { dateISO, fmtDate } from '@/lib/crm/format';
import { ClientList, type ClientCardView, type ClientGroupSection } from '@/components/crm/ClientList';

export const dynamic = 'force-dynamic';

// One row per account, grouped by whether anything is ongoing
// (lib/crm/clients.ts) and searchable. The status chip shows the current
// order's stored status; there are no deadlines any more.

export default async function ClientsPage() {
  const d = db();
  const [accounts, orders] = await Promise.all([
    d.select().from(tables.accounts).orderBy(asc(tables.accounts.name)),
    d.select().from(tables.orders).orderBy(desc(tables.orders.createdAt)),
  ]);

  const ordersByAccount = new Map<string, typeof orders>();
  for (const o of orders) {
    const list = ordersByAccount.get(o.accountId) ?? [];
    list.push(o);
    ordersByAccount.set(o.accountId, list);
  }

  const rows = accounts.map((account) => {
    const accountOrders = ordersByAccount.get(account.id) ?? [];
    const ongoing = accountOrders.filter((o) => o.status === 'ongoing');
    // "Current order" = the most recent ongoing one (orders are newest-first).
    const current = ongoing[0] ?? null;
    const extraOngoing = Math.max(0, ongoing.length - 1);
    const latest = accountOrders[0] ?? null;

    const group: ClientGroup = current ? 'live' : 'quiet';
    const detail = current
      ? `Started ${fmtDate(dateISO(current.createdAt))}`
      : latest
        ? `Last order ${fmtDate(dateISO(latest.createdAt))}`
        : 'No orders yet';

    const view: ClientCardView = {
      id: account.id,
      name: account.name,
      company: account.company,
      group,
      line: current
        ? `${current.title}${current.brand ? ` · ${current.brand}` : ''}${extraOngoing > 0 ? ` (+${extraOngoing} more)` : ''}`
        : latest
          ? `${accountOrders.length} order${accountOrders.length === 1 ? '' : 's'}, nothing ongoing`
          : 'No orders yet',
      status: current?.status ?? latest?.status ?? null,
      detail,
      // Most recent activity first; never-ordered accounts fall to the bottom.
      activityMs: latest?.createdAt.getTime() ?? 0,
    };
    return view;
  });

  const sections: ClientGroupSection[] = [
    { group: 'live', clients: rows.filter((r) => r.group === 'live') },
  ];
  const quiet = rows.filter((r) => r.group === 'quiet');

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl">Clients</h1>
        <Link href="/clients/new" className="sign-btn-cta text-xs px-4 py-2">
          New Client
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--crm-muted)]">No clients yet. Add the first one.</p>
      ) : (
        <ClientList sections={sections} quiet={quiet} />
      )}
    </div>
  );
}
