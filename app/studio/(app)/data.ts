import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { deriveStatus, isOrderCompleted } from '@/lib/crm/status';

// Data loader for the studio dashboard. Everything is scoped to the session's
// account: a client can never see another account's data.

export async function loadStudioData(accountId: string, orderId?: string) {
  const d = db();
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, accountId));
  if (!account) return null;

  const orders = await d
    .select()
    .from(tables.orders)
    .where(eq(tables.orders.accountId, accountId))
    .orderBy(desc(tables.orders.createdAt));
  const milestones = orders.length
    ? await d
        .select()
        .from(tables.milestones)
        .where(inArray(tables.milestones.orderId, orders.map((o) => o.id)))
        .orderBy(asc(tables.milestones.sequence))
    : [];
  const clientNotes = await d
    .select()
    .from(tables.notes)
    .where(and(eq(tables.notes.accountId, accountId), eq(tables.notes.clientVisible, true)))
    .orderBy(desc(tables.notes.date), desc(tables.notes.createdAt));

  const withMilestones = orders.map((o) => ({ ...o, milestones: milestones.filter((m) => m.orderId === o.id) }));

  // Default landing order: the most recent active one; if everything is
  // completed (or there are no active orders), the most recent order.
  let current = orderId
    ? withMilestones.find((o) => o.id === orderId) ?? null
    : withMilestones.find((o) => !isOrderCompleted(o.milestones)) ?? withMilestones[0] ?? null;
  if (orderId && !current) return { account, current: null, clientNotes, others: [] };

  const others = withMilestones
    .filter((o) => o.id !== current?.id)
    .map((o) => ({
      order: o,
      status: deriveStatus(o.milestones),
      deliveredLinks: o.milestones
        .filter((m) => m.completedAt && m.deliveredLink)
        .map((m) => ({ label: 'Delivery', href: m.deliveredLink! })),
    }));

  return { account, current, clientNotes, others };
}
