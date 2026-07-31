import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { addDaysISO, dateISO, todayISO } from './format';
import {
  DELIVERY_KINDS,
  FEEDBACK_WINDOW_DAYS,
  INITIAL_TEMPLATE,
  MilestoneKind,
  Owner,
  canStartRevisionRound,
  defaultMilestones,
  dueAfter,
  lastCompletedMilestone,
  nextIncomplete,
} from './status';

// DB mutations for the order pipeline. Every function re-reads the order's
// milestones and enforces the sequencing rules server-side: the UI's
// "next-incomplete only" is a convenience, not the guard.

export class EngineError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

async function orderMilestones(orderId: string) {
  return db()
    .select()
    .from(tables.milestones)
    .where(eq(tables.milestones.orderId, orderId))
    .orderBy(asc(tables.milestones.sequence));
}

export interface NewOrderMilestone {
  kind: MilestoneKind;
  owner: Owner;
  targetDate: string; // YYYY-MM-DD — only the first one's is kept, see createOrder
}

/**
 * ONE live deadline per order: the next incomplete milestone carries a date,
 * every step behind it carries none (the views project those instead). Run
 * after anything that changes which milestone is next.
 *
 * A step that becomes next with no date gets one counted from THE LAST
 * COMPLETION, not from the order's creation — the schedule restarts from the
 * moment the previous step actually finished, so a stalled order comes back
 * with a deadline it can still meet rather than one that was already blown
 * before the work could start. (In the normal flow that completion is happening
 * right now, so this is "today"; it differs only for backdated completions,
 * where dating from the real event is the honest answer.) A date that's already
 * set — the first milestone at creation, or a hand-edited one — is left alone:
 * it's a promise someone made on purpose.
 */
async function resyncDeadlines(orderId: string): Promise<void> {
  const milestones = await orderMilestones(orderId);
  const next = nextIncomplete(milestones);
  const last = lastCompletedMilestone(milestones);
  const from = last?.completedAt ? dateISO(last.completedAt) : todayISO();
  for (const m of milestones) {
    if (m.completedAt) continue;
    const wanted = next && m.id === next.id ? m.targetDate ?? dueAfter(m.kind, from) : null;
    if (wanted === m.targetDate) continue;
    await db().update(tables.milestones).set({ targetDate: wanted }).where(eq(tables.milestones.id, m.id));
  }
}

/**
 * Create an order with its template milestones. `overrides` carries the
 * (editable-before-save) owners/dates from the new-order form; omitted → pure
 * defaults from today. Only the FIRST milestone's date is stored: see
 * resyncDeadlines for why the rest start life dateless.
 */
export async function createOrder(
  accountId: string,
  title: string,
  brand: string,
  overrides?: NewOrderMilestone[],
  placedDate?: string, // YYYY-MM-DD; backdatable, defaults to today
  needsProduct = true, // false for apps/services with nothing to ship
): Promise<string> {
  if (!brand.trim()) throw new EngineError('brand_required', 'Every order needs a brand');
  const milestones = overrides ?? defaultMilestones(placedDate);
  const expectedKinds = INITIAL_TEMPLATE.map((t) => t.kind);
  if (
    milestones.length !== expectedKinds.length ||
    !milestones.every((m, i) => m.kind === expectedKinds[i])
  ) {
    throw new EngineError('bad_template', 'New orders must contain exactly the template milestones, in order');
  }

  const [order] = await db()
    .insert(tables.orders)
    .values({
      accountId,
      title,
      brand: brand.trim(),
      needsProduct,
      // Noon UTC on the placed date lands on the same calendar day in PT.
      ...(placedDate ? { createdAt: new Date(`${placedDate}T19:00:00Z`) } : {}),
    })
    .returning({ id: tables.orders.id });
  await db()
    .insert(tables.milestones)
    .values(
      milestones.map((m, i) => ({
        orderId: order.id,
        kind: m.kind,
        sequence: i + 1,
        owner: m.owner,
        // The only committed date at creation. Steps 2+ get theirs when they
        // become next; until then the views project them.
        targetDate: i === 0 ? m.targetDate : null,
      })),
    );
  return order.id;
}

/**
 * Complete the next incomplete milestone. Completing anything else is an
 * error. Delivery milestones require the delivery link: that link is what
 * the client opens from the dashboard.
 */
