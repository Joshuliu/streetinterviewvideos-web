'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addLoginEmail, createClient, createOrderAction, updateClient } from '@/app/team/(app)/actions';

// Forms that need to navigate after their server action completes. A server
// action's own redirect() renders the target internally without re-running
// the host-rewrite middleware (404 on team.), so navigation happens here via
// router.push instead.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

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
      {/* The client is a person. Company = who they represent (their own
          brand, or their agency — each order carries its own brand). */}
      <input
        name="name"
        required
        autoFocus
        placeholder="Contact name (e.g. Sarah Chen)"
        className="w-full rounded-[10px] bg-[#0a0a0a] border border-[#3a3a3a] px-4 py-3 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]"
      />
      <input
        name="company"
        required
        placeholder="Company (brand or agency)"
        className="w-full rounded-[10px] bg-[#0a0a0a] border border-[#3a3a3a] px-4 py-3 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]"
      />
      <button type="submit" disabled={busy} className="sign-btn-cta text-sm disabled:opacity-60">
        {busy ? 'Creating…' : 'Create client'}
      </button>
      {error && <p className="text-sm text-[#f97316]">{error}</p>}
    </form>
  );
}

/** Inline contact-name + company editor on the client detail header. */
export function EditClientForm({ id, name, company }: { id: string; name: string; company: string | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-[#9ca3af] hover:text-white">
        Edit
      </button>
    );
  }
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const res = await updateClient(fd);
          if (res.ok) {
            setOpen(false);
            setError(null);
            router.refresh();
          } else setError(res.error);
        })
      }
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input name="name" required defaultValue={name} placeholder="Contact name" className={`${fieldStyles} w-44`} />
      <input name="company" required defaultValue={company ?? ''} placeholder="Company" className={`${fieldStyles} w-44`} />
      <button type="submit" disabled={busy} className="text-xs font-semibold text-[#2a9a4a] hover:text-[#2a9a4a]/80 disabled:opacity-60">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#9ca3af] hover:text-white">
        Cancel
      </button>
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </form>
  );
}

export interface MilestoneDefault {
  kind: string;
  label: string;
  owner: string;
  offsetDays: number;
  targetDate: string;
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function NewOrderForm({
  accountId,
  defaultBrand,
  today,
  defaults,
}: {
  accountId: string;
  // Prefill: the client's company. Direct clients keep it; agency orders
  // overwrite it with the brand the order is actually for.
  defaultBrand: string;
  today: string;
  defaults: MilestoneDefault[];
}) {
  const [placed, setPlaced] = useState(today);
  // Dates are controlled so changing the placed date refills the schedule;
  // each one stays individually editable after.
  const [dates, setDates] = useState<Record<string, string>>(
    Object.fromEntries(defaults.map((m) => [m.kind, m.targetDate])),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function onPlacedChange(next: string) {
    setPlaced(next);
    if (/^\d{4}-\d{2}-\d{2}$/.test(next)) {
      setDates(Object.fromEntries(defaults.map((m) => [m.kind, shiftISO(next, m.offsetDays)])));
    }
  }

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
        <input name="brand" required defaultValue={defaultBrand} placeholder="Brand this order is for" className={`${fieldStyles} w-full`} />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-2">
          Order placed
        </label>
        <input
          type="date"
          name="placedDate"
          required
          value={placed}
          onChange={(e) => onPlacedChange(e.target.value)}
          className={`${fieldStyles}`}
        />
        <p className="mt-1.5 text-xs text-[#6b6b6b]">
          Backdate this for orders that already started. Changing it refills every milestone date below.
        </p>
      </div>
      <div>
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Milestones</h2>
        <ul className="space-y-2">
          {defaults.map((m) => (
            <li key={m.kind} className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white flex-1 min-w-[170px]">{m.label}</span>
              <select name={`owner_${m.kind}`} defaultValue={m.owner} className={`${fieldStyles} py-1.5`}>
                <option value="neil">Neil</option>
                <option value="josh">Joshua</option>
                <option value="client">Client</option>
              </select>
              <input
                type="date"
                name={`date_${m.kind}`}
                required
                value={dates[m.kind] ?? ''}
                onChange={(e) => setDates((prev) => ({ ...prev, [m.kind]: e.target.value }))}
                className={`${fieldStyles} py-1.5`}
              />
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
