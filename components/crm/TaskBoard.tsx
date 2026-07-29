'use client';

import { Fragment, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BoardRef, moveBoardItem } from '@/app/team/(app)/actions';
import { AddTaskInline, MeetingTaskRow, MilestoneTaskRow, PersonalTaskRow } from './TaskRows';

// The draggable day-grouped task list. Drag is pointer-event based (not HTML5
// drag-and-drop) because iOS Safari has no touch support for the latter, and
// this list's primary home is an iPhone home-screen web app. The handle sets
// touch-action: none so dragging never fights page scroll.

export interface BoardTask {
  id: string;
  title: string;
  dueDate: string | null;
  notes: string;
  overdue: boolean;
  completed: boolean;
}

export interface BoardMilestone {
  id: string;
  orderId: string;
  label: string;
  orderTitle: string;
  brand: string;
  accountId: string;
  owner: string;
  targetDate: string | null;
  isNext: boolean;
  needsLink: boolean;
}

// A booked sales call derived from a lead. Not checkable (it checks itself an
// hour after the start) but it IS draggable within its day, because a day
// reads better when the calls sit where the work around them actually falls.
export interface BoardMeeting {
  id: string; // lead id
  name: string;
  company: string;
  time: string | null; // null = booked but the time didn't sync
  done: boolean; // an hour past start: shown checked off, still tappable
}

// A day is one merged list. Every row carries a position from the same number
// space (tasks.position / milestones.position / leads.position), so a drop can
// land between any two rows regardless of kind.
export type BoardItem =
  | { kind: 'meeting'; id: string; position: number; meeting: BoardMeeting }
  | { kind: 'task'; id: string; position: number; task: BoardTask }
  | { kind: 'milestone'; id: string; position: number; milestone: BoardMilestone };

export interface BoardGroup {
  date: string | null; // null = the undated section at the top
  label: string;
  sub: string;
  overdue: boolean;
  isToday: boolean;
  items: BoardItem[];
}

interface DragState {
  kind: BoardItem['kind'];
  id: string;
  title: string;
  fromDate: string | null;
  y: number;
  target: { groupIdx: number; itemIdx: number } | null;
}

/**
 * Which days a row may be dropped on:
 * - task: anywhere, including the undated section.
 * - milestone: any real day. Its target date is client-visible, and "no day"
 *   isn't a state the client tracker can show.
 * - meeting: its own day only. The day comes from the Calendly booking, so
 *   dragging one onto another day would quietly disagree with the calendar;
 *   rescheduling happens on the lead.
 */
function canDropOn(kind: BoardItem['kind'], fromDate: string | null, group: BoardGroup): boolean {
  if (kind === 'milestone') return group.date !== null;
  if (kind === 'meeting') return group.date === fromDate;
  return true;
}

