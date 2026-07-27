'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addLoginEmail, createClient, createOrderAction } from '@/app/team/(app)/actions';

// Forms that need to navigate after their server action completes. A server
// action's own redirect() renders the target internally without re-running
// the host-rewrite middleware (404 on team.), so navigation happens here via
// router.push instead.

const fieldStyles =
  'rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

export function NewClientForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await createClient(fd);
          if (res.ok) router.push(`/clients/${res.id}`);
          else setError(res.error);
        })
      }
      className="space-y-4"
    >
      <input
        name="name"
        required
        autoFocus
        placeholder="Company name"
        className="w-full rounded-[10px] bg-[#0a0a0a] border border-[#3a3a3a] px-4 py-3 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]"
      />
      <button type="submit" disabled={busy} className="sign-btn-cta text-sm disabled:opacity-60">
        {busy ? 'Creating…' : 'Create client'}
      </button>
      {error && <p className="text-sm text-[#f97316]">{error}</p>}
    </form>
  );
}

export interface MilestoneDefault {
  kind: string;
  label: string;
  owner: string;
  targetDate: string;
}

export function NewOrderForm({
  accountId,
  accountName,
  defaults,
}: {
  accountId: string;
  accountName: string;
  defaults: MilestoneDefault[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await createOrderAction(fd);
          if (res.ok) router.push(`/clients/${res.accountId}`);
          else setError(res.error);
        })
      }
      className="space-y-6"
    >
      <input type="hidden" name="accountId" value={accountId} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="title" required autoFocus placeholder="Order title (e.g. 10 UGC videos)" className={`${fieldStyles} w-full`} />
        <input name="brand" placeholder={`Brand (blank = ${accountName})`} className={`${fieldStyles} w-full`} />
      </div>
      <div>
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Milestones</h2>
        <ul className="space-y-2">
          {defaults.map((m) => (
            <li key={m.kind} className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white flex-1 min-w-[170px]">{m.label}</span>
              <select name={`owner_${m.kind}`} defaultValue={m.owner} className={`${fieldStyles} py-1.5 text-xs`}>
                <option value="neil">Neil</option>
                <option value="josh">Joshua</option>
              </select>
              <input type="date" name={`date_${m.kind}`} defaultValue={m.targetDate} required className={`${fieldStyles} py-1.5 text-xs`} />
            </li>
          ))}
        </ul>
      </div>
      <button type="submit" disabled={busy} className="sign-btn-cta text-sm disabled:opacity-60">
        {busy ? 'Creating…' : 'Create order'}
      </button>
      {error && <p className="text-sm text-[#f97316]">{error}</p>}
    </form>
  );
}

export function AddLoginEmailForm({ accountId }: { accountId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <form
        action={(fd) =>
          startTransition(async () => {
            const res = await addLoginEmail(fd);
            if (res.ok) {
              setError(null);
              router.refresh();
            } else setError(res.error);
          })
        }
        className="inline-flex items-center gap-2"
      >
        <input type="hidden" name="accountId" value={accountId} />
        <input name="email" type="email" required placeholder="Add login email" className={`${fieldStyles} w-48`} />
        <button type="submit" disabled={busy} className="text-xs font-semibold text-[#2a9a4a] hover:text-[#2a9a4a]/80 disabled:opacity-60">
          Add
        </button>
      </form>
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </span>
  );
}
