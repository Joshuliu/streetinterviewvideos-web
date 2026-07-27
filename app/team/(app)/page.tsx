import { and, eq, inArray, isNull, min } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { MILESTONE_META, DELIVERY_KINDS } from '@/lib/crm/status';
import { fmtDate, isOverdue } from '@/lib/crm/format';
import { AddTaskForm, MilestoneTaskRow, PersonalTaskRow } from '@/components/crm/TaskRows';

export const dynamic = 'force-dynamic';

// My tasks: personal tasks + my milestone tasks, merged, sorted by due/target
// date. Completed rows vanish (soft-hidden server-side).
export default async function MyTasksPage() {
  const session = getAdminSession()!;
  const d = db();

  const personal = await d
    .select()
    .from(tables.tasks)
    .where(and(eq(tables.tasks.owner, session.owner), isNull(tables.tasks.completedAt)));

  const milestoneRows = await d
    .select({
      id: tables.milestones.id,
      kind: tables.milestones.kind,
      sequence: tables.milestones.sequence,
      targetDate: tables.milestones.targetDate,
      orderId: tables.milestones.orderId,
      orderTitle: tables.orders.title,
      brand: tables.orders.brand,
      accountId: tables.orders.accountId,
      accountName: tables.accounts.name,
    })
    .from(tables.milestones)
    .innerJoin(tables.orders, eq(tables.milestones.orderId, tables.orders.id))
    .innerJoin(tables.accounts, eq(tables.orders.accountId, tables.accounts.id))
    .where(and(eq(tables.milestones.owner, session.owner), isNull(tables.milestones.completedAt)));

  // A milestone is actionable only if it's the order's next incomplete one
  // (regardless of owner) — the engine enforces this; the UI signals it.
  const orderIds = Array.from(new Set(milestoneRows.map((m) => m.orderId)));
  const nextSeqs = orderIds.length
    ? await d
        .select({ orderId: tables.milestones.orderId, minSeq: min(tables.milestones.sequence) })
        .from(tables.milestones)
        .where(and(inArray(tables.milestones.orderId, orderIds), isNull(tables.milestones.completedAt)))
        .groupBy(tables.milestones.orderId)
    : [];
  const nextByOrder = new Map(nextSeqs.map((r) => [r.orderId, r.minSeq]));

  type Row =
    | { type: 'task'; date: string | null; task: (typeof personal)[number] }
    | { type: 'milestone'; date: string | null; milestone: (typeof milestoneRows)[number] };

  const rows: Row[] = [
    ...personal.map((t) => ({ type: 'task' as const, date: t.dueDate, task: t })),
    ...milestoneRows.map((m) => ({ type: 'milestone' as const, date: m.targetDate, milestone: m })),
  ].sort((a, b) => {
    if (a.date === b.date) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date < b.date ? -1 : 1;
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-6">My Tasks</h1>
      <AddTaskForm />
      <ul className="mt-4">
        {rows.map((row) =>
          row.type === 'task' ? (
            <PersonalTaskRow
              key={row.task.id}
              task={{
                id: row.task.id,
                title: row.task.title,
                dueDate: row.task.dueDate,
                notes: row.task.notes,
                dueLabel: row.task.dueDate ? `Due ${fmtDate(row.task.dueDate)}` : 'No due date',
                overdue: isOverdue(row.task.dueDate),
              }}
            />
          ) : (
            <MilestoneTaskRow
              key={row.milestone.id}
              milestone={{
                id: row.milestone.id,
                label: MILESTONE_META[row.milestone.kind].label,
                orderTitle: row.milestone.orderTitle,
                brand: row.milestone.brand || row.milestone.accountName,
                accountId: row.milestone.accountId,
                isNext: nextByOrder.get(row.milestone.orderId) === row.milestone.sequence,
                needsLink: DELIVERY_KINDS.has(row.milestone.kind),
                dueLabel: row.milestone.targetDate ? `Target ${fmtDate(row.milestone.targetDate)}` : 'No target date',
                overdue: isOverdue(row.milestone.targetDate),
              }}
            />
          ),
        )}
      </ul>
      {rows.length === 0 && <p className="mt-6 text-sm text-[#9ca3af]">Nothing on your list. Enjoy it while it lasts.</p>}
    </div>
  );
}
