import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/crm/status';
import { fmtDate, fmtDateTime, todayISO } from '@/lib/crm/format';
import { ONBOARDING_QUESTIONS } from '@/lib/crm/onboarding';
import { accountNotes } from '@/lib/crm/notes';
import { StatusChip } from '@/components/crm/StatusChip';
import { DeleteClientForm, EditClientForm } from '@/components/crm/ClientForms';
import { GrowingTextarea } from '@/components/crm/GrowingTextarea';
import { Notes } from '@/components/crm/Notes';
import { updateOrder } from '../../actions';

export const dynamic = 'force-dynamic';

const fieldStyles =
  'rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

type OrderRow = typeof tables.orders.$inferSelect & {
  onboarding: typeof tables.onboardingForms.$inferSelect | null;
};

/** One order: status + notes, saved together. Used for ongoing and past
 *  orders alike so a wrong status is always reversible. */
function OrderCard({ order, fallbackBrand }: { order: OrderRow; fallbackBrand: string }) {
  const onboardingAnswers = order.onboarding
    ? ONBOARDING_QUESTIONS.filter((q) => order.onboarding![q.field])
    : [];
  return (
    <div className="rounded-2xl bg-[var(--crm-soft)] border border-[var(--crm-line)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[var(--crm-text)] break-words">{order.title}</h2>
          <div className="text-xs text-[var(--crm-muted)]">
            {order.brand || fallbackBrand} · started {fmtDateTime(order.createdAt)}
          </div>
        </div>
        <StatusChip status={order.status} />
      </div>

      {/* Historical: the brief the client filled from the old studio tracker.
          The living version of this form is on the LEAD page now. */}
      {order.onboarding && (onboardingAnswers.length > 0 || order.onboarding.briefLink) && (
        <details className="mt-3 rounded-xl bg-[var(--crm-inset)] border border-[var(--crm-divide)] px-4 py-3">
          <summary className="cursor-pointer text-xs select-none">
            <span className="font-semibold text-[var(--crm-good)]">Onboarding brief</span>
            {order.onboarding.briefLink && (
              <a
                href={order.onboarding.briefLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[var(--crm-good)] hover:underline break-all"
              >
                brief link
              </a>
            )}
          </summary>
          <div className="mt-3 space-y-3">
            {onboardingAnswers.map((q) => (
              <div key={q.field}>
                <div className="text-[11px] uppercase tracking-wider text-[var(--crm-faint)] font-semibold">{q.label}</div>
                <p className="text-sm text-[var(--crm-text)] whitespace-pre-wrap break-words mt-0.5">{order.onboarding![q.field]}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <form action={updateOrder} className="mt-4 space-y-3">
        <input type="hidden" name="orderId" value={order.id} />
        <GrowingTextarea
          name="notes"
          minRows={3}
          maxHeightClass="max-h-96"
          defaultValue={order.notes}
          placeholder="Order notes — delivery links, scope changes, anything worth keeping."
          className={`${fieldStyles} w-full`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select name="status" defaultValue={order.status} className={`${fieldStyles} py-1.5`}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-[#1f7a3a] hover:bg-[var(--crm-good)] px-3 py-1.5 text-xs font-semibold text-white transition-colors">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const d = db();
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();

  // The lead row(s) this client came from. They're this person's pre-conversion
  // record: their calls and their sales notes hang off them, and both render
  // here so the whole relationship reads from one page.
  const [orders, leads] = await Promise.all([
    d.select().from(tables.orders).where(eq(tables.orders.accountId, account.id)).orderBy(desc(tables.orders.createdAt)),
    d
      .select({ id: tables.leads.id, source: tables.leads.source })
      .from(tables.leads)
      .where(eq(tables.leads.convertedAccountId, account.id)),
  ]);
  const leadIds = leads.map((l) => l.id);
  const notes = await accountNotes(account.id, leadIds);
  const onboardingForms = orders.length
    ? await d
        .select()
        .from(tables.onboardingForms)
        .where(inArray(tables.onboardingForms.orderId, orders.map((o) => o.id)))
    : [];
  const withOnboarding: OrderRow[] = orders.map((o) => ({
    ...o,
    onboarding: onboardingForms.find((f) => f.orderId === o.id) ?? null,
  }));
  const ongoing = withOnboarding.filter((o) => o.status === 'ongoing');
  const past = withOnboarding.filter((o) => o.status !== 'ongoing');
  const fallbackBrand = account.company || account.name;
  // Deleting the client destroys the stub leads we minted just to hang its
  // calls off ('client-record'); a real funnel lead is the person's own record
  // and is archived instead, keeping everything attached to it.
  const doomedLeadIds = new Set(leads.filter((l) => l.source === 'client-record').map((l) => l.id));
  const keptLeadIds = new Set(leads.filter((l) => l.source !== 'client-record').map((l) => l.id));
  const noteViews = notes.map((n) => ({
    id: n.id,
    date: fmtDate(n.date),
    text: n.text,
    fromLead: !!n.leadId,
  }));

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl break-words">{account.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--crm-muted)]">
            {account.company && <span className="break-words">{account.company}</span>}
            <EditClientForm id={account.id} name={account.name} company={account.company} />
          </div>
        </div>
        <Link href={`/clients/${account.id}/orders/new`} className="sign-btn-cta text-xs px-4 py-2 shrink-0">
          New Order
        </Link>
      </div>

      {/* Ongoing orders */}
      {ongoing.map((order) => (
        <OrderCard key={order.id} order={order} fallbackBrand={fallbackBrand} />
      ))}
      {ongoing.length === 0 && <p className="text-sm text-[var(--crm-muted)]">No ongoing orders.</p>}

      {/* Completed / canceled orders */}
      {past.length > 0 && (
        <details className="rounded-2xl bg-[var(--crm-inset)] border border-[var(--crm-divide)] p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--crm-muted)]">
            Past orders ({past.length})
          </summary>
          <div className="mt-4 space-y-4">
            {past.map((order) => (
              <OrderCard key={order.id} order={order} fallbackBrand={fallbackBrand} />
            ))}
          </div>
        </details>
      )}

      {/* Notes: one stream per person, sales-era notes included.
          #notes is where the task board sends you when you open a call. */}
      <div id="notes" className="scroll-mt-24">
        <h2 className="text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold mb-1">Notes</h2>
        <p className="text-xs text-[var(--crm-faint)] mb-3">Ours only, sales calls included. The client never sees these.</p>
        <Notes accountId={account.id} notes={noteViews} today={todayISO()} />
      </div>

      {/* Danger zone: clearing a client out for good. The counts split by who
          owns each row — a real funnel lead survives the delete (archived) and
          keeps its own calls and notes, so those aren't losses to warn about. */}
      <div className="border-t border-[var(--crm-divide)] pt-6">
        <DeleteClientForm
          id={account.id}
          name={account.name}
          orders={orders.length}
          notes={notes.filter((n) => !n.leadId || doomedLeadIds.has(n.leadId)).length}
          kept={{
            lead: keptLeadIds.size > 0,
            notes: notes.filter((n) => n.leadId && keptLeadIds.has(n.leadId)).length,
          }}
        />
      </div>
    </div>
  );
}
