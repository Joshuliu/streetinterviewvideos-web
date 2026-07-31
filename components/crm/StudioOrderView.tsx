import Link from 'next/link';
import { clientStepCopy, deriveStatus, expectedDates, isOrderCompleted, milestoneLabel, nextIncomplete } from '@/lib/crm/status';
import { fmtDate, fmtDateTime } from '@/lib/crm/format';
import { StudioRoadTracker } from '@/components/crm/StudioRoadTracker';
import { StudioOnboarding } from '@/components/crm/StudioOnboarding';
import { ONBOARDING_QUESTIONS } from '@/lib/crm/onboarding';
import type { milestones as milestonesTable, notes as notesTable, orders as ordersTable } from '@/lib/db/schema';

type Order = typeof ordersTable.$inferSelect;
type Milestone = typeof milestonesTable.$inferSelect;
type Note = typeof notesTable.$inferSelect;

export interface StudioOnboardingState {
  fields: Record<string, string>;
  confirmed: boolean;
  briefLink: string | null;
}

// The client-facing order tracker (studio.): the showpiece. Display-only,
// with one exception: while Strategy is open the client hands us their
// onboarding (confirm the form or submit a brief), which completes Strategy.

export function StudioOrderView({
  brandFallback,
  order,
  milestones,
  clientNotes,
  otherOrders,
  onboarding,
}: {
  // Shown when a legacy order has no brand: the account's company.
  brandFallback: string;
  order: Order;
  milestones: Milestone[];
  clientNotes: Note[];
  otherOrders: { order: Order; status: string; deliveredLinks: { label: string; href: string }[] }[];
  onboarding: StudioOnboardingState | null;
}) {
  const status = deriveStatus(milestones);
  const next = nextIncomplete(milestones);
  const done = isOrderCompleted(milestones);
  // Revisions supersede: only the latest completed delivery shows its link,
  // so the client always sees exactly one link, pointing at the current cut.
  const latestDelivery = [...milestones].reverse().find((m) => m.completedAt && m.deliveredLink);
  const strategyOpen = next?.kind === 'strategy';
  const answered = onboarding ? ONBOARDING_QUESTIONS.filter((q) => onboarding.fields[q.field]) : [];
  // Clients see EXPECTED dates, never our internal deadline (2026-07-31). The
  // deadline is the date we hold ourselves to and re-cut as things move; the
  // expected date is the plan, and it never points at a day already gone. A
  // hand-off that sits with the client slides the whole plan forward rather
  // than showing them dates everyone can see we've blown.
  const expected = expectedDates(milestones);
  // The two steps that need something FROM them. Said plainly, at the top:
  // an order parked on a client is almost always an order they think is
  // parked on us.
  const yourMove = next?.owner === 'client' ? clientStepCopy(next.kind, order.needsProduct)?.waitingOnYou : undefined;

  return (
    <div className="max-w-2xl space-y-10">
      {/* Order header + status sign */}
      <div>
        <div className="text-xs uppercase tracking-wider text-text-400 font-semibold">{order.brand || brandFallback}</div>
        <h1 className="font-display text-2xl sm:text-3xl mt-1 break-words">{order.title}</h1>
        <div className="mt-4">
          <span className={`tracker-sign text-sm sm:text-base ${done || !next ? '' : 'tracker-sign--current'}`}>{status}</span>
        </div>
      </div>

      {/* Over to you: whichever of the two hand-offs we're waiting on. */}
      {yourMove && (
        <div className="rounded-2xl border-2 border-accent bg-accent/5 px-5 py-4">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">Over to you</div>
          <p className="text-sm text-ink-900 mt-1">{yourMove}</p>
        </div>
      )}

      {/* Onboarding: the client's one action. Open while Strategy is. */}
      {strategyOpen && onboarding && (
        <StudioOnboarding orderId={order.id} fields={onboarding.fields} hasNotes={answered.length > 0} />
      )}

      {/* Progress bar + stages */}
      <div>
        <div className="tracker-bar mb-6">
          {milestones.map((m) => (
            <div key={m.id} className={m.completedAt ? 'seg-done' : next?.id === m.id ? 'seg-current' : ''} />
          ))}
        </div>
        {/* Milestones drawn as the marketing-site road: green fill behind
            completed checkpoints, the taxi parked in the gap before the next
            one. Display strings are precomputed here so the client component
            gets plain serializable props. */}
        <StudioRoadTracker
          stages={milestones.map((m, i) => ({
            id: m.id,
            n: i + 1,
            label: milestoneLabel(m.kind, order.needsProduct),
            state: m.completedAt ? 'done' : next?.id === m.id ? 'current' : 'upcoming',
            dateText: m.completedAt
              ? fmtDateTime(m.completedAt)
              : expected.has(m.id)
                ? `Expected ${fmtDate(expected.get(m.id)!)}`
                : null,
            deliveredLink: m.id === latestDelivery?.id ? m.deliveredLink : null,
          }))}
          statusLabel={status}
          done={done}
        />
      </div>

      {/* What they handed us: readable back after confirmation */}
      {!strategyOpen && onboarding?.confirmed && (
        <details className="rounded-2xl border border-border bg-paper px-5 py-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink-900 select-none">
            Your onboarding <span className="text-text-400 font-normal">received</span>
          </summary>
          <div className="mt-3 space-y-3">
            {onboarding.briefLink && (
              <p className="text-sm">
                <a href={onboarding.briefLink} target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:underline break-all">
                  Your brief
                </a>
              </p>
            )}
            {answered.map((q) => (
              <div key={q.field}>
                <div className="text-xs uppercase tracking-wider text-text-400 font-semibold">{q.label}</div>
                <p className="text-sm text-text-700 whitespace-pre-wrap break-words mt-0.5">{onboarding.fields[q.field]}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Updates: client-visible notes, newest first */}
      {clientNotes.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-text-400 font-semibold mb-3">Updates</h2>
          <ul className="space-y-3">
            {clientNotes.map((n) => (
              <li key={n.id} className="rounded-xl bg-paper border border-border p-4">
                <div className="text-xs text-text-400 mb-1">{fmtDate(n.date)}</div>
                <p className="text-sm text-text-700 whitespace-pre-wrap break-words">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Other orders: switcher + history */}
      {otherOrders.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-text-400 font-semibold mb-3">Your other orders</h2>
          <ul className="space-y-2">
            {otherOrders.map(({ order: o, status: s, deliveredLinks }) => (
              <li key={o.id} className="rounded-xl bg-paper border border-border p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1 basis-40">
                  <Link href={`/orders/${o.id}`} className="text-sm font-semibold text-ink-900 hover:text-accent break-words">
                    {o.title}
                  </Link>
                  <div className="text-xs text-text-400">{o.brand || brandFallback}</div>
                </div>
                <span className="text-xs text-text-400">{s}</span>
                {deliveredLinks.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-semibold hover:underline">
                    {l.label}
                  </a>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
