'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, createOrderAction, deleteClient, updateClient } from '@/app/team/(app)/actions';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/crm/status';
import { GrowingTextarea } from '@/components/crm/GrowingTextarea';

// Forms that need to navigate after their server action completes. A server
// action's own redirect() renders the target internally without re-running
// the host-rewrite middleware (404 on team.), so navigation happens here via
// router.push instead.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

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
        className="w-full rounded-[10px] bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-4 py-3 text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]"
      />
      <input
        name="company"
        required
        placeholder="Company (brand or agency)"
        className="w-full rounded-[10px] bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-4 py-3 text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]"
      />
      <button type="submit" disabled={busy} className="sign-btn-cta text-sm disabled:opacity-60">
        {busy ? 'Creating…' : 'Create client'}
      </button>
      {error && <p className="text-sm text-[var(--crm-accent)]">{error}</p>}
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
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]">
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
      <button type="submit" disabled={busy} className="text-xs font-semibold text-[var(--crm-good)] hover:text-[var(--crm-good)]/80 disabled:opacity-60">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]">
        Cancel
      </button>
      {error && <span className="text-xs text-[var(--crm-accent)]">{error}</span>}
    </form>
  );
}

/**
 * Danger zone at the foot of the client detail page. Deleting is permanent, so
 * it stays folded away and asks for the contact name typed back before the
 * button does anything. The counts spell out what goes with them.
 */
export function DeleteClientForm({
  id,
  name,
  orders,
  notes,
  kept,
}: {
  id: string;
  name: string;
  orders: number;
  // Notes that die with the account. Anything hanging off a lead that survives
  // is counted in `kept` instead, not here. Calls are in NEITHER list: they
  // are mirrored from Google Calendar, so deleting a client can't destroy one
  // — the row simply stops being linked to anybody.
  notes: number;
  // Set when a real funnel lead converted into this client: that person's
  // record is archived rather than destroyed, and takes its own notes with it.
  kept: { lead: boolean; notes: number };
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
  const takes = [
    orders && `${plural(orders, 'order')}, their notes included`,
    notes && plural(notes, 'internal note'),
  ].filter(Boolean) as string[];
  const survives = [kept.notes && plural(kept.notes, 'note')].filter(Boolean) as string[];

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-accent)]">
        Delete client
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-[#9a3412] bg-[var(--crm-inset)] p-4 max-w-md space-y-3">
      <p className="text-sm font-semibold text-[var(--crm-accent)]">Delete {name} permanently?</p>
      {takes.length > 0 ? (
        <ul className="text-xs text-[var(--crm-muted)] space-y-1 list-disc pl-4">
          {takes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--crm-muted)]">Nothing is attached to this client yet.</p>
      )}
      <p className="text-xs text-[var(--crm-muted)]">
        {kept.lead &&
          `Their lead record moves to Archived instead${survives.length ? `, keeping ${survives.join(' and ')}` : ''}. `}
        {takes.length ? 'Everything above is gone for good.' : 'The client record itself is gone for good.'}
      </p>
      <input
        value={typed}
        onChange={(e) => {
          setTyped(e.target.value);
          setError(null);
        }}
        placeholder={`Type ${name} to confirm`}
        autoFocus
        className={`${fieldStyles} w-full`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || typed.trim().toLowerCase() !== name.trim().toLowerCase()}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteClient(id, typed);
              if (res.ok) router.push('/clients');
              else setError(res.error);
            })
          }
          className="rounded-lg bg-[#9a3412] hover:bg-[var(--crm-accent-2)] px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
        >
          {busy ? 'Deleting…' : 'Delete client'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped('');
            setError(null);
          }}
          className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-[var(--crm-accent)]">{error}</p>}
    </div>
  );
}

export function NewOrderForm({
  accountId,
  defaultBrand,
  today,
}: {
  accountId: string;
  // Prefill: the client's company. Direct clients keep it; agency orders
  // overwrite it with the brand the order is actually for.
  defaultBrand: string;
  today: string;
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
        <input name="brand" required defaultValue={defaultBrand} placeholder="Brand this order is for" className={`${fieldStyles} w-full`} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold mb-2">
            Order placed
          </label>
          <input type="date" name="placedDate" required defaultValue={today} className={`${fieldStyles} w-full`} />
          <p className="mt-1.5 text-xs text-[var(--crm-faint)]">Backdate this for orders that already started.</p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold mb-2">
            Status
          </label>
          <select name="status" defaultValue="ongoing" className={`${fieldStyles} w-full`}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold mb-2">
          Order notes
        </label>
        <GrowingTextarea
          name="notes"
          minRows={3}
          maxHeightClass="max-h-96"
          placeholder="Scope, delivery links, anything worth keeping. Editable later from the order card."
          className={`${fieldStyles} w-full`}
        />
      </div>
      <button type="submit" disabled={busy} className="sign-btn-cta text-sm disabled:opacity-60">
        {busy ? 'Creating…' : 'Create order'}
      </button>
      {error && <p className="text-sm text-[var(--crm-accent)]">{error}</p>}
    </form>
  );
}
