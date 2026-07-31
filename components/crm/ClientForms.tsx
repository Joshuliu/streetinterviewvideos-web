'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addLoginEmail, createClient, createOrderAction, deleteClient, updateClient } from '@/app/team/(app)/actions';

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

/**
 * Danger zone at the foot of the client detail page. Deleting is permanent, so
 * it stays folded away and asks for the contact name typed back before the
 * button does anything. The counts spell out what goes with them.
 */
export function DeleteClientForm({
  id,
  name,
  orders,
  logins,
  calls,
  notes,
  kept,
}: {
  id: string;
  name: string;
  orders: number;
  logins: number;
  // Calls and notes that die with the account. Anything hanging off a lead
  // that survives is counted in `kept` instead, not here.
  calls: number;
  notes: number;
  // Set when a real funnel lead converted into this client: that person's
  // record is archived rather than destroyed, and takes its own calls and
  // notes with it.
  kept: { lead: boolean; calls: number; notes: number };
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
  const takes = [
    orders && `${plural(orders, 'order')} and every milestone on the task board`,
    logins && `${plural(logins, 'studio login')} (access stops immediately)`,
    calls && plural(calls, 'call'),
    notes && plural(notes, 'internal note'),
  ].filter(Boolean) as string[];
  const survives = [kept.calls && plural(kept.calls, 'call'), kept.notes && plural(kept.notes, 'note')].filter(
    Boolean,
  ) as string[];

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-[#9ca3af] hover:text-[#f97316]">
        Delete client
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-[#9a3412] bg-[#141414] p-4 max-w-md space-y-3">
      <p className="text-sm font-semibold text-[#f97316]">Delete {name} permanently?</p>
      {takes.length > 0 ? (
        <ul className="text-xs text-[#9ca3af] space-y-1 list-disc pl-4">
          {takes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[#9ca3af]">Nothing is attached to this client yet.</p>
      )}
      <p className="text-xs text-[#9ca3af]">
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
          className="rounded-lg bg-[#9a3412] hover:bg-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40"
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
          className="text-xs text-[#9ca3af] hover:text-white"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-[#f97316]">{error}</p>}
    </div>
  );
}

export interface MilestoneDefault {
  kind: string;
  label: string;
  /** Same step, worded for an order with nothing to ship. */
  labelNoProduct: string;
  owner: string;
  /** Days this step gets once the one before it finishes. */
  gapDays: number;
  targetDate: string;
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// "Aug 7" — same shape as lib/crm/format's fmtDate, inlined because this is a
// client component and the projection is computed as you type.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtISO(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
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
  // ONE deadline is set at creation: the first step's. Everything behind it is
  // shown as an expected date rolled forward from here (same projection the
  // order will render once it's live) and stored as null — a step earns a real
  // date when it becomes the next one. Promising all six up front is what used
  // to fill the task boards with overdue rows for work that couldn't start.
  const [firstDate, setFirstDate] = useState(defaults[0].targetDate);
  // Most orders put a physical product in the interviewees' hands; apps and
  // services don't, and naming a step after a product that doesn't exist reads
  // as a mistake to the client. Editable later on the order card too.
  const [needsProduct, setNeedsProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  function onPlacedChange(next: string) {
    setPlaced(next);
    if (/^\d{4}-\d{2}-\d{2}$/.test(next)) setFirstDate(shiftISO(next, defaults[0].gapDays));
  }

  // Projection off the first date, one gap at a time.
  const expected: Record<string, string> = {};
  let cursor = firstDate;
  for (const m of defaults.slice(1)) {
    cursor = /^\d{4}-\d{2}-\d{2}$/.test(cursor) ? shiftISO(cursor, m.gapDays) : '';
    expected[m.kind] = cursor;
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
          Backdate this for orders that already started. Changing it moves the first deadline and the schedule below.
        </p>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            name="needsProduct"
            checked={needsProduct}
            onChange={(e) => setNeedsProduct(e.target.checked)}
            className="h-4 w-4 accent-[#ea580c] cursor-pointer"
          />
          Product ships to the host
        </label>
        <p className="mt-1.5 text-xs text-[#6b6b6b]">
          Untick for apps, services, anything with nothing physical to send. It renames the client&rsquo;s approval step
          and drops the product from what we chase them for.
        </p>
      </div>
      <div>
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-1">Milestones</h2>
        <p className="text-xs text-[#6b6b6b] mb-3">
          Only the first step gets a deadline. The rest show when they&rsquo;d land if each one lands on time, and get
          a real date the moment they become the next step.
        </p>
        <ul className="space-y-2">
          {defaults.map((m, i) => (
            <li key={m.kind} className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white flex-1 min-w-[170px]">
                {needsProduct ? m.label : m.labelNoProduct}
              </span>
              <select name={`owner_${m.kind}`} defaultValue={m.owner} className={`${fieldStyles} py-1.5`}>
                <option value="neil">Neil</option>
                <option value="josh">Joshua</option>
                <option value="client">Client</option>
              </select>
              {i === 0 ? (
                <input
                  type="date"
                  name={`date_${m.kind}`}
                  required
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                  className={`${fieldStyles} py-1.5`}
                />
              ) : (
                <span className="text-xs text-[#6b6b6b]">expected {fmtISO(expected[m.kind] ?? '') || '—'}</span>
              )}
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