export function TaskBoard({ groups }: { groups: BoardGroup[] }) {
  const [local, setLocal] = useState(groups);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setLocal(groups), [groups]);

  function computeTarget(clientY: number, cur: DragState): DragState['target'] {
    const container = containerRef.current;
    if (!container) return null;
    const sections = [...container.querySelectorAll<HTMLElement>('[data-gidx]')];
    let best: { gidx: number; dist: number; el: HTMLElement } | null = null;
    for (const el of sections) {
      const gidx = Number(el.dataset.gidx);
      const group = local[gidx];
      if (!group || !canDropOn(cur.kind, cur.fromDate, group)) continue;
      const r = el.getBoundingClientRect();
      const dist = clientY < r.top ? r.top - clientY : clientY > r.bottom ? clientY - r.bottom : 0;
      if (!best || dist < best.dist) best = { gidx, dist, el };
    }
    if (!best) return null;
    const rows = [...best.el.querySelectorAll<HTMLElement>('[data-row-kind]')].filter((r) => r.dataset.rowId !== cur.id);
    let idx = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    return { groupIdx: best.gidx, itemIdx: idx };
  }

  function startDrag(e: React.PointerEvent, kind: BoardItem['kind'], id: string, title: string, fromDate: string | null) {
    e.preventDefault();
    const state: DragState = { kind, id, title, fromDate, y: e.clientY, target: null };
    dragRef.current = state;
    setDrag(state);
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      if (ev.clientY < 110) window.scrollBy(0, -14);
      else if (ev.clientY > window.innerHeight - 110) window.scrollBy(0, 14);
      const target = computeTarget(ev.clientY, dragRef.current!);
      const next = { ...dragRef.current!, y: ev.clientY, target };
      dragRef.current = next;
      setDrag(next);
    };
    const finish = (commit: boolean) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.body.style.userSelect = '';
      const cur = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (commit && cur?.target) commitDrop(cur);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function commitDrop(cur: DragState) {
    const { groupIdx, itemIdx } = cur.target!;
    const group = local[groupIdx];
    if (!group) return;

    const oldIdx = group.items.findIndex((i) => i.id === cur.id);
    // Dropped back into the slot it came from.
    if (oldIdx !== -1 && group.date === cur.fromDate && itemIdx === oldIdx) return;

    const remaining = group.items.filter((i) => i.id !== cur.id);
    const ref = (i: BoardItem | undefined): BoardRef | null => (i ? { kind: i.kind, id: i.id } : null);
    const before = ref(remaining[itemIdx - 1]);
    const after = ref(remaining[itemIdx]);

    // Optimistic: pull the row out of its old day and splice it into the new
    // slot, so the list settles under the finger before the server answers.
    setLocal((prev) => {
      const next = prev.map((g) => ({ ...g, items: [...g.items] }));
      const from = next.find((g) => g.items.some((i) => i.id === cur.id));
      const item = from?.items.find((i) => i.id === cur.id);
      if (!from || !item) return prev;
      from.items = from.items.filter((i) => i.id !== cur.id);
      const dest = next[groupIdx];
      const moved =
        item.kind === 'task'
          ? { ...item, task: { ...item.task, dueDate: dest.date } }
          : item.kind === 'milestone'
            ? { ...item, milestone: { ...item.milestone, targetDate: dest.date } }
            : item;
      const insertAt = Math.min(itemIdx, dest.items.length);
      dest.items = [...dest.items.slice(0, insertAt), moved, ...dest.items.slice(insertAt)];
      return next;
    });

    startTransition(async () => {
      const res = await moveBoardItem({ kind: cur.kind, id: cur.id }, group.date, before, after);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  const handle = (item: BoardItem, fromDate: string | null) => (
    <button
      onPointerDown={(e) => startDrag(e, item.kind, item.id, rowTitle(item), fromDate)}
      aria-label="Drag to move"
      className="shrink-0 -mr-1 h-6 px-2 flex items-center text-[#3a3a3a] hover:text-[#6b6b6b] cursor-grab select-none touch-none text-sm leading-none"
    >
      ⠿
    </button>
  );

  const dropLine = <li aria-hidden className="list-none h-0.5 bg-[#f97316] rounded-pill my-1" />;

  // Should the drop indicator render just above the item at render-index i?
  // target.itemIdx counts slots among the group's items EXCLUDING the one
  // being dragged, so map the render index into that space.
  function insertIdxFor(cur: DragState, group: BoardGroup, i: number): boolean {
    if (!cur.target) return false;
    if (group.items[i].id === cur.id) return false;
    let visibleBefore = 0;
    for (let j = 0; j < i; j++) if (group.items[j].id !== cur.id) visibleBefore++;
    return visibleBefore === cur.target.itemIdx;
  }

  return (
    <div ref={containerRef} className={drag ? 'cursor-grabbing' : ''}>
      {local.map((group, gidx) => {
        const isTarget = drag?.target?.groupIdx === gidx;
        if (group.date !== null && group.overdue && group.items.length === 0) return null;
        // A past day only reads as overdue while something in it is still
        // open. Yesterday's finished list gets the plain header instead of the
        // orange "overdue" one.
        const stillOpen = group.items.some((i) =>
          i.kind === 'task' ? !i.task.completed : i.kind === 'meeting' ? !i.meeting.done : true,
        );
        const overdue = group.overdue && stillOpen;
        return (
          <section
            key={group.date ?? 'undated'}
            data-gidx={gidx}
            className={`${group.date === null ? '' : 'mt-5'}`}
          >
            {group.date !== null && (
              <h2
                className={`text-sm font-semibold border-b pb-1.5 ${
                  overdue
                    ? 'text-[#f97316] border-[#9a3412]'
                    : group.isToday
                      ? 'text-[#ffc72c] border-[#3a3a3a]'
                      : 'text-[#e9e6da] border-[#2a2a2a]'
                }`}
              >
                {group.label} <span className="font-normal opacity-70">{group.sub}</span>
                {overdue && <span className="ml-2 text-[11px] uppercase tracking-wide">overdue</span>}
              </h2>
            )}
            <ul>
              {group.items.map((item, i) => (
                <Fragment key={item.id}>
                  {isTarget && insertIdxFor(drag!, group, i) && dropLine}
                  {item.kind === 'meeting' ? (
                    <MeetingTaskRow
                      meeting={item.meeting}
                      dimmed={drag?.id === item.id}
                      dragHandle={handle(item, group.date)}
                      dataAttrs={{ 'data-row-kind': 'meeting', 'data-row-id': item.id }}
                    />
                  ) : item.kind === 'task' ? (
                    <PersonalTaskRow
                      task={item.task}
                      dimmed={drag?.id === item.id}
                      dragHandle={handle(item, group.date)}
                      dataAttrs={{ 'data-row-kind': 'task', 'data-row-id': item.id }}
                    />
                  ) : (
                    <MilestoneTaskRow
                      milestone={item.milestone}
                      dimmed={drag?.id === item.id}
                      dragHandle={handle(item, group.date)}
                      dataAttrs={{ 'data-row-kind': 'milestone', 'data-row-id': item.id }}
                    />
                  )}
                </Fragment>
              ))}
              {isTarget && drag!.target!.itemIdx === group.items.filter((i) => i.id !== drag!.id).length && dropLine}
            </ul>
            <AddTaskInline date={group.date} />
          </section>
        );
      })}

      {/* Floating ghost of the dragged row */}
      {drag && (
        <div
          className="fixed left-4 right-4 z-50 pointer-events-none rounded-xl bg-[#1a1a1a] border border-[#f97316] px-4 py-2.5 text-sm text-white shadow-2xl"
          style={{ top: drag.y + 10 }}
        >
          {drag.title}
        </div>
      )}
    </div>
  );
}

function rowTitle(item: BoardItem): string {
  if (item.kind === 'task') return item.task.title;
  if (item.kind === 'milestone') return item.milestone.label;
  return `Take the meeting with ${item.meeting.name}`;
}
