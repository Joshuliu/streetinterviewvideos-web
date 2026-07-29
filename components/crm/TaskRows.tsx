'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionResult,
  addTask,
  completeMilestoneAction,
  completeTask,
  deleteTask,
  uncompleteTask,
  undoLastCompletedAction,
  updateMilestoneAction,
  updateTask,
} from '@/app/team/(app)/actions';
import { ClientBadge } from './StatusChip';

// Rows for the My Tasks view, modeled on how Neil already runs his Notes-app
// list: big checkboxes, tap a day to add a task under it, completed tasks
// fold away (recoverable, deletable) instead of piling up.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

/** Big-tap-target checkbox. Fills green instantly (optimistic) on tap;
    tapping a filled one unchecks it. */
function CheckCircle({
  onCheck,
  busy,
  checked,
  title,
}: {
  onCheck: () => void;
  busy: boolean;
  checked: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onCheck}
      disabled={busy}
      title={title}
      aria-label={title}
      className="shrink-0 p-2 -m-2 group"
    >
      <span
        className={`block h-6 w-6 rounded-full border-2 text-sm font-bold leading-none flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[#1f7a3a] border-[#0e4a22] text-white'
            : 'border-[#3a3a3a] text-transparent group-hover:border-[#2a9a4a] group-hover:bg-[#1f7a3a]/20'
        }`}
      >
        ✓
      </span>
    </button>
  );
}

/**
 * "+ Add task" row that lives under each day header (and at the top for
 * undated tasks). Tapping it opens an input; the task is created with that
 * day's date automatically. Stays open for rapid entry.
 */
export function AddTaskInline({ date }: { date: string | null }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 py-2.5 w-full text-left text-[#6b6b6b] hover:text-[#9ca3af] transition-colors"
      >
        <span className="shrink-0 h-6 w-6 rounded-full border-2 border-dashed border-[#2a2a2a] flex items-center justify-center text-sm leading-none">
          +
        </span>
        <span className="text-sm">Add task</span>
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await addTask(fd);
        formRef.current?.reset();
        formRef.current?.querySelector('input')?.focus();
        router.refresh();
      }}
      className="flex items-center gap-2 py-2"
    >
      {date && <input type="hidden" name="dueDate" value={date} />}
      <input name="title" required autoFocus placeholder="What needs doing?" className={`${fieldStyles} flex-1 min-w-0`} />
      <button type="submit" className="rounded-lg bg-[#1f7a3a] hover:bg-[#2a9a4a] px-3 py-2 text-xs font-semibold text-white transition-colors">
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#9ca3af] hover:text-white px-1">
        Done
      </button>
    </form>
  );
}

export function PersonalTaskRow({
  task,
  dragHandle,
  dataAttrs,
  dimmed,
}: {
  task: { id: string; title: string; dueDate: string | null; notes: string; overdue: boolean; completed?: boolean };
  dragHandle?: React.ReactNode;
  dataAttrs?: Record<string, string>;
  dimmed?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const serverCompleted = !!task.completed;
  useEffect(() => setOptimistic(null), [serverCompleted]);
  const checked = optimistic ?? serverCompleted;

  function toggle() {
    const next = !checked;
    setOptimistic(next);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', task.id);
      await (next ? completeTask(fd) : uncompleteTask(fd));
      router.refresh();
    });
  }

  return (
    <li
      {...dataAttrs}
      className={`flex items-start gap-2 py-2.5 transition-opacity ${dimmed ? 'opacity-30' : ''}`}
    >
      <CheckCircle busy={busy} checked={checked} title={checked ? 'Uncheck' : 'Check off'} onCheck={toggle} />
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            action={async (fd) => {
              await updateTask(fd);
              setEditing(false);
              router.refresh();
            }}
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <input type="hidden" name="id" value={task.id} />
            <input name="title" defaultValue={task.title} required className={`${fieldStyles} w-full sm:w-auto sm:flex-1`} />
            <input name="dueDate" type="date" defaultValue={task.dueDate ?? ''} className={`${fieldStyles} w-full sm:w-auto`} />
            <input name="notes" defaultValue={task.notes} placeholder="Notes" className={`${fieldStyles} w-full`} />
            <div className="flex items-center gap-4">
              <button type="submit" className="text-xs font-semibold text-[#2a9a4a]">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#9ca3af] hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setEditing(true)} className="text-left w-full">
            <span className={`min-h-6 flex items-center text-[15px] break-words ${checked ? 'line-through text-[#6b6b6b]' : 'text-white'}`}>
              <span>{task.title}</span>
            </span>
            {task.notes && <span className="block text-xs text-[#6b6b6b] break-words mt-0.5">{task.notes}</span>}
          </button>
        )}
      </div>
      {checked ? (
        <button
          onClick={() =>
            startTransition(async () => {
              const fd = new FormData();
              fd.set('id', task.id);
              await deleteTask(fd);
              router.refresh();
            })
          }
          disabled={busy}
          title="Clear from list"
          aria-label="Clear from list"
          className="shrink-0 -mr-1 h-6 px-2 flex items-center text-[#3a3a3a] hover:text-[#f97316] text-sm leading-none disabled:opacity-50"
        >
          ×
        </button>
      ) : (
        dragHandle
      )}
    </li>
  );
}

