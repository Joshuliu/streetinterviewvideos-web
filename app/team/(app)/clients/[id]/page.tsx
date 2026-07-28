import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import {
  DELIVERY_KINDS,
  MILESTONE_META,
  canStartRevisionRound,
  deriveStatus,
  isOrderCompleted,
  lastCompletedMilestone,
  nextIncomplete,
} from '@/lib/crm/status';
import { fmtDate, fmtDateTime, isOverdue, todayISO } from '@/lib/crm/format';
import { StatusChip } from '@/components/crm/StatusChip';
import { CompleteNextButton, StartRevisionButton, UndoButton } from '@/components/crm/OrderControls';
import { AddLoginEmailForm, EditClientForm } from '@/components/crm/ClientForms';
import { addNote, removeLoginEmail, updateMilestoneAction } from '../../actions';

export const dynamic = 'force-dynamic';

const fieldStyles =
  'rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const d = db();
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, params.id));
  if (!account) notFound();

  const [emails, notes, orders] = await Promise.all([
    d.select().from(tables.loginEmails).where(eq(tables.loginEmails.accountId, account.id)).orderBy(asc(tables.loginEmails.createdAt)),
    d.select().from(tables.notes).where(eq(tables.notes.accountId, account.id)).orderBy(desc(tables.notes.date), desc(tables.notes.createdAt)),
    d.select().from(tables.orders).where(eq(tables.orders.accountId, account.id)).orderBy(desc(tables.orders.createdAt)),
  ]);
  const allMilestones = orders.length
    ? await d
        .select()
        .from(tables.milestones)
        .where(inArray(tables.milestones.orderId, orders.map((o) => o.id)))
        .orderBy(asc(tables.milestones.sequence))
    : [];
  const withMilestones = orders.map((o) => ({ ...o, milestones: allMilestones.filter((m) => m.orderId === o.id) }));
  const active = withMilestones.filter((o) => !isOrderCompleted(o.milestones));
  const completed = withMilestones.filter((o) => isOrderCompleted(o.milestones));

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
        return (
          <div key={order.id} className="rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white break-words">{order.title}</h2>
                <div className="text-xs text-[#9ca3af]">
                  {order.brand || account.company || account.name} · started {fmtDateTime(order.createdAt)}
                </div>
              </div>
              <StatusChip status={deriveStatus(order.milestones)} />
            </div>
            <ul className="mt-4 space-y-1">
              {order.milestones.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 border-b border-[#141414] last:border-0">
                  {m.completedAt ? (
                    <>
                      <span className="shrink-0 h-5 w-5 rounded-full bg-[#1f7a3a] text-white text-xs flex items-center justify-center font-bold">✓</span>
                      <span className="text-sm text-[#9ca3af] line-through decoration-[#3a3a3a]">{MILESTONE_META[m.kind].label}</span>
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
                      <span className="text-sm text-white">{MILESTONE_META[m.kind].label}</span>
                      <form action={updateMilestoneAction} className="inline-flex items-center gap-1.5 flex-wrap">
                        <input type="hidden" name="id" value={m.id} />
                        <select name="owner" defaultValue={m.owner} className={`${fieldStyles} py-1`}>
                          <option value="neil">Neil</option>
                          <option value="josh">Joshua</option>
                        </select>
                        <input
                          type="date"
                          name="targetDate"
                          defaultValue={m.targetDate ?? ''}
                          className={`${fieldStyles} py-1 ${isOverdue(m.targetDate) ? 'border-[#9a3412] text-[#f97316]' : ''}`}
                        />
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
              {last && <UndoButton orderId={order.id} targetLabel={MILESTONE_META[last.kind].label} />}
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
                      {MILESTONE_META[m.kind].label}
                    </a>
                  ))}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Notes */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Notes</h2>
        <form action={addNote} className="space-y-2 mb-5">
          <input type="hidden" name="accountId" value={account.id} />
          <textarea name="text" required rows={2} placeholder="Add a note…" className={`${fieldStyles} w-full`} />
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" name="date" defaultValue={todayISO()} className={fieldStyles} />
            <label className="inline-flex items-center gap-2 text-xs text-[#9ca3af]">
              <input type="checkbox" name="clientVisible" className="accent-[#1f7a3a]" />
              Visible to client
            </label>
            <button type="submit" className="sign-btn-cta text-xs px-4 py-2">
              Add note
            </button>
          </div>
        </form>
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9ca3af] mb-1">
                {fmtDate(n.date)}
                {n.clientVisible && (
                  <span className="rounded bg-[#1f7a3a] px-1.5 py-0.5 text-[10px] font-semibold text-white">CLIENT-VISIBLE</span>
                )}
              </div>
              <p className="text-sm text-white whitespace-pre-wrap break-words">{n.text}</p>
            </li>
          ))}
        </ul>
        {notes.length === 0 && <p className="text-sm text-[#6b6b6b]">No notes yet.</p>}
      </div>
    </div>
  );
}
