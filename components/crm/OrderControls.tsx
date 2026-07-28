'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionResult,
  completeMilestoneAction,
  startRevisionRoundAction,
  undoLastCompletedAction,
} from '@/app/team/(app)/actions';

// Order-card controls on the client-detail page: complete-next (with link
// input for deliveries), undo, start revision round.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

export function CompleteNextButton({ milestoneId, needsLink, label }: { milestoneId: string; needsLink: boolean; label: string }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function complete(deliveredLink?: string) {
    startTransition(async () => {
      const res: ActionResult = await completeMilestoneAction(milestoneId, deliveredLink);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        onClick={() => (needsLink ? setLinkOpen((v) => !v) : complete())}
        disabled={busy}
        className="rounded-lg bg-[#1f7a3a] hover:bg-[#2a9a4a] px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
      >
        {label}
      </button>
      {linkOpen && (
        <span className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Delivery link"
            className={`${fieldStyles} min-w-0 flex-1 sm:flex-none sm:w-52`}
            autoFocus
          />
          <button
            onClick={() => complete(link)}
            disabled={busy || !link.trim()}
            className="rounded-lg bg-[#ea580c] hover:bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            Deliver
          </button>
        </span>
      )}
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </div>
  );
}

export function UndoButton({ orderId, targetLabel }: { orderId: string; targetLabel: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={() => {
          if (!confirm(`Undo "${targetLabel}"?`)) return;
          startTransition(async () => {
            const res: ActionResult = await undoLastCompletedAction(orderId);
            if (!res.ok) setError(res.error);
            else router.refresh();
          });
        }}
        disabled={busy}
        className="text-xs text-[#9ca3af] hover:text-white transition-colors disabled:opacity-50"
      >
        Undo last
      </button>
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </span>
  );
}

export function StartRevisionButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={() =>
          startTransition(async () => {
            const res: ActionResult = await startRevisionRoundAction(orderId);
            if (!res.ok) setError(res.error);
            else router.refresh();
          })
        }
        disabled={busy}
        className="rounded-lg border border-[#ea580c] text-[#f97316] hover:bg-[#ea580c] hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
      >
        Start revision round
      </button>
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </span>
  );
}
