import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { addDaysISO, todayISO } from './format';
import {
  DELIVERY_KINDS,
  FEEDBACK_WINDOW_DAYS,
  INITIAL_TEMPLATE,
  MilestoneKind,
  Owner,
  canStartRevisionRound,
  defaultMilestones,
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
  targetDate: string; // YYYY-MM-DD
}

/**
 * Create an order with its 5 template milestones. `overrides` carries the
 * (editable-before-save) owners/dates from the new-order form; omitted → pure
 * defaults from today.
 */
export async function createOrder(
  accountId: string,
  title: string,
  brand: string | null,
  overrides?: NewOrderMilestone[],
  placedDate?: string, // YYYY-MM-DD; backdatable, defaults to today
): Promise<string> {
  const milestones = overrides ?? defaultMilestones(placedDate);
  const expectedKinds = INITIAL_TEMPLATE.map((t) => t.kind);
  if (
    milestones.length !== expectedKinds.length ||
    !milestones.every((m, i) => m.kind === expectedKinds[i])
  ) {
    throw new EngineError('bad_template', 'New orders must contain exactly the 5 template milestones in order');
  }

  const [order] = await db()
    .insert(tables.orders)
    .values({
      accountId,
      title,
      brand: brand || null,
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
        targetDate: m.targetDate,
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

  // A revised delivery opens a fresh feedback window: the terminal "Order
  // completed" target resets to revised delivery + 10 days (spec §Defaults).
  if (target.kind === 'revised_delivered') {
    await db()
      .update(tables.milestones)
      .set({ targetDate: addDaysISO(todayISO(), FEEDBACK_WINDOW_DAYS) })
      .where(
        and(
          eq(tables.milestones.orderId, target.orderId),
          eq(tables.milestones.kind, 'completed'),
          isNull(tables.milestones.completedAt),
        ),
      );
  }
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
    return;
  }

  await db().update(tables.milestones).set({ completedAt: null }).where(eq(tables.milestones.id, last.id));
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
}

/** Per-order edits from the client-detail view. Dates never auto-shift (v1). */
export async function updateMilestone(
  milestoneId: string,
  patch: { owner?: Owner; targetDate?: string | null },
): Promise<void> {
  if (patch.owner === undefined && patch.targetDate === undefined) return;
  await db()
    .update(tables.milestones)
    .set({
      ...(patch.owner !== undefined ? { owner: patch.owner } : {}),
      ...(patch.targetDate !== undefined ? { targetDate: patch.targetDate } : {}),
    })
    .where(eq(tables.milestones.id, milestoneId));
}
