import { milestoneKindEnum, ownerEnum } from '@/lib/db/schema';
import { addDaysISO, todayISO } from './format';

// Pure status/pipeline logic: no DB access in this module. The pipeline is
// fixed in code by design (docs/crm_requirements.md, non-goals).

export type MilestoneKind = (typeof milestoneKindEnum.enumValues)[number];
export type Owner = (typeof ownerEnum.enumValues)[number];

export interface MilestoneShape {
  kind: MilestoneKind;
  sequence: number;
  completedAt: Date | null;
}

// Status is a pure function of the last completed milestone. Milestones
// complete in sequence, so "last completed" = highest completed sequence.
export const STATUS_BEFORE_ANYTHING = 'Onboarding in progress';

export const MILESTONE_META: Record<MilestoneKind, { label: string; statusAfter: string }> = {
  strategy: { label: 'Onboarding received', statusAfter: 'Scripting in progress' },
  scripting: { label: 'Scripting completed', statusAfter: 'Awaiting client approval' },
  approval: { label: 'Brief approved & product sent', statusAfter: 'Pre-production (casting & scheduling)' },
  shoot: { label: 'Shoot completed', statusAfter: 'Post-production (editing)' },
  delivered: { label: 'Order delivered', statusAfter: 'Optional revisions' },
  revisions_ordered: { label: 'Revisions ordered', statusAfter: 'Revisions in progress' },
  revised_delivered: { label: 'Revised order delivered', statusAfter: 'Optional revisions' },
  completed: { label: 'Order completed', statusAfter: 'Completed' },
};

/**
 * A milestone's display name for a GIVEN ORDER. Only 'approval' varies: an app
 * or a service has nothing to ship, so naming the step after a product that
 * doesn't exist reads as a mistake to the client and as a phantom blocker to
 * us. Everything user-facing goes through here rather than
 * MILESTONE_META[kind].label, which is only the with-product default.
 */
export function milestoneLabel(kind: MilestoneKind, needsProduct: boolean | null = true): string {
  if (kind === 'approval' && !needsProduct) return 'Brief approved';
  return MILESTONE_META[kind].label;
}

/**
 * The two steps only the client can finish, and what we're waiting for. An
 * order sits on one of these more often than on anything we do, so both the
 * team's order card and the client's tracker name the blocker out loud
 * instead of showing a silently stalled pipeline.
 */
export function clientStepCopy(
  kind: MilestoneKind,
  needsProduct: boolean | null = true,
): { waitingOnClient: string; waitingOnYou: string } | null {
  if (kind === 'strategy') {
    return {
      waitingOnClient: 'Waiting on the client: onboarding form or a brief link, from their dashboard.',
      waitingOnYou: 'We need your brief. Fill in the onboarding below, or drop a link to your own doc.',
    };
  }
  if (kind === 'approval') {
    return needsProduct
      ? {
          waitingOnClient: 'Waiting on the client: approve the brief we sent, and get the product to the host.',
          waitingOnYou:
            'We need two things from you: approve the brief we sent over, and get the product to our host. Shooting starts once both land.',
        }
      : {
          waitingOnClient: 'Waiting on the client: approve the brief we sent.',
          waitingOnYou: 'We need your sign-off on the brief we sent over. Shooting starts once it lands.',
        };
  }
  return null;
}

/** Kinds whose completion requires a delivery link (opened from the dashboard). */
export const DELIVERY_KINDS: ReadonlySet<MilestoneKind> = new Set(['delivered', 'revised_delivered']);

/** The client feedback window: days from a delivery to auto-close eligibility. */
export const FEEDBACK_WINDOW_DAYS = 10;

/** Display names for milestone owners (selects and badges). */
export const OWNER_LABELS: Record<Owner, string> = { josh: 'Joshua', neil: 'Neil', client: 'Client' };

/**
 * How long each step gets ONCE IT STARTS: days from the previous milestone
 * finishing to this one's deadline. Gaps, not offsets from order creation,
 * because a schedule is only ever anchored to the last thing that actually
 * happened (a client sitting on their approval for three weeks moves
 * everything behind it; it doesn't make the shoot late).
 */
export const GAP_DAYS: Record<MilestoneKind, number> = {
  strategy: 2,
  scripting: 5,
  approval: 5,
  shoot: 4,
  delivered: 10,
  revisions_ordered: 0, // an event, never dated
  revised_delivered: FEEDBACK_WINDOW_DAYS,
  completed: FEEDBACK_WINDOW_DAYS,
};

