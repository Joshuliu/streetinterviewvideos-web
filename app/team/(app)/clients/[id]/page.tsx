import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import {
  DELIVERY_KINDS,
  canStartRevisionRound,
  clientStepCopy,
  deriveStatus,
  expectedDates,
  isOrderCompleted,
  lastCompletedMilestone,
  milestoneLabel,
  nextIncomplete,
} from '@/lib/crm/status';
import { fmtDate, fmtDateTime, isOverdue, todayISO } from '@/lib/crm/format';
import { ONBOARDING_QUESTIONS } from '@/lib/crm/onboarding';
import { toMeetingViews } from '@/lib/crm/meetings';
import { accountNotes } from '@/lib/crm/notes';
import { StatusChip } from '@/components/crm/StatusChip';
import { CompleteNextButton, StartRevisionButton, UndoButton } from '@/components/crm/OrderControls';
import { AddLoginEmailForm, DeleteClientForm, EditClientForm } from '@/components/crm/ClientForms';
import { Meetings } from '@/components/crm/Meetings';
import { InternalNotes } from '@/components/crm/InternalNotes';
import { removeLoginEmail, setOrderNeedsProduct, updateMilestoneAction } from '../../actions';

export const dynamic = 'force-dynamic';

const fieldStyles =
  'rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const d = db();
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();

  // The lead row(s) this client came from. They're this person's pre-conversion
  // record: their calls and their sales notes hang off them, and both render
  // here so the whole relationship reads from one page.
  const [emails, orders, leads] = await Promise.all([
    d.select().from(tables.loginEmails).where(eq(tables.loginEmails.accountId, account.id)).orderBy(asc(tables.loginEmails.createdAt)),
    d.select().from(tables.orders).where(eq(tables.orders.accountId, account.id)).orderBy(desc(tables.orders.createdAt)),
    d
      .select({ id: tables.leads.id, source: tables.leads.source })
      .from(tables.leads)
      .where(eq(tables.leads.convertedAccountId, account.id)),
  ]);
  const leadIds = leads.map((l) => l.id);
  const [notes, meetings] = await Promise.all([
    accountNotes(account.id, leadIds),
    leadIds.length
      ? d.select().from(tables.leadMeetings).where(inArray(tables.leadMeetings.leadId, leadIds))
      : Promise.resolve([]),
  ]);
  const allMilestones = orders.length
    ? await d
        .select()
        .from(tables.milestones)
        .where(inArray(tables.milestones.orderId, orders.map((o) => o.id)))
        .orderBy(asc(tables.milestones.sequence))
    : [];
  // The client's onboarding, once attached to an order (they confirm the form
  // or submit a brief from studio., which completes Strategy).
  const onboardingForms = orders.length
    ? await d
        .select()
        .from(tables.onboardingForms)
        .where(inArray(tables.onboardingForms.orderId, orders.map((o) => o.id)))
    : [];
  const withMilestones = orders.map((o) => ({
    ...o,
    milestones: allMilestones.filter((m) => m.orderId === o.id),
    onboarding: onboardingForms.find((f) => f.orderId === o.id) ?? null,
  }));
  const active = withMilestones.filter((o) => !isOrderCompleted(o.milestones));
  const completed = withMilestones.filter((o) => isOrderCompleted(o.milestones));
  // Deleting the client destroys the stub leads we minted just to hang its
  // calls off ('client-record'); a real funnel lead is the person's own record
  // and is archived instead, keeping everything attached to it.
  const doomedLeadIds = new Set(leads.filter((l) => l.source === 'client-record').map((l) => l.id));
  const keptLeadIds = new Set(leads.filter((l) => l.source !== 'client-record').map((l) => l.id));
  const meetingViews = toMeetingViews(meetings);
  const noteViews = notes.map((n) => ({
    id: n.id,
    date: fmtDate(n.date),
    text: n.text,
    clientVisible: n.clientVisible,
    fromLead: !!n.leadId,
  }));

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header + login emails */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl break-words">{account.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#9ca3af]">
              {account.company && <span className="break-words">{account.company}</span>}
              <EditClientForm id={account.id} name={account.name} company={account.company} />
            </div>
          </div>
          <Link href={`/clients/${account.id}/orders/new`} className="sign-btn-cta text-xs px-4 py-2 shrink-0">
            New Order
          </Link>
        </div>
        <div className="mt-4">
          <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-2">Studio logins</h2>
          <div className="flex flex-wrap items-center gap-2">
            {emails.map((e) => (
              <span key={e.id} className="inline-flex items-center gap-1.5 rounded-pill bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1 text-xs text-white break-all">
                {e.email}
                <form action={removeLoginEmail} className="inline">
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" title="Remove (revokes access immediately)" className="text-[#9ca3af] hover:text-[#f97316] font-bold">
                    ×
                  </button>
                </form>
              </span>
            ))}
            <AddLoginEmailForm accountId={account.id} />
          </div>
        </div>
      </div>

      {/* Active orders */}
      {active.map((order) => {
        const next = nextIncomplete(order.milestones);
        const last = lastCompletedMilestone(order.milestones);
        // Behind the next step: the plan, not a promise. Same numbers the
        // client sees on their tracker.
        const expected = expectedDates(order.milestones);
        // Blocked on them, and on what: the two client-owned steps are where
        // orders actually stall, and neither shows up on anyone's task board.
        const blockedOn =
          next?.owner === 'client'
            ? clientStepCopy(next.kind, order.needsProduct)?.waitingOnClient ??
              `Waiting on the client: ${milestoneLabel(next.kind, order.needsProduct)}.`
            : undefined;
        const onboardingAnswers = order.onboarding
          ? ONBOARDING_QUESTIONS.filter((q) => order.onboarding![q.field])
          : [];
        return (
          <div key={order.id} className="rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white break-words">{order.title}</h2>
                <div className="text-xs text-[#9ca3af]">
                  {order.brand || account.company || account.name} · started {fmtDateTime(order.createdAt)}
                </div>
                {/* Untick for apps, services, anything with nothing to ship —
                    it renames the approval step and drops the product line
                    from what we chase them for. */}
                <form action={setOrderNeedsProduct} className="mt-1.5 flex items-center gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <label className="flex items-center gap-1.5 text-xs text-[#9ca3af] cursor-pointer">
                    <input
                      type="checkbox"
                      name="needsProduct"
                      defaultChecked={order.needsProduct}
                      className="h-4 w-4 accent-[#ea580c] cursor-pointer"
                    />
                    Product ships to the host
                  </label>
                  <button type="submit" className="text-xs text-[#9ca3af] hover:text-white">
                    Save
                  </button>
                </form>
              </div>
              <StatusChip status={deriveStatus(order.milestones)} />
            </div>

            {/* Whose court the order is sitting in */}
            {blockedOn && (
              <p className="mt-2 text-xs text-[#eab308]">
                {blockedOn}
                {next?.targetDate && isOverdue(next.targetDate) && (
                  <span className="text-[#f97316] font-semibold"> Chased since {fmtDate(next.targetDate)}.</span>
                )}
              </p>
            )}
            {order.onboarding?.confirmedAt && (
              <details className="mt-2 rounded-xl bg-[#141414] border border-[#1f1f1f] px-4 py-3">
                <summary className="cursor-pointer text-xs select-none">
                  <span className="font-semibold text-[#2a9a4a]">Onboarding confirmed</span>{' '}
                  <span className="text-[#6b6b6b]">{fmtDateTime(order.onboarding.confirmedAt)}</span>
                  {order.onboarding.briefLink && (
                    <a
                      href={order.onboarding.briefLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-[#2a9a4a] hover:underline break-all"
                    >
                      brief link
                    </a>
                  )}
                </summary>
                <div className="mt-3 space-y-3">
                  {onboardingAnswers.length === 0 && !order.onboarding.briefLink && (
                    <p className="text-xs text-[#6b6b6b]">Confirmed empty.</p>
                  )}
                  {onboardingAnswers.map((q) => (
                    <div key={q.field}>
                      <div className="text-[11px] uppercase tracking-wider text-[#6b6b6b] font-semibold">{q.label}</div>
                      <p className="text-sm text-white whitespace-pre-wrap break-words mt-0.5">{order.onboarding![q.field]}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
            <ul className="mt-4 space-y-1">
              {order.milestones.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 border-b border-[#141414] last:border-0">
                  {m.completedAt ? (
                    <>
                      <span className="shrink-0 h-5 w-5 rounded-full bg-[#1f7a3a] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      <span className="text-sm text-[#9ca3af] line-through decoration-[#3a3a3a]">{milestoneLabel(m.kind, order.needsProduct)}</span>
                      <span className="text-xs text-[#6b6b6b]">{fmtDateTime(m.completedAt)}</span>
                      {m.deliveredLink && (
                        <a href={m.deliveredLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2a9a4a] hover:underline break-all">
                          delivery link
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <span className={`shrink-0 h-5 w-5 rounded-full border-2 ${next?.id === m.id ? 'border-[#ea580c]' : 'border-[#2a2a2a] border-dashed'}`} />
                      <span className={`text-sm ${next?.id === m.id ? 'text-white' : 'text-[#9ca3af]'}`}>
                        {milestoneLabel(m.kind, order.needsProduct)}
                      </span>
                      <form action={updateMilestoneAction} className="inline-flex items-center gap-1.5 flex-wrap">
                        <input type="hidden" name="id" value={m.id} />
                        <select name="owner" defaultValue={m.owner} className={`${fieldStyles} py-1`}>
                          <option value="neil">Neil</option>
                          <option value="josh">Joshua</option>
                          <option value="client">Client</option>
                        </select>
                        {/* Only the next step has a deadline to edit. The rest
                            show where they'd land if this one lands on time —
                            they get a real date when their turn comes. */}
                        {next?.id === m.id ? (
                          <input
                            type="date"
                            name="targetDate"
                            defaultValue={m.targetDate ?? ''}
                            className={`${fieldStyles} py-1 ${isOverdue(m.targetDate) ? 'border-[#9a3412] text-[#f97316]' : ''}`}
                          />
                        ) : (
                          <span className="text-xs text-[#6b6b6b]">
                            {expected.has(m.id) ? `expected ${fmtDate(expected.get(m.id)!)}` : 'no date yet'}
                          </span>
                        )}
                        <button type="submit" className="text-xs text-[#9ca3af] hover:text-white">
                          Save
                        </button>
                      </form>
                      {next?.id === m.id && (
                        <CompleteNextButton
                          milestoneId={m.id}
                          needsLink={DELIVERY_KINDS.has(m.kind)}
                          label={DELIVERY_KINDS.has(m.kind) ? 'Deliver…' : 'Complete'}
                        />
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {canStartRevisionRound(order.milestones) && <StartRevisionButton orderId={order.id} />}
              {last && <UndoButton orderId={order.id} targetLabel={milestoneLabel(last.kind, order.needsProduct)} />}
            </div>
          </div>
        );
      })}
      {active.length === 0 && <p className="text-sm text-[#9ca3af]">No active orders.</p>}

      {/* Completed (archived) orders */}
      {completed.length > 0 && (
        <details className="rounded-2xl bg-[#141414] border border-[#1f1f1f] p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#9ca3af]">
            Completed orders ({completed.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {completed.map((order) => (
              <li key={order.id} className="text-sm">
                <span className="text-white">{order.title}</span>
                <span className="text-[#9ca3af]"> · {order.brand || account.company || account.name}</span>
                {order.milestones
                  .filter((m) => m.deliveredLink)
                  .map((m) => (
                    <a key={m.id} href={m.deliveredLink!} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-[#2a9a4a] hover:underline">
                      {milestoneLabel(m.kind, order.needsProduct)}
                    </a>
                  ))}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Calls: everything from the sales process onward, since the lead row
          this client came from is the same person */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Calls</h2>
        <Meetings accountId={account.id} meetings={meetingViews} />
      </div>

      {/* Internal notes: one stream per person, sales-era notes included.
          #notes is where the task board sends you when you open a call. */}
      <div id="notes" className="scroll-mt-24">
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-1">Internal notes</h2>
        <p className="text-xs text-[#6b6b6b] mb-3">
          Ours by default, sales calls included. Tick &ldquo;visible to client&rdquo; to put one in their dashboard updates.
        </p>
        <InternalNotes accountId={account.id} notes={noteViews} today={todayISO()} />
      </div>

      {/* Danger zone: clearing a client out for good. The counts split by who
          owns each row — a real funnel lead survives the delete (archived) and
          keeps its own calls and notes, so those aren't losses to warn about. */}
      <div className="border-t border-[#1f1f1f] pt-6">
        <DeleteClientForm
          id={account.id}
          name={account.name}
          orders={orders.length}
          logins={emails.length}
          calls={meetings.filter((m) => doomedLeadIds.has(m.leadId)).length}
          notes={notes.filter((n) => !n.leadId || doomedLeadIds.has(n.leadId)).length}
          kept={{
            lead: keptLeadIds.size > 0,
            calls: meetings.filter((m) => keptLeadIds.has(m.leadId)).length,
            notes: notes.filter((n) => n.leadId && keptLeadIds.has(n.leadId)).length,
          }}
        />
      </div>
    </div>
  );
}
