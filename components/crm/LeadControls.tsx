'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { convertLead, saveOnboardingForm, setLeadArchived } from '@/app/team/(app)/actions';
import { ONBOARDING_QUESTIONS } from '@/lib/crm/onboarding';
import { GrowingTextarea } from '@/components/crm/GrowingTextarea';

// Lead-detail controls: the onboarding form we fill on the lead's behalf
// during the sales call, archive toggle, and the convert-to-client form
// (calls live on the task board, notes in Notes.tsx). All follow the repo's
// server-action pattern: the action returns a result and navigation happens
// here via router.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

export function OnboardingFormEditor({
  leadId,
  initial,
  updatedAt,
}: {
  leadId: string;
  initial: Record<string, string>;
  updatedAt: string | null;
}) {
  const [state, setState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await saveOnboardingForm(fd);
          setState(res.ok ? 'saved' : 'error');
          if (res.ok) router.refresh();
        })
      }
      className="space-y-5"
    >
      <input type="hidden" name="leadId" value={leadId} />
      {ONBOARDING_QUESTIONS.map((q) => (
        <div key={q.field}>
          <label htmlFor={`ob-${q.field}`} className="block text-sm font-semibold text-[var(--crm-text)]">
            {q.label}
          </label>
          <p className="text-xs text-[var(--crm-muted)] mt-0.5 mb-2">{q.prompt}</p>
          <GrowingTextarea
            id={`ob-${q.field}`}
            name={q.field}
            minRows={3}
            maxHeightClass="max-h-96"
            defaultValue={initial[q.field] ?? ''}
            placeholder={q.placeholder}
            onChange={() => setState('idle')}
            className={fieldStyles}
          />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="sign-btn-cta text-xs px-4 py-2 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save notes'}
        </button>
        {state === 'saved' && !busy && <span className="text-xs text-[var(--crm-good)] font-semibold">Saved</span>}
        {state === 'error' && !busy && <span className="text-xs text-[var(--crm-accent)]">Could not save — try again</span>}
        {updatedAt && state !== 'saved' && <span className="text-xs text-[var(--crm-faint)]">Last saved {updatedAt}</span>}
      </div>
    </form>
  );
}

export function ArchiveLeadButton({ leadId, archived }: { leadId: string; archived: boolean }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() =>
        startTransition(async () => {
          await setLeadArchived(leadId, !archived);
          router.refresh();
        })
      }
      className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)] disabled:opacity-60"
    >
      {archived ? 'Restore lead' : 'Archive lead'}
    </button>
  );
}

/** Manual convert-to-client (Stripe will drive this automatically later).
 *  Prefilled from the lead, editable before confirming. Creates the account,
 *  adds the studio login email, links the lead, lands on the client page. */
export function ConvertLeadForm({
  leadId,
  name,
  company,
  email,
}: {
  leadId: string;
  name: string;
  company: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="sign-btn-cta text-xs px-4 py-2">
        Convert to client
      </button>
    );
  }
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await convertLead(fd);
          if (res.ok) router.push(`/clients/${res.accountId}`);
          else setError(res.error);
        })
      }
      className="space-y-3 rounded-xl border border-[var(--crm-line)] bg-[var(--crm-inset)] p-4 max-w-md"
    >
      <p className="text-xs text-[var(--crm-muted)]">
        Creates the client account with this contact, puts the email on its studio login list, and links this lead.
        If the email is already on a client, this lead links to that client instead.
      </p>
      <input type="hidden" name="leadId" value={leadId} />
      <input name="name" required defaultValue={name} placeholder="Contact name" className={`${fieldStyles} w-full`} />
      <input name="company" required defaultValue={company} placeholder="Company (brand or agency)" className={`${fieldStyles} w-full`} />
      <input name="email" type="email" required defaultValue={email} placeholder="Studio login email" className={`${fieldStyles} w-full`} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="sign-btn-cta text-xs px-4 py-2 disabled:opacity-60">
          {busy ? 'Converting…' : 'Create client'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-[var(--crm-accent)]">{error}</p>}
    </form>
  );
}
