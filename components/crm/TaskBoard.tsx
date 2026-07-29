'use client';

import { Fragment, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { moveMilestone, moveTask } from '@/app/team/(app)/actions';
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

// A booked sales call derived from a lead — read-only on the board (not
// draggable, not checkable); it moves or disappears when the lead changes.
export interface BoardMeeting {
  id: string; // lead id
  name: string;
  company: string;
  time: string | null; // null = booked but the time didn't sync
}

export interface BoardGroup {
  date: string | null; // null = the undated section at the top
  label: string;
  sub: string;
  overdue: boolean;
  isToday: boolean;
  meetings: BoardMeeting[];
  tasks: BoardTask[];
  milestones: BoardMilestone[];
}

interface DragState {
  kind: 'task' | 'milestone';
  id: string;
  title: string;
  fromDate: string | null;
  y: number;
  // For tasks: insertion slot among the group's tasks. For milestones: the
  // group itself (only the date changes).
  target: { groupIdx: number; taskIdx: number } | null;
}

export function TaskBoard({ groups }: { groups: BoardGroup[] }) {
  const [local, setLocal] = useState(groups);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setLocal(groups), [groups]);

  function computeTarget(clientY: number, kind: 'task' | 'milestone'): DragState['target'] {
    const container = containerRef.current;
    if (!container) return null;
    const sections = [...container.querySelectorAll<HTMLElement>('[data-gidx]')];
    let best: { gidx: number; dist: number; el: HTMLElement } | null = null;
    for (const el of sections) {
      const gidx = Number(el.dataset.gidx);
      if (kind === 'milestone' && local[gidx]?.date === null) continue;
      const r = el.getBoundingClientRect();
      const dist = clientY < r.top ? r.top - clientY : clientY > r.bottom ? clientY - r.bottom : 0;
      if (!best || dist < best.dist) best = { gidx, dist, el };
    }
    if (!best) return null;
    if (kind === 'milestone') return { groupIdx: best.gidx, taskIdx: 0 };
    const rows = [...best.el.querySelectorAll<HTMLElement>('[data-row-kind="task"]')].filter(
      (r) => r.dataset.rowId !== dragRef.current?.id,
    );
    let idx = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    return { groupIdx: best.gidx, taskIdx: idx };
  }

  function startDrag(e: React.PointerEvent, kind: 'task' | 'milestone', id: string, title: string, fromDate: string | null) {
    e.preventDefault();
    const state: DragState = { kind, id, title, fromDate, y: e.clientY, target: null };
    dragRef.current = state;
    setDrag(state);
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      if (ev.clientY < 110) window.scrollBy(0, -14);
      else if (ev.clientY > window.innerHeight - 110) window.scrollBy(0, 14);
      const target = computeTarget(ev.clientY, kind);
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
    const { groupIdx, taskIdx } = cur.target!;
    const group = local[groupIdx];
    if (!group) return;

    if (cur.kind === 'milestone') {
      if (!group.date || group.date === cur.fromDate) return;
      // Optimistic: move the milestone card into its new day.
      setLocal((prev) => {
        const next = prev.map((g) => ({ ...g, tasks: [...g.tasks], milestones: [...g.milestones] }));
        const from = next.find((g) => g.milestones.some((m) => m.id === cur.id));
        const ms = from?.milestones.find((m) => m.id === cur.id);
        if (!from || !ms) return prev;
        from.milestones = from.milestones.filter((m) => m.id !== cur.id);
        next[groupIdx].milestones = [...next[groupIdx].milestones, { ...ms, targetDate: group.date }];
        return next;
      });
      startTransition(async () => {
        const res = await moveMilestone(cur.id, group.date!);
        if (!res.ok) alert(res.error);
        router.refresh();
      });
      return;
    }

    const remaining = group.tasks.filter((t) => t.id !== cur.id);
    const before = remaining[taskIdx - 1]?.id ?? null;
    const after = remaining[taskIdx]?.id ?? null;
    const sameGroup = group.tasks.some((t) => t.id === cur.id);
    const oldIdx = group.tasks.findIndex((t) => t.id === cur.id);
    if (sameGroup && (oldIdx === taskIdx || oldIdx === taskIdx - 1) && group.date === cur.fromDate) {
      // Dropped back where it started.
      const noNeighborChange = remaining.length === group.tasks.length - 1;
      if (noNeighborChange && oldIdx === taskIdx) return;
    }

    setLocal((prev) => {
      const next = prev.map((g) => ({ ...g, tasks: [...g.tasks], milestones: [...g.milestones] }));
      const from = next.find((g) => g.tasks.some((t) => t.id === cur.id));
      const task = from?.tasks.find((t) => t.id === cur.id);
      if (!from || !task) return prev;
      from.tasks = from.tasks.filter((t) => t.id !== cur.id);
      const dest = next[groupIdx];
      const insertAt = Math.min(taskIdx, dest.tasks.length);
      dest.tasks = [...dest.tasks.slice(0, insertAt), { ...task, dueDate: dest.date }, ...dest.tasks.slice(insertAt)];
      return next;
    });
    startTransition(async () => {
      const res = await moveTask(cur.id, group.date, before, after);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  const handle = (kind: 'task' | 'milestone', id: string, title: string, fromDate: string | null) => (
    <button
      onPointerDown={(e) => startDrag(e, kind, id, title, fromDate)}
      aria-label="Drag to move"
      className="shrink-0 -mr-1 h-6 px-2 flex items-center text-[#3a3a3a] hover:text-[#6b6b6b] cursor-grab select-none touch-none text-sm leading-none"
    >
      ⠿
    </button>
  );

  const dropLine = <li aria-hidden className="list-none h-0.5 bg-[#f97316] rounded-pill my-1" />;

  // Should the drop indicator render just above the task at render-index i?
  // target.taskIdx counts slots among the group's tasks EXCLUDING the one
  // being dragged, so map the render index into that space.
  function insertIdxFor(cur: DragState, group: BoardGroup, i: number): boolean {
    if (!cur.target) return false;
    if (group.tasks[i].id === cur.id) return false;
    let visibleBefore = 0;
    for (let j = 0; j < i; j++) if (group.tasks[j].id !== cur.id) visibleBefore++;
    return visibleBefore === cur.target.taskIdx;
  }

  return (
    <div ref={containerRef} className={drag ? 'cursor-grabbing' : ''}>
      {local.map((group, gidx) => {
        const isTaskTarget = drag?.kind === 'task' && drag.target?.groupIdx === gidx;
        const isMilestoneTarget =
          drag?.kind === 'milestone' && drag.target?.groupIdx === gidx && group.date !== drag.fromDate;
        if (group.date !== null && group.overdue && group.tasks.length + group.milestones.length + group.meetings.length === 0)
          return null;
        return (
          <section
            key={group.date ?? 'undated'}
            data-gidx={gidx}
            className={`${group.date === null ? '' : 'mt-5'} ${isMilestoneTarget ? 'rounded-xl ring-2 ring-[#ea580c] ring-offset-4 ring-offset-[#0a0a0a]' : ''}`}
          >
            {group.date !== null && (
              <h2
                className={`text-sm font-semibold border-b pb-1.5 ${
                  group.overdue
                    ? 'text-[#f97316] border-[#9a3412]'
                    : group.isToday
                      ? 'text-[#ffc72c] border-[#3a3a3a]'
                      : 'text-[#e9e6da] border-[#2a2a2a]'
                }`}
              >
                {group.label} <span className="font-normal opacity-70">{group.sub}</span>
                {group.overdue && <span className="ml-2 text-[11px] uppercase tracking-wide">overdue</span>}
              </h2>
            )}
            <ul>
              {/* Meetings first: a timed appointment anchors the day */}
              {group.meetings.map((m) => (
                <MeetingTaskRow key={m.id} meeting={m} />
              ))}
              {group.tasks.map((t, i) => (
                <Fragment key={t.id}>
                  {isTaskTarget && insertIdxFor(drag!, group, i) && dropLine}
                  <PersonalTaskRow
                    task={t}
                    dimmed={drag?.id === t.id}
                    dragHandle={handle('task', t.id, t.title, group.date)}
                    dataAttrs={{ 'data-row-kind': 'task', 'data-row-id': t.id }}
                  />
                </Fragment>
              ))}
              {isTaskTarget && drag!.target!.taskIdx === group.tasks.filter((t) => t.id !== drag!.id).length && dropLine}
              {group.milestones.map((m) => (
                <MilestoneTaskRow
                  key={m.id}
                  milestone={m}
                  dimmed={drag?.id === m.id}
                  dragHandle={handle('milestone', m.id, m.label, group.date)}
                />
              ))}
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