export function MilestoneTaskRow({
  milestone,
  dragHandle,
  dataAttrs,
  dimmed,
}: {
  milestone: {
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
  };
  dragHandle?: React.ReactNode;
  dataAttrs?: Record<string, string>;
  dimmed?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function complete(deliveredLink?: string) {
    if (!milestone.needsLink) setChecked(true);
    startTransition(async () => {
      const res: ActionResult = await completeMilestoneAction(milestone.id, deliveredLink);
      if (!res.ok) {
        setChecked(false);
        setError(res.error);
      } else {
        setChecked(true);
        router.refresh();
      }
    });
  }

  return (
    <li
      {...dataAttrs}
      className={`flex items-start gap-2 py-2.5 transition-opacity ${checked ? 'opacity-40' : ''} ${dimmed ? 'opacity-30' : ''}`}
    >
      {milestone.isNext ? (
        <CheckCircle
          busy={busy}
          checked={checked}
          title="Complete milestone"
          onCheck={() => {
            if (checked) return;
            milestone.needsLink ? setLinkOpen((v) => !v) : complete();
          }}
        />
      ) : (
        <div
          className="shrink-0 h-6 w-6 rounded-full border-2 border-dashed border-[#2a2a2a]"
          title="An earlier step on this order is still open"
        />
      )}
      <div className="min-w-0 flex-1">
        <button onClick={() => setEditing((v) => !v)} className="text-left w-full">
          <span className={`min-h-6 flex items-center text-[15px] break-words ${checked ? 'line-through text-[#9ca3af]' : 'text-white'}`}>
            <span>
              {milestone.label} <span className="text-[#9ca3af]">for {milestone.orderTitle}</span>
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-2 mt-1">
            <ClientBadge name={milestone.brand} />
            {milestone.needsLink && <span className="text-[11px] text-[#eab308]">needs a delivery link to check off</span>}
            {!milestone.isNext && <span className="text-[11px] text-[#6b6b6b]">waiting on an earlier step</span>}
          </span>
        </button>

        {editing && (
          <form
            action={async (fd) => {
              await updateMilestoneAction(fd);
              setEditing(false);
              router.refresh();
            }}
            className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <input type="hidden" name="id" value={milestone.id} />
            <div className="flex gap-2">
              <select name="owner" defaultValue={milestone.owner} className={`${fieldStyles} py-1.5 flex-1 sm:flex-none`}>
                <option value="neil">Neil</option>
                <option value="josh">Joshua</option>
                <option value="client">Client</option>
              </select>
              <input type="date" name="targetDate" defaultValue={milestone.targetDate ?? ''} className={`${fieldStyles} py-1.5 flex-1 sm:flex-none`} />
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="text-xs font-semibold text-[#2a9a4a]">
                Save
              </button>
              <a href={`/clients/${milestone.accountId}`} className="text-xs text-[#9ca3af] hover:text-white">
                Open client
              </a>
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#9ca3af] hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        )}

        {linkOpen && !checked && (
          <div className="mt-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-3">
            <p className="text-xs text-[#9ca3af] mb-2">
              Paste the delivery link to finish this step. The client opens it from their dashboard, so this is how the
              videos get delivered.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://drive.google.com/…"
                className={`${fieldStyles} w-full sm:flex-1`}
                autoFocus
              />
              <button
                onClick={() => complete(link)}
                disabled={busy || !link.trim()}
                className="shrink-0 rounded-lg bg-[#ea580c] hover:bg-[#f97316] px-3 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                Deliver
              </button>
            </div>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-[#f97316]">{error}</p>}
      </div>
      {dragHandle}
    </li>
  );
}

/**
 * A booked sales call, derived straight from the lead (same philosophy as
 * milestone rows: never a stored task, so reschedules and cancellations on the
 * lead move or remove it with nothing to sync). Tapping the row opens the
 * lead, where the meeting time can be edited; the handle drags it up and down
 * its own day, which is the one thing about it that's ours to arrange.
 */
export function MeetingTaskRow({
  meeting,
  dragHandle,
  dataAttrs,
  dimmed,
}: {
  meeting: { id: string; name: string; company: string; time: string | null; done: boolean };
  dragHandle?: React.ReactNode;
  dataAttrs?: Record<string, string>;
  dimmed?: boolean;
}) {
  return (
    <li {...dataAttrs} className={`flex items-start gap-2 py-2.5 transition-opacity ${dimmed ? 'opacity-30' : ''}`}>
      {meeting.done ? (
        <span
          className="shrink-0 h-6 w-6 rounded-full border-2 bg-[#1f7a3a] border-[#0e4a22] text-white text-sm font-bold leading-none flex items-center justify-center"
          title="Meeting happened"
          aria-label="Meeting happened"
        >
          ✓
        </span>
      ) : (
        <span
          className="shrink-0 h-6 w-6 rounded-full border-2 border-[#ea580c] flex items-center justify-center"
          title="Booked sales call"
          aria-label="Booked sales call"
        >
          <span className="block h-2 w-2 rounded-full bg-[#ea580c]" />
        </span>
      )}
      <Link href={`/leads/${meeting.id}`} className="min-w-0 flex-1 text-left">
        <span
          className={`min-h-6 flex items-center text-[15px] break-words ${meeting.done ? 'line-through text-[#6b6b6b]' : 'text-white'}`}
        >
          <span>
            Take the meeting <span className={meeting.done ? '' : 'text-[#9ca3af]'}>with {meeting.name}</span>
          </span>
        </span>
        <span className={`flex flex-wrap items-center gap-2 mt-1 ${meeting.done ? 'opacity-50' : ''}`}>
          {meeting.time ? (
            <span className="text-[11px] font-semibold text-[#fdba74]">{meeting.time}</span>
          ) : (
            <span className="text-[11px] text-[#f97316]">time not synced, set it on the lead</span>
          )}
          {meeting.company && <ClientBadge name={meeting.company} />}
        </span>
      </Link>
      {dragHandle}
    </li>
  );
}

export function CompletedTaskRow({ task }: { task: { id: string; title: string; when: string } }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  function run(action: (fd: FormData) => Promise<void>) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('id', task.id);
      await action(fd);
      router.refresh();
    });
  }
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="shrink-0 h-5 w-5 rounded-full bg-[#1f7a3a]/40 text-white/70 text-xs flex items-center justify-center">✓</span>
      <span className="min-w-0 flex-1 text-sm text-[#9ca3af] line-through break-words">{task.title}</span>
      <span className="text-xs text-[#6b6b6b] shrink-0">{task.when}</span>
      <button onClick={() => run(uncompleteTask)} disabled={busy} className="text-xs text-[#2a9a4a] hover:text-[#2a9a4a]/80 shrink-0 disabled:opacity-50">
        Restore
      </button>
      <button onClick={() => run(deleteTask)} disabled={busy} className="text-xs text-[#9ca3af] hover:text-[#f97316] shrink-0 disabled:opacity-50">
        Delete
      </button>
    </li>
  );
}

export function CompletedMilestoneRow({
  milestone,
}: {
  milestone: { orderId: string; accountId: string; label: string; orderTitle: string; when: string; canUndo: boolean };
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <li className="flex items-center gap-3 py-2 flex-wrap">
      <span className="shrink-0 h-5 w-5 rounded-full bg-[#1f7a3a]/40 text-white/70 text-xs flex items-center justify-center">✓</span>
      <span className="min-w-0 flex-1 text-sm text-[#9ca3af] line-through break-words">
        {milestone.label} for {milestone.orderTitle}
      </span>
      <span className="text-xs text-[#6b6b6b] shrink-0">{milestone.when}</span>
      {milestone.canUndo ? (
        <button
          onClick={() =>
            startTransition(async () => {
              const res: ActionResult = await undoLastCompletedAction(milestone.orderId);
              if (!res.ok) setError(res.error);
              else router.refresh();
            })
          }
          disabled={busy}
          className="text-xs text-[#2a9a4a] hover:text-[#2a9a4a]/80 shrink-0 disabled:opacity-50"
        >
          Undo
        </button>
      ) : (
        <a href={`/clients/${milestone.accountId}`} className="text-xs text-[#6b6b6b] hover:text-white shrink-0">
          Open client
        </a>
      )}
      {error && <span className="basis-full text-xs text-[#f97316]">{error}</span>}
    </li>
  );
}