// The 6 milestones spawned at order creation. Owner split: the CLIENT owns two
// of them — strategy (they hand us the onboarding form or a brief from studio.)
// and approval (they sign off on our brief and get the product to the host,
// added 2026-07-31) — Neil owns scripting and the shoot, Joshua
// post-production. Client-owned milestones appear on no admin's task board,
// which is the whole point: while the ball is in their court nothing sits on
// ours going overdue.
export const INITIAL_TEMPLATE: ReadonlyArray<{ kind: MilestoneKind; owner: Owner }> = [
  { kind: 'strategy', owner: 'client' },
  { kind: 'scripting', owner: 'neil' },
  { kind: 'approval', owner: 'client' },
  { kind: 'shoot', owner: 'neil' },
  { kind: 'delivered', owner: 'josh' },
  { kind: 'completed', owner: 'josh' },
];

/** The deadline a step earns when it becomes the next one, counted from `fromISO`. */
export function dueAfter(kind: MilestoneKind, fromISO: string = todayISO()): string {
  return addDaysISO(fromISO, GAP_DAYS[kind]);
}

/**
 * Prefill for the new-order form: the whole chain rolled forward from the
 * placed date. Only the FIRST date is a real deadline that gets stored — the
 * rest are the same projection the order will show once it's live.
 */
export function defaultMilestones(placedISO: string = todayISO()) {
  let date = placedISO;
  return INITIAL_TEMPLATE.map((t, i) => {
    date = dueAfter(t.kind, date);
    return { kind: t.kind, sequence: i + 1, owner: t.owner, targetDate: date };
  });
}

function lastCompleted<M extends MilestoneShape>(milestones: M[]): M | null {
  let last: M | null = null;
  for (const m of milestones) {
    if (m.completedAt && (!last || m.sequence > last.sequence)) last = m;
  }
  return last;
}

/** The client-visible order status. Derived, never stored. */
export function deriveStatus(milestones: MilestoneShape[]): string {
  const last = lastCompleted(milestones);
  return last ? MILESTONE_META[last.kind].statusAfter : STATUS_BEFORE_ANYTHING;
}

/** The only milestone allowed to complete next (lowest incomplete sequence). */
export function nextIncomplete<M extends MilestoneShape>(milestones: M[]): M | null {
  let next: M | null = null;
  for (const m of milestones) {
    if (!m.completedAt && (!next || m.sequence < next.sequence)) next = m;
  }
  return next;
}

/**
 * Expected dates for EVERY open step — the plan, as opposed to the deadline.
 *
 * Two different numbers, on purpose:
 * - the DEADLINE is stored on the next step only, defaults to the last
 *   completion plus that step's gap, and is ours to change. It's what the task
 *   board runs on and the only date that can read "overdue".
 * - the EXPECTED date is derived and shown everywhere, clients included. It
 *   starts from the next step's deadline and rolls forward one GAP_DAYS at a
 *   time, so the whole tail moves the moment we move the one date we own.
 *
 * Never in the past: a plan that's already behind is not a plan, so the chain
 * starts from today whenever the deadline has passed. Lateness shows up on the
 * internal deadline, which is where someone can do something about it.
 */
export function expectedDates<M extends MilestoneShape & { id: string; targetDate: string | null }>(
  milestones: M[],
): Map<string, string> {
  const out = new Map<string, string>();
  const next = nextIncomplete(milestones);
  if (!next) return out;
  const today = todayISO();
  let date = next.targetDate && next.targetDate > today ? next.targetDate : today;
  for (const m of [...milestones].sort((a, b) => a.sequence - b.sequence)) {
    if (m.completedAt || m.sequence < next.sequence) continue;
    if (m.id !== next.id) date = dueAfter(m.kind, date);
    out.set(m.id, date);
  }
  return out;
}

/** The only milestone allowed to un-complete (highest completed sequence). */
export function lastCompletedMilestone<M extends MilestoneShape>(milestones: M[]): M | null {
  return lastCompleted(milestones);
}

/** A revision round can start only while the client is in their feedback window. */
export function canStartRevisionRound(milestones: MilestoneShape[]): boolean {
  const last = lastCompleted(milestones);
  return last !== null && (last.kind === 'delivered' || last.kind === 'revised_delivered');
}

/** Terminal: the order archives once 'completed' is completed. */
export function isOrderCompleted(milestones: MilestoneShape[]): boolean {
  return milestones.some((m) => m.kind === 'completed' && m.completedAt !== null);
}
