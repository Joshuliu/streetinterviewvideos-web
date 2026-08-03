import Link from 'next/link';
import { asc, desc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { deriveStatus, isOrderCompleted, milestoneLabel, nextIncomplete } from '@/lib/crm/status';
import { CLIENT_SECTION_ORDER, type ClientGroup } from '@/lib/crm/clients';
import { daysSinceISO, fmtDate, fmtDateTime, isOverdue } from '@/lib/crm/format';
import { ClientList, type ClientCardView, type ClientGroupSection } from '@/components/crm/ClientList';

export const dynamic = 'force-dynamic';

// One row per account, grouped by whose court the ball is in (lib/crm/clients.ts)
// and searchable. Everything on the row is derived: the current order, its
// status, its next step and the one real deadline that step carries.

export default async function ClientsPage() {
  const d = db();
  const [accounts, orders, milestones, emails] = await Promise.all([
    d.select().from(tables.accounts).orderBy(asc(tables.accounts.name)),
    d.select().from(tables.orders).orderBy(desc(tables.orders.createdAt)),
    d.select().from(tables.milestones),
    d.select({ accountId: tables.loginEmails.accountId, email: tables.loginEmails.email }).from(tables.loginEmails),
  ]);

  const byOrder = new Map<string, typeof milestones>();
  for (const m of milestones) {
    const list = byOrder.get(m.orderId) ?? [];
    list.push(m);
    byOrder.set(m.orderId, list);
  }
  const emailsByAccount = new Map<string, string[]>();
  for (const e of emails) {
    const list = emailsByAccount.get(e.accountId) ?? [];
    list.push(e.email);
    emailsByAccount.set(e.accountId, list);
  }
  const ordersByAccount = new Map<string, typeof orders>();
  for (const o of orders) {
    const list = ordersByAccount.get(o.accountId) ?? [];
    list.push(o);
    ordersByAccount.set(o.accountId, list);
  }

  const rows = accounts.map((account) => {
    const accountOrders = (ordersByAccount.get(account.id) ?? []).map((o) => ({
      ...o,
      milestones: byOrder.get(o.id) ?? [],
    }));
    const active = accountOrders.filter((o) => !isOrderCompleted(o.milestones));
    // "Current order" = the most recent active one (orders are newest-first).
    const current = active[0] ?? null;
    const next = current ? nextIncomplete(current.milestones) : null;
    const extraActive = Math.max(0, active.length - 1);

    let group: ClientGroup;
    let detail: string;
    let overdue = false;
    let sort: number; // ascending within the group

    if (current && next) {
      // A step the CLIENT owns shows on nobody's task board, so this list is
      // the only place that stall is visible — it gets its own section.
      group = next.owner === 'client' ? 'waiting' : 'live';
      overdue = isOverdue(next.targetDate);
      const step = milestoneLabel(next.kind, current.needsProduct);
      const date = next.targetDate;
      // "Overdue Nd" counts from the deadline, not from when the step became
      // next — it says the same thing on a client-owned step as on ours,
      // which is that somebody is actually late.
      detail = !date
        ? `Next: ${step}`
        : overdue
          ? `Overdue ${daysSinceISO(date)}d · ${step}`
          : `Next: ${step} · ${fmtDate(date)}`;
      // Oldest deadline (the longest stall) first; undated steps sort last.
      sort = date ? Date.parse(`${date}T12:00:00Z`) : Number.MAX_SAFE_INTEGER;
    } else {
      group = 'quiet';
      const done = accountOrders
        .flatMap((o) => o.milestones)
        .map((m) => m.completedAt)
        .filter((t): t is Date => !!t)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      detail =
        accountOrders.length === 0 ? 'No orders yet' : done ? `Last activity ${fmtDateTime(done)}` : 'Nothing done yet';
      // Most recent activity first; never-ordered accounts fall to the bottom.
      sort = done ? -done.getTime() : 0;
    }

    const view: ClientCardView & { sort: number } = {
      id: account.id,
      name: account.name,
      company: account.company,
      emails: emailsByAccount.get(account.id) ?? [],
      group,
      line: current
        ? `${current.title}${current.brand ? ` · ${current.brand}` : ''}${extraActive > 0 ? ` (+${extraActive} more)` : ''}`
        : accountOrders.length > 0
          ? `${accountOrders.length} order${accountOrders.length === 1 ? '' : 's'}, all completed`
          : 'No orders yet',
      status: current ? deriveStatus(current.milestones) : accountOrders.length > 0 ? 'Completed' : null,
      detail,
      overdue,
      sort,
    };
    return view;
  });

  const sections: ClientGroupSection[] = CLIENT_SECTION_ORDER.map((group) => ({
    group,
    clients: rows.filter((r) => r.group === group).sort((a, b) => a.sort - b.sort),
  }));
  const quiet = rows.filter((r) => r.group === 'quiet').sort((a, b) => a.sort - b.sort);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl">Clients</h1>
        <Link href="/clients/new" className="sign-btn-cta text-xs px-4 py-2">
          New Client
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">No clients yet. Add the first one.</p>
      ) : (
        <ClientList sections={sections} quiet={quiet} />
      )}
    </div>
  );
}
