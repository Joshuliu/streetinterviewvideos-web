'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StudioActionResult, confirmStudioOnboarding, saveStudioOnboarding, submitStudioBrief } from '@/app/studio/(app)/actions';
import { ONBOARDING_QUESTIONS } from '@/lib/crm/onboarding';
import { GrowingTextarea } from '@/components/crm/GrowingTextarea';

// The client's half of onboarding (studio., light theme). Shown while the
// order's Strategy milestone is open: they either confirm the onboarding
// form (pre-seeded with the notes we took on their sales call) or hand us a
// link to their own brief. Either path completes Strategy and moves the
// order to scripting.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-white border border-border px-3 py-2 text-base sm:text-sm text-ink-900 placeholder-text-400 focus:outline-none focus:border-accent';

export function StudioOnboarding({ orderId, fields, hasNotes }: { orderId: string; fields: Record<string, string>; hasNotes: boolean }) {
  const [path, setPath] = useState<'form' | 'brief'>('form');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function run(action: (fd: FormData) => Promise<StudioActionResult>, fd: FormData, onOk?: () => void) {
    startTransition(async () => {
      const res = await action(fd);
      if (!res.ok) setError(res.error);
      else {
        setError(null);
        onOk?.();
        router.refresh();
      }
    });
  }

  const pathBtn = (active: boolean) =>
    `rounded-pill px-4 py-2 text-xs font-semibold border transition-colors ${
      active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-text-700 border-border hover:border-ink-900'
    }`;

  return (
    <div className="rounded-2xl border border-border bg-paper p-5 sm:p-6">
      <h2 className="font-display text-lg text-ink-900">First step: your onboarding</h2>
      <p className="mt-1 text-sm text-text-700">
        We turn this into your video brief. Pick whichever is easier.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPath('form')} className={pathBtn(path === 'form')}>
          Fill out the form
        </button>
        <button type="button" onClick={() => setPath('brief')} className={pathBtn(path === 'brief')}>
          Send a brief instead
        </button>
      </div>

      {path === 'form' ? (
        <form
          action={(fd) => {
            const confirm = fd.get('intent') === 'confirm';
            run(confirm ? confirmStudioOnboarding : saveStudioOnboarding, fd, () => setSaved(!confirm));
          }}
          className="mt-5 space-y-5"
        >
          <input type="hidden" name="orderId" value={orderId} />
          {hasNotes && (
            <p className="text-xs text-text-400">
              We started these answers on your call. Add anything we missed, then confirm.
            </p>
          )}
          {ONBOARDING_QUESTIONS.map((q) => (
            <div key={q.field}>
              <label htmlFor={`sob-${q.field}`} className="block text-sm font-semibold text-ink-900">
                {q.label}
              </label>
              <p className="text-xs text-text-400 mt-0.5 mb-2">{q.prompt}</p>
              <GrowingTextarea
                id={`sob-${q.field}`}
                name={q.field}
                minRows={3}
                maxHeightClass="max-h-96"
                defaultValue={fields[q.field] ?? ''}
                placeholder={q.placeholder}
                onChange={() => setSaved(false)}
                className={fieldStyles}
              />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              name="intent"
              value="confirm"
              disabled={busy}
              className="rounded-lg bg-accent hover:bg-accent-hover px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Confirm onboarding'}
            </button>
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={busy}
              className="text-xs font-semibold text-text-700 hover:text-ink-900 disabled:opacity-60"
            >
              Save draft
            </button>
            {saved && !busy && <span className="text-xs font-semibold text-accent">Draft saved</span>}
          </div>
          <p className="text-xs text-text-400">Confirming sends your answers to the team and starts scripting.</p>
        </form>
      ) : (
        <form action={(fd) => run(submitStudioBrief, fd)} className="mt-5 space-y-3">
          <input type="hidden" name="orderId" value={orderId} />
          <p className="text-xs text-text-400">
            Already have a brief written up? Drop a link to it (Google Doc, Notion, anything we can open).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              name="briefLink"
              type="url"
              required
              placeholder="https://docs.google.com/…"
              className={`${fieldStyles} w-full sm:flex-1`}
            />
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 rounded-lg bg-accent hover:bg-accent-hover px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Submit brief'}
            </button>
          </div>
          <p className="text-xs text-text-400">Make sure the link is viewable by anyone with it.</p>
        </form>
      )}
      {error && <p className="mt-3 text-xs text-[#9a3412]">{error}</p>}
    </div>
  );
}
