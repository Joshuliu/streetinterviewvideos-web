import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, max, min, or } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { MILESTONE_META, DELIVERY_KINDS } from '@/lib/crm/status';
import { addDaysISO, dayLabel, fmtDate, fmtDateTime, isOverdue, todayISO } from '@/lib/crm/format';
import { BoardGroup, TaskBoard } from '@/components/crm/TaskBoard';
import { CompletedMilestoneRow, CompletedTaskRow } from '@/components/crm/TaskRows';

export const dynamic = 'force-dynamic';

// My Tasks, shaped like the Notes list Neil already lives in: undated tasks
// on top, then day-of-week groups (tap under a day to add a task there, drag
// the handle to reorder or move between days), with the next 7 days always
// present. Completed work folds into a collapsible section at the bottom:
// recoverable, deletable, out of the way.
export default async function MyTasksPage() {
  const session = getAdminSession()!;
  const d = db();
  const today = todayISO();

  const [personal, completedTasks, milestoneRows, completedMilestones] = await Promise.all([
    // Board tasks: open ones, plus completed ones that aren't past their day
    // yet. Those stay crossed out in place (like a paper list) and roll into
    // the Completed box on their own once the day passes.
    d
      .select()
      .from(tables.tasks)
      .where(
        and(
          eq(tables.tasks.owner, session.owner),
          or(
            isNull(tables.tasks.completedAt),
            or(isNull(tables.tasks.dueDate), gte(tables.tasks.dueDate, today)),
          ),
        ),
      )
      .orderBy(asc(tables.tasks.position)),
    // The Completed box: only completions whose day is already over.
    d
      .select()
      .from(tables.tasks)
      .where(
        and(
          eq(tables.tasks.owner, session.owner),
          isNotNull(tables.tasks.completedAt),
          isNotNull(tables.tasks.dueDate),
          lt(tables.tasks.dueDate, today),
        ),
      )
      .orderBy(desc(tables.tasks.completedAt))
      .limit(50),
    d
      .select({
        id: tables.milestones.id,
        kind: tables.milestones.kind,
        sequence: tables.milestones.sequence,
        owner: tables.milestones.owner,
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
      .where(and(eq(tables.milestones.owner, session.owner), isNull(tables.milestones.completedAt)))
      .orderBy(asc(tables.milestones.sequence)),
    d
      .select({
        id: tables.milestones.id,
        kind: tables.milestones.kind,
        sequence: tables.milestones.sequence,
        completedAt: tables.milestones.completedAt,
        orderId: tables.milestones.orderId,
        orderTitle: tables.orders.title,
        accountId: tables.orders.accountId,
      })
      .from(tables.milestones)
      .innerJoin(tables.orders, eq(tables.milestones.orderId, tables.orders.id))
      .where(and(eq(tables.milestones.owner, session.owner), isNotNull(tables.milestones.completedAt)))
      .orderBy(desc(tables.milestones.completedAt))
      .limit(20),
  ]);

  // A milestone can only be checked off when it's the order's next incomplete
  // step (the engine enforces it; the UI signals it).
  const openOrderIds = Array.from(new Set(milestoneRows.map((m) => m.orderId)));
  const nextSeqs = openOrderIds.length
    ? await d
        .select({ orderId: tables.milestones.orderId, minSeq: min(tables.milestones.sequence) })
        .from(tables.milestones)
        .where(and(inArray(tables.milestones.orderId, openOrderIds), isNull(tables.milestones.completedAt)))
        .groupBy(tables.milestones.orderId)
    : [];
  const nextByOrder = new Map(nextSeqs.map((r) => [r.orderId, r.minSeq]));

  // Undo is only safe on the order's LATEST completed milestone, counting
  // completions by either owner.
  const undoOrderIds = Array.from(new Set(completedMilestones.map((m) => m.orderId)));
  const lastDone = undoOrderIds.length
    ? await d
        .select({ orderId: tables.milestones.orderId, maxSeq: max(tables.milestones.sequence) })
        .from(tables.milestones)
        .where(and(inArray(tables.milestones.orderId, undoOrderIds), isNotNull(tables.milestones.completedAt)))
        .groupBy(tables.milestones.orderId)
    : [];
  const lastDoneByOrder = new Map(lastDone.map((r) => [r.orderId, r.maxSeq]));

  const boardTask = (t: (typeof personal)[number]) => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    notes: t.notes,
    overdue: isOverdue(t.dueDate),
    completed: t.completedAt !== null,
  });
  const boardMilestone = (m: (typeof milestoneRows)[number]) => ({
    id: m.id,
    orderId: m.orderId,
    label: MILESTONE_META[m.kind].label,
    orderTitle: m.orderTitle,
    brand: m.brand || m.accountName,
    accountId: m.accountId,
    owner: m.owner,
    targetDate: m.targetDate,
    isNext: nextByOrder.get(m.orderId) === m.sequence,
    needsLink: DELIVERY_KINDS.has(m.kind),
  });

  const dateSet = new Set<string>([
    ...personal.flatMap((t) => (t.dueDate ? [t.dueDate] : [])),
    ...milestoneRows.flatMap((m) => (m.targetDate ? [m.targetDate] : [])),
  ]);
  for (let i = 0; i < 7; i++) dateSet.add(addDaysISO(today, i));

  const groups: BoardGroup[] = [
    {
      date: null,
      label: '',
      sub: '',
      overdue: false,
      isToday: false,
      tasks: personal.filter((t) => !t.dueDate).map(boardTask),
      milestones: milestoneRows.filter((m) => !m.targetDate).map(boardMilestone),
    },
    ...Array.from(dateSet)
      .sort()
      .map((date) => ({
        date,
        label: dayLabel(date),
        sub: fmtDate(date),
        overdue: date < today,
        isToday: date === today,
        tasks: personal.filter((t) => t.dueDate === date).map(boardTask),
        milestones: milestoneRows.filter((m) => m.targetDate === date).map(boardMilestone),
      })),
  ];

  const completedCount = completedTasks.length + completedMilestones.length;

  return (
    <div className="max-w-2xl pb-24">
      <h1 className="font-display text-3xl mb-4">My Tasks</h1>

      <TaskBoard groups={groups} />

      {/* Completed: folded away so the list never scrolls past old work */}
      {completedCount > 0 && (
        <details className="mt-10 rounded-xl bg-[#141414] border border-[#1f1f1f] px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#9ca3af] select-none">
            Completed ({completedCount})
          </summary>
          <ul className="mt-2 divide-y divide-[#1f1f1f]">
            {completedTasks.map((t) => (
              <CompletedTaskRow key={t.id} task={{ id: t.id, title: t.title, when: fmtDateTime(t.completedAt) }} />
            ))}
            {completedMilestones.map((m) => (
              <CompletedMilestoneRow
                key={m.id}
                milestone={{
                  orderId: m.orderId,
                  accountId: m.accountId,
                  label: MILESTONE_META[m.kind].label,
                  orderTitle: m.orderTitle,
                  when: fmtDateTime(m.completedAt),
                  canUndo: lastDoneByOrder.get(m.orderId) === m.sequence,
                }}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
