import { and, asc, desc, eq, inArray, isNotNull, isNull, max, min } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { MILESTONE_META, DELIVERY_KINDS } from '@/lib/crm/status';
import { addDaysISO, dayLabel, fmtDate, fmtDateTime, isOverdue, todayISO } from '@/lib/crm/format';
import {
  AddTaskInline,
  CompletedMilestoneRow,
  CompletedTaskRow,
  MilestoneTaskRow,
  PersonalTaskRow,
} from '@/components/crm/TaskRows';

export const dynamic = 'force-dynamic';

// My Tasks, shaped like the Notes list Neil already lives in: undated tasks
// on top, then day-of-week groups (tap under a day to add a task there),
// with the next 7 days always present. Completed work folds into a
// collapsible section at the bottom: recoverable, deletable, out of the way.
export default async function MyTasksPage() {
  const session = getAdminSession()!;
  const d = db();

  const [personal, completedTasks, milestoneRows, completedMilestones] = await Promise.all([
    d
      .select()
      .from(tables.tasks)
      .where(and(eq(tables.tasks.owner, session.owner), isNull(tables.tasks.completedAt)))
      .orderBy(asc(tables.tasks.createdAt)),
    d
      .select()
      .from(tables.tasks)
      .where(and(eq(tables.tasks.owner, session.owner), isNotNull(tables.tasks.completedAt)))
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
      .where(and(eq(tables.milestones.owner, session.owner), isNull(tables.milestones.completedAt))),
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

  type Row =
    | { type: 'task'; date: string | null; task: (typeof personal)[number] }
    | { type: 'milestone'; date: string | null; milestone: (typeof milestoneRows)[number] };
  const rows: Row[] = [
    ...personal.map((t) => ({ type: 'task' as const, date: t.dueDate, task: t })),
    ...milestoneRows.map((m) => ({ type: 'milestone' as const, date: m.targetDate, milestone: m })),
  ];

  const undated = rows.filter((r) => r.date === null);
  const today = todayISO();
  const dateSet = new Set<string>(rows.flatMap((r) => (r.date ? [r.date] : [])));
  for (let i = 0; i < 7; i++) dateSet.add(addDaysISO(today, i));
  const dates = Array.from(dateSet).sort();
  const byDate = new Map<string, Row[]>(dates.map((date) => [date, rows.filter((r) => r.date === date)]));

  const renderRow = (row: Row) =>
    row.type === 'task' ? (
      <PersonalTaskRow
        key={row.task.id}
        task={{
          id: row.task.id,
          title: row.task.title,
          dueDate: row.task.dueDate,
          notes: row.task.notes,
          overdue: isOverdue(row.task.dueDate),
        }}
      />
    ) : (
      <MilestoneTaskRow
        key={row.milestone.id}
        milestone={{
          id: row.milestone.id,
          orderId: row.milestone.orderId,
          label: MILESTONE_META[row.milestone.kind].label,
          orderTitle: row.milestone.orderTitle,
          brand: row.milestone.brand || row.milestone.accountName,
          accountId: row.milestone.accountId,
          owner: row.milestone.owner,
          targetDate: row.milestone.targetDate,
          isNext: nextByOrder.get(row.milestone.orderId) === row.milestone.sequence,
          needsLink: DELIVERY_KINDS.has(row.milestone.kind),
        }}
      />
    );

  const completedCount = completedTasks.length + completedMilestones.length;

  return (
    <div className="max-w-2xl pb-24">
      <h1 className="font-display text-3xl mb-4">My Tasks</h1>

      {/* Undated tasks live on top, exactly like the top of the Notes list */}
      <ul>{undated.map(renderRow)}</ul>
      <AddTaskInline date={null} />

      {/* Day groups: every task date, plus the next 7 days ready to fill */}
      {dates.map((date) => {
        const overdue = date < today;
        const isToday = date === today;
        const dayRows = byDate.get(date) ?? [];
        if (overdue && dayRows.length === 0) return null;
        return (
          <section key={date} className="mt-5">
            <h2
              className={`text-sm font-semibold border-b pb-1.5 ${
                overdue
                  ? 'text-[#f97316] border-[#9a3412]'
                  : isToday
                    ? 'text-[#ffc72c] border-[#3a3a3a]'
                    : 'text-[#e9e6da] border-[#2a2a2a]'
              }`}
            >
              {dayLabel(date)} <span className="font-normal opacity-70">{fmtDate(date)}</span>
              {overdue && <span className="ml-2 text-[11px] uppercase tracking-wide">overdue</span>}
            </h2>
            <ul>{dayRows.map(renderRow)}</ul>
            <AddTaskInline date={date} />
          </section>
        );
      })}

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
