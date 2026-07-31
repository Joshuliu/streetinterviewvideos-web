/**
 * One-off backfill for the 2026-07-31 pipeline change (run AFTER the deploy
 * that teaches the app the 'approval' kind — prod and dev share this DB):
 *
 *   set -a; source .env.local; set +a; npx tsx scripts/crm-backfill-approval-step.ts
 *
 * Three things, all idempotent:
 *
 * 1. Inserts the client-approval step ("Brief approved & product sent") after
 *    Scripting on every order that hasn't been shot yet. Orders already past
 *    the shoot are left alone: the hand-off happened off-system for those, and
 *    inserting an open step into a delivered order would drag its status back.
 * 2. Collapses the deadline sprawl: on every open order, only the NEXT step
 *    keeps a target date. The rest are projected at render time now, so their
 *    stored dates are dead weight that reads as overdue.
 * 3. Boya's order specifically: she came through the old flow, which had no
 *    onboarding step at all, and she's been sitting on our brief since June.
 *    Marks Onboarding received (her order date) and Scripting completed
 *    (Jun 22) so her order parks where it actually is — on her.
 */
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { dateISO, todayISO } from '@/lib/crm/format';
import { dueAfter, lastCompletedMilestone, nextIncomplete } from '@/lib/crm/status';

const BOYA = {
  orderTitle: 'Experiment videos - $1,500',
  strategyDoneAt: new Date('2026-06-17T19:00:00Z'), // noon PT on her order date
  scriptingDoneAt: new Date('2026-06-22T19:00:00Z'),
};

async function milestonesOf(orderId: string) {
  return db().select().from(tables.milestones).where(eq(tables.milestones.orderId, orderId)).orderBy(asc(tables.milestones.sequence));
}

async function main() {
  const d = db();
  const orders = await d.select().from(tables.orders);
  const accounts = await d.select().from(tables.accounts);
  const name = (id: string) => accounts.find((a) => a.id === id)?.name ?? '?';

  for (const order of orders) {
    let ms = await milestonesOf(order.id);
    const label = `${name(order.accountId)} · ${order.title}`;

    // --- 1. Insert the approval step where the pipeline is still ahead of it
    const shoot = ms.find((m) => m.kind === 'shoot');
    const scripting = ms.find((m) => m.kind === 'scripting');
    if (ms.some((m) => m.kind === 'approval')) {
      console.log(`= ${label}: already has the approval step`);
    } else if (!shoot || shoot.completedAt || !scripting) {
      console.log(`- ${label}: past the shoot (or non-standard), left alone`);
    } else {
      // Renumber from the top down so the (order_id, sequence) unique index
      // never sees a collision mid-shuffle.
      for (const m of [...ms].filter((m) => m.sequence > scripting.sequence).sort((a, b) => b.sequence - a.sequence)) {
        await d.update(tables.milestones).set({ sequence: m.sequence + 1 }).where(eq(tables.milestones.id, m.id));
      }
      await d.insert(tables.milestones).values({
        orderId: order.id,
        kind: 'approval',
        sequence: scripting.sequence + 1,
        owner: 'client',
      });
      console.log(`+ ${label}: approval step inserted at sequence ${scripting.sequence + 1}`);
      ms = await milestonesOf(order.id);
    }

    // --- 3. Boya: the old flow skipped onboarding; the brief went out in June
    if (order.title === BOYA.orderTitle) {
      const strategy = ms.find((m) => m.kind === 'strategy');
      const scripting2 = ms.find((m) => m.kind === 'scripting');
      if (strategy && !strategy.completedAt) {
        await d.update(tables.milestones).set({ completedAt: BOYA.strategyDoneAt }).where(eq(tables.milestones.id, strategy.id));
        console.log(`✓ ${label}: onboarding marked received (backdated)`);
      }
      if (scripting2 && !scripting2.completedAt) {
        await d.update(tables.milestones).set({ completedAt: BOYA.scriptingDoneAt }).where(eq(tables.milestones.id, scripting2.id));
        console.log(`✓ ${label}: scripting marked completed (backdated)`);
      }
      ms = await milestonesOf(order.id);
    }

    // --- 2. One live deadline per order, dated from the last completion (the
    // same rule resyncDeadlines applies from here on). Boya's approval step
    // therefore dates from when we sent the brief, not from today: the client
    // page should say how long she's been sitting on it.
    const next = nextIncomplete(ms);
    const last = lastCompletedMilestone(ms);
    const from = last?.completedAt ? dateISO(last.completedAt) : todayISO();
    for (const m of ms) {
      if (m.completedAt) continue;
      const wanted = next && m.id === next.id ? m.targetDate ?? dueAfter(m.kind, from) : null;
      if (wanted === m.targetDate) continue;
      await d.update(tables.milestones).set({ targetDate: wanted }).where(eq(tables.milestones.id, m.id));
      console.log(`  ${label}: ${m.kind} deadline ${m.targetDate ?? 'none'} → ${wanted ?? 'none (expected instead)'}`);
    }
  }

  // What every open order now reads as
  console.log('\nOpen orders:');
  for (const order of orders) {
    const ms = await milestonesOf(order.id);
    const next = nextIncomplete(ms);
    if (!next) continue;
    console.log(
      `  ${name(order.accountId)} · ${order.title} → next: ${next.kind} (${next.owner}) deadline ${next.targetDate ?? 'none'}`,
    );
  }

  // Nothing incomplete should hold a date except a next step (the invariant
  // the engine keeps from here on).
  const stray = await d
    .select({ id: tables.milestones.id, orderId: tables.milestones.orderId, kind: tables.milestones.kind })
    .from(tables.milestones)
    .where(and(isNull(tables.milestones.completedAt), isNull(tables.milestones.targetDate)));
  console.log(`\n${stray.length} open non-next milestones now carry no stored date (expected: projected instead)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