export async function completeMilestone(milestoneId: string, deliveredLink?: string): Promise<void> {
  const [target] = await db().select().from(tables.milestones).where(eq(tables.milestones.id, milestoneId));
  if (!target) throw new EngineError('not_found', 'Milestone not found');
  if (target.completedAt) throw new EngineError('already_completed', 'Milestone is already completed');

  const milestones = await orderMilestones(target.orderId);
  const next = nextIncomplete(milestones);
  if (!next || next.id !== target.id) {
    throw new EngineError('out_of_sequence', 'Finish the earlier steps first: milestones complete in order');
  }
  if (DELIVERY_KINDS.has(target.kind) && !deliveredLink?.trim()) {
    throw new EngineError('link_required', 'A delivery link is required to complete this milestone');
  }

  const updated = await db()
    .update(tables.milestones)
    .set({
      completedAt: new Date(),
      ...(DELIVERY_KINDS.has(target.kind) ? { deliveredLink: deliveredLink!.trim() } : {}),
    })
    .where(and(eq(tables.milestones.id, milestoneId), isNull(tables.milestones.completedAt)))
    .returning({ id: tables.milestones.id });
  if (updated.length === 0) throw new EngineError('already_completed', 'Milestone is already completed');

  // A revised delivery closes the order: the terminal "Order completed"
  // milestone completes in the same stroke (no second feedback window).
  // Undoing "Order completed" reopens the order if another round is needed.
  if (target.kind === 'revised_delivered') {
    await db()
      .update(tables.milestones)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(tables.milestones.orderId, target.orderId),
          eq(tables.milestones.kind, 'completed'),
          isNull(tables.milestones.completedAt),
        ),
      );
  }

  // The step that just became next starts its clock now.
  await resyncDeadlines(target.orderId);
}

/**
 * Undo the most recent completion (the status flip's escape hatch). Special
 * case: if the last completion is 'revisions_ordered', the whole revision
 * round is cancelled: the auto-completed event and its pending
 * 'revised_delivered' are deleted and the terminal milestone slides back.
 */
export async function undoLastCompleted(orderId: string): Promise<void> {
  const milestones = await orderMilestones(orderId);
  const last = lastCompletedMilestone(milestones);
  if (!last) throw new EngineError('nothing_to_undo', 'No completed milestones on this order');

  if (last.kind === 'revisions_ordered') {
    const pending = milestones.find(
      (m) => m.kind === 'revised_delivered' && m.sequence === last.sequence + 1 && !m.completedAt,
    );
    await db().delete(tables.milestones).where(eq(tables.milestones.id, last.id));
    if (pending) await db().delete(tables.milestones).where(eq(tables.milestones.id, pending.id));
    await db()
      .update(tables.milestones)
      .set({ sequence: sql`${tables.milestones.sequence} - 2` })
      .where(and(eq(tables.milestones.orderId, orderId), eq(tables.milestones.kind, 'completed')));
    await resyncDeadlines(orderId);
    return;
  }

  await db().update(tables.milestones).set({ completedAt: null }).where(eq(tables.milestones.id, last.id));
  // The undone step is next again and keeps the deadline it was completed
  // against; whatever followed it hands its date back.
  await resyncDeadlines(orderId);
}

/**
 * Start a revision round (only while status is "Optional revisions").
 * 'Revisions ordered' is an event, not work: it completes immediately and
 * flips the status to "Revisions in progress"; the spawned
 * 'Revised order delivered' milestone is the actual task. Repeatable.
 */
export async function startRevisionRound(orderId: string): Promise<void> {
  const milestones = await orderMilestones(orderId);
  if (!canStartRevisionRound(milestones)) {
    throw new EngineError('not_in_revision_window', 'Revisions can only start while the order is in "Optional revisions"');
  }
  const terminal = milestones.find((m) => m.kind === 'completed' && !m.completedAt);
  if (!terminal) throw new EngineError('no_terminal', 'Order has no open "Order completed" milestone');

  const base = terminal.sequence;
  // Slide the terminal milestone out of the way first so the (order_id,
  // sequence) unique index never collides.
  await db()
    .update(tables.milestones)
    .set({ sequence: base + 2 })
    .where(eq(tables.milestones.id, terminal.id));
  await db()
    .insert(tables.milestones)
    .values([
      { orderId, kind: 'revisions_ordered', sequence: base, owner: 'josh', completedAt: new Date() },
      { orderId, kind: 'revised_delivered', sequence: base + 1, owner: 'josh', targetDate: addDaysISO(todayISO(), FEEDBACK_WINDOW_DAYS) },
    ]);
  // The terminal milestone hands its date back to the revised delivery, which
  // is now the next step.
  await resyncDeadlines(orderId);
}

/**
 * Per-order edits from the client-detail view. A date can only be set on the
 * step that's actually next: the others are projections, and writing one back
 * would recreate the deadline-per-milestone mess this replaced. Dates never
 * auto-shift — moving the next step's date moves the projection with it.
 */
export async function updateMilestone(
  milestoneId: string,
  patch: { owner?: Owner; targetDate?: string | null },
): Promise<void> {
  if (patch.owner === undefined && patch.targetDate === undefined) return;
  if (patch.targetDate !== undefined) {
    const [target] = await db().select().from(tables.milestones).where(eq(tables.milestones.id, milestoneId));
    if (!target) throw new EngineError('not_found', 'Milestone not found');
    const next = nextIncomplete(await orderMilestones(target.orderId));
    if (!next || next.id !== milestoneId) {
      throw new EngineError('not_next', 'Only the next step carries a deadline: the rest are expected dates');
    }
  }
  await db()
    .update(tables.milestones)
    .set({
      ...(patch.owner !== undefined ? { owner: patch.owner } : {}),
      ...(patch.targetDate !== undefined ? { targetDate: patch.targetDate } : {}),
    })
    .where(eq(tables.milestones.id, milestoneId));
}
