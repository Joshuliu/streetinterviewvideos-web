'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionResult,
  addTask,
  completeMilestoneAction,
  completeTask,
  updateTask,
} from '@/app/team/(app)/actions';
import { ClientBadge } from './StatusChip';

// Client-side rows for the My Tasks view. Server actions do the work; these
// components only hold open/closed UI state and surface errors.

const fieldStyles =
  'rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

function CompleteCircle({ onClick, busy, title }: { onClick: () => void; busy: boolean; title: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={title}
      className="shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 border-[#3a3a3a] hover:border-[#2a9a4a] hover:bg-[#1f7a3a]/30 transition-colors disabled:opacity-50"
      aria-label={title}
    />
  );
}

export function AddTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await addTask(fd);
        formRef.current?.reset();
      }}
      className="flex flex-wrap gap-2 items-center"
    >
      <input name="title" required placeholder="Add a task…" className={`${fieldStyles} flex-1 min-w-[180px]`} />
      <input name="dueDate" type="date" className={fieldStyles} aria-label="Due date" />
      <button type="submit" className="sign-btn-cta text-xs px-4 py-2">
        Add
      </button>
    </form>
  );
}

export function PersonalTaskRow({
  task,
}: {
  task: { id: string; title: string; dueDate: string | null; notes: string; dueLabel: string; overdue: boolean };
}) {
  const [editing, setEditing] = useState(false);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  return (
    <li className="flex items-start gap-3 py-3 border-b border-[#1f1f1f]">
      <CompleteCircle
        busy={busy}
        title="Complete task"
        onClick={() =>
          startTransition(async () => {
            const fd = new FormData();
            fd.set('id', task.id);
            await completeTask(fd);
            router.refresh();
          })
        }
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            action={async (fd) => {
              await updateTask(fd);
              setEditing(false);
            }}
            className="flex flex-wrap gap-2 items-center"
          >
            <input type="hidden" name="id" value={task.id} />
            <input name="title" defaultValue={task.title} required className={`${fieldStyles} flex-1 min-w-[160px]`} />
            <input name="dueDate" type="date" defaultValue={task.dueDate ?? ''} className={fieldStyles} />
            <input name="notes" defaultValue={task.notes} placeholder="Notes" className={`${fieldStyles} w-full`} />
            <button type="submit" className="text-xs font-semibold text-[#2a9a4a] hover:text-[#2a9a4a]/80">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#9ca3af] hover:text-white">
              Cancel
            </button>
          </form>
        ) : (
          <button onClick={() => setEditing(true)} className="text-left w-full group">
            <div className="text-sm text-white break-words group-hover:text-[#e9e6da]">{task.title}</div>
            <div className="text-xs mt-0.5 space-x-2">
              <span className={task.overdue ? 'text-[#f97316] font-semibold' : 'text-[#9ca3af]'}>{task.dueLabel}</span>
              {task.notes && <span className="text-[#6b6b6b] break-words">{task.notes}</span>}
            </div>
          </button>
        )}
      </div>
    </li>
  );
}

export function MilestoneTaskRow({
  milestone,
}: {
  milestone: {
    id: string;
    label: string;
    orderTitle: string;
    brand: string;
    accountId: string;
    isNext: boolean;
    needsLink: boolean;
    dueLabel: string;
    overdue: boolean;
  };
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function complete(deliveredLink?: string) {
    startTransition(async () => {
      const res: ActionResult = await completeMilestoneAction(milestone.id, deliveredLink);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <li className="flex items-start gap-3 py-3 border-b border-[#1f1f1f]">
      {milestone.isNext ? (
        <CompleteCircle
          busy={busy}
          title="Complete milestone"
          onClick={() => (milestone.needsLink ? setLinkOpen((v) => !v) : complete())}
        />
      ) : (
        <div
          className="shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 border-dashed border-[#2a2a2a]"
          title="An earlier milestone is still open"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm text-white break-words">
          {milestone.label} <span className="text-[#9ca3af]">— {milestone.orderTitle}</span>
        </div>
        <div className="text-xs mt-1 flex flex-wrap items-center gap-2">
          <a href={`/clients/${milestone.accountId}`}>
            <ClientBadge name={milestone.brand} />
          </a>
          <span className={milestone.overdue ? 'text-[#f97316] font-semibold' : 'text-[#9ca3af]'}>{milestone.dueLabel}</span>
          {!milestone.isNext && <span className="text-[#6b6b6b]">blocked by an earlier milestone</span>}
        </div>
        {linkOpen && (
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Delivery link (Drive, Frame.io…)"
              className={`${fieldStyles} flex-1 min-w-[200px]`}
              autoFocus
            />
            <button
              onClick={() => complete(link)}
              disabled={busy || !link.trim()}
              className="sign-btn-cta text-xs px-4 py-2 disabled:opacity-50"
            >
              Deliver
            </button>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-[#f97316]">{error}</p>}
      </div>
    </li>
  );
}
