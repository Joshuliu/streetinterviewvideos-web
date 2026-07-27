import { milestoneKindEnum, ownerEnum } from '@/lib/db/schema';

// Pure status/pipeline logic — no DB access in this module. The pipeline is
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
  strategy: { label: 'Strategy completed', statusAfter: 'Scripting in progress' },
  scripting: { label: 'Scripting completed', statusAfter: 'Pre-production (casting & scheduling)' },
  shoot: { label: 'Shoot completed', statusAfter: 'Post-production (editing)' },
  delivered: { label: 'Order delivered', statusAfter: 'Optional revisions' },
  revisions_ordered: { label: 'Revisions ordered', statusAfter: 'Revisions in progress' },
  revised_delivered: { label: 'Revised order delivered', statusAfter: 'Optional revisions' },
  completed: { label: 'Order completed', statusAfter: 'Completed' },
};

/** Kinds whose completion requires a delivery link (opened from the dashboard). */
export const DELIVERY_KINDS: ReadonlySet<MilestoneKind> = new Set(['delivered', 'revised_delivered']);

/** The client feedback window: days from a delivery to auto-close eligibility. */
export const FEEDBACK_WINDOW_DAYS = 10;

// The 5 milestones spawned at order creation. Owner split: Neil through the
// shoot, Joshua post-production. Offsets are days from order creation.
export const INITIAL_TEMPLATE: ReadonlyArray<{ kind: MilestoneKind; owner: Owner; offsetDays: number }> = [
  { kind: 'strategy', owner: 'neil', offsetDays: 2 },
  { kind: 'scripting', owner: 'neil', offsetDays: 7 },
  { kind: 'shoot', owner: 'neil', offsetDays: 11 },
  { kind: 'delivered', owner: 'josh', offsetDays: 21 },
  { kind: 'completed', owner: 'josh', offsetDays: 21 + FEEDBACK_WINDOW_DAYS },
];

export function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Prefill for the new-order form: template with concrete dates. */
export function defaultMilestones(creationDate: Date = new Date()) {
  return INITIAL_TEMPLATE.map((t, i) => ({
    kind: t.kind,
    sequence: i + 1,
    owner: t.owner,
    targetDate: addDays(creationDate, t.offsetDays),
  }));
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
