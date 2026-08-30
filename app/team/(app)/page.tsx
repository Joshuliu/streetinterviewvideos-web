import { and, asc, desc, eq, gte, isNotNull, isNull, lt, ne, or, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { addDaysISO, dateISO, dayLabel, dayStart, fmtDate, fmtDateTime, fmtTime, isOverdue, todayISO } from '@/lib/crm/format';
import { outsideAttendees } from '@/lib/crm/calendar';
import { BoardGroup, BoardItem, TaskBoard } from '@/components/crm/TaskBoard';
import { CompletedTaskRow } from '@/components/crm/TaskRows';

export const dynamic = 'force-dynamic';

// My Tasks, shaped like the Notes list Neil already lives in: undated tasks
// on top, then day-of-week groups (tap under a day to add a task there, drag
// the handle to reorder or move between days), with the next 7 days always
// present. Completed work folds into a collapsible section at the bottom:
// recoverable, deletable, out of the way. Since 2026-08-30 the board is
// personal tasks + calendar meetings only — the milestone pipeline is gone.
export default async function MyTasksPage() {
  const session = getAdminSession()!;
  const d = db();
  const today = todayISO();
  // Checked work stays on the board through the end of the following day, so
  // yesterday's section still reads as a list of what got finished. It only
  // folds into the Completed box once that grace day is over.
  const yesterday = addDaysISO(today, -1);
  const yesterdayStart = dayStart(yesterday);

  const [personal, completedTasks, meetingLeads] = await Promise.all([
    // Board tasks: open ones, plus completed ones still inside the grace
    // window — either their day is today/yesterday, or they were checked off
    // today/yesterday (so clearing an old overdue task doesn't make it vanish
    // out from under the tap). Those stay crossed out in place, like a paper
    // list, and roll into the Completed box on their own.
    d
      .select()
      .from(tables.tasks)
      .where(
        and(
          eq(tables.tasks.owner, session.owner),
          or(
            isNull(tables.tasks.completedAt),
            isNull(tables.tasks.dueDate),
            gte(tables.tasks.dueDate, yesterday),
            gte(tables.tasks.completedAt, yesterdayStart),
          ),
        ),
      )
      .orderBy(asc(tables.tasks.position)),
    // The Completed box: the exact complement of the board query above.
    d
      .select()
      .from(tables.tasks)
      .where(
        and(
          eq(tables.tasks.owner, session.owner),
          isNotNull(tables.tasks.completedAt),
          isNotNull(tables.tasks.dueDate),
          lt(tables.tasks.dueDate, yesterday),
          lt(tables.tasks.completedAt, yesterdayStart),
        ),
      )
      .orderBy(desc(tables.tasks.completedAt))
      .limit(50),
    // Calls come from the admin's own Google Calendar (lib/crm/calendar.ts).
    // Both admins get their own; a joint call is ONE row carrying both
    // owners, so it appears once on each board rather than twice on either.
    // Matched rows link through to the lead or client; unmatched ones
    // (someone new, or a vendor selling to us) render with the calendar's
    // own title and no link.
    d
      .select({
        id: tables.calendarEvents.id,
        owners: tables.calendarEvents.owners,
        summary: tables.calendarEvents.summary,
        startAt: tables.calendarEvents.startAt,
        allDay: tables.calendarEvents.allDay,
        meetingUrl: tables.calendarEvents.meetingUrl,
        attendees: tables.calendarEvents.attendees,
        position: tables.calendarEvents.position,
        leadId: tables.calendarEvents.leadId,
        eventAccountId: tables.calendarEvents.accountId,
        leadName: tables.leads.name,
        leadEmail: tables.leads.email,
        leadCompany: tables.leads.company,
        leadConvertedAccountId: tables.leads.convertedAccountId,
      })
      .from(tables.calendarEvents)
      .leftJoin(tables.leads, eq(tables.calendarEvents.leadId, tables.leads.id))
      .where(
        and(
          ne(tables.calendarEvents.status, 'cancelled'),
          sql`${session.owner} = any(${tables.calendarEvents.owners})`,
        ),
      )
      .orderBy(asc(tables.calendarEvents.startAt)),
  ]);

  const boardTask = (t: (typeof personal)[number]): BoardItem => ({
    kind: 'task',
    id: t.id,
    position: t.position,
    task: {
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      notes: t.notes,
      overdue: isOverdue(t.dueDate),
      completed: t.completedAt !== null,
    },
  });

  // Meetings ride the same grace window as checked tasks: yesterday's calls
  // stay on the board (crossed out, part of yesterday's finished list) and
  // drop off the day after. Within the day, a meeting reads as done (green
  // check, crossed out, still tappable) once it's an hour past its start.
  const now = Date.now();
  const meetings = meetingLeads
    .map((l) => {
      // An all-day event arrives from Google as a bare "2026-08-03", which we
      // parsed to UTC midnight. Running that through dateISO() converts it to
      // the business timezone and lands it on Aug 2 — a day early, every time.
      // Its calendar day is already the date Google gave, so read it straight
      // back off the UTC parts instead of converting.
      const date = l.startAt ? (l.allDay ? l.startAt.toISOString().slice(0, 10) : dateISO(l.startAt)) : null;
      return {
      date,
      item: {
        kind: 'meeting' as const,
        id: l.id,
        position: l.position,
        meeting: {
          id: l.id,
          // Once they're a client, the row opens the client page — that's
          // where their notes and orders are. An account matched directly (no
          // lead behind it) goes straight there too. Unmatched stays null and
          // renders as plain text.
          // Straight to #notes, not the top of the page: opening a call is
          // what you do AT call time, and notes are what you need in front of
          // you then.
          href:
            l.leadConvertedAccountId || l.eventAccountId
              ? `/clients/${l.leadConvertedAccountId ?? l.eventAccountId}#notes`
              : l.leadId
                ? `/leads/${l.leadId}#notes`
                : null,
          meetingUrl: l.meetingUrl,
          guests: outsideAttendees(l.attendees),
          // A matched row reads as the person, which is how the rest of the
          // CRM names them; an unmatched one falls back to the calendar's own
          // title, which is all we know about it.
          name: l.leadName || l.leadEmail || l.summary || '(untitled event)',
          company: l.leadCompany ?? '',
          time: l.allDay ? null : l.startAt ? fmtTime(l.startAt) : null,
          // A timed call reads as done an hour past its start. An all-day
          // event has no such moment, so it stays live until its day is over
          // — checking it off at 1am would be nonsense.
          done: l.allDay
            ? date !== null && date < today
            : l.startAt !== null && now > l.startAt.getTime() + 60 * 60 * 1000,
        },
      },
      };
    })
    .filter((m) => m.date === null || m.date >= yesterday);

  const dateSet = new Set<string>([
    ...personal.flatMap((t) => (t.dueDate ? [t.dueDate] : [])),
    ...meetings.flatMap((m) => (m.date ? [m.date] : [])),
  ]);
  for (let i = 0; i < 7; i++) dateSet.add(addDaysISO(today, i));

  // One merged, hand-sortable list per day: meetings and personal tasks share
  // a single `position` number space, so a row can be dragged anywhere among
  // the others. Ties (rows created in the same second) break by kind then id
  // purely so the order never flickers between renders.
  const KIND_RANK = { meeting: 0, task: 1 };
  const itemsFor = (date: string | null): BoardItem[] =>
    [
      ...meetings.filter((m) => m.date === date).map((m) => m.item),
      ...personal.filter((t) => (t.dueDate ?? null) === date).map(boardTask),
    ].sort(
      (a, b) =>
        a.position - b.position || KIND_RANK[a.kind] - KIND_RANK[b.kind] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );

  const groups: BoardGroup[] = [
    { date: null, label: '', sub: '', overdue: false, isToday: false, items: itemsFor(null) },
    ...Array.from(dateSet)
      .sort()
      .map((date) => ({
        date,
        label: dayLabel(date),
        sub: fmtDate(date),
        overdue: date < today,
        isToday: date === today,
        items: itemsFor(date),
      })),
  ];

  return (
    <div className="max-w-2xl pb-24">
      <h1 className="font-display text-3xl mb-4">My Tasks</h1>

      <TaskBoard groups={groups} />

      {/* Completed: folded away so the list never scrolls past old work */}
      {completedTasks.length > 0 && (
        <details className="mt-10 rounded-xl bg-[var(--crm-inset)] border border-[var(--crm-divide)] px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--crm-muted)] select-none">
            Completed ({completedTasks.length})
          </summary>
          <ul className="mt-2 divide-y divide-[var(--crm-divide)]">
            {completedTasks.map((t) => (
              <CompletedTaskRow key={t.id} task={{ id: t.id, title: t.title, when: fmtDateTime(t.completedAt) }} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
