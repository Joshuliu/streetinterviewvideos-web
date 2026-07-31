/**
 * Smoke test for lib/crm — runs the full order lifecycle against the DB in
 * DATABASE_URL. Usage:
 *   set -a; source .env.local; set +a; npx tsx scripts/crm-engine-smoke.ts
 * Creates its own throwaway order and deletes it at the end.
 */
import { asc, eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { completeMilestone, createOrder, startRevisionRound, undoLastCompleted, updateMilestone } from '@/lib/crm/engine';
import { deriveStatus, expectedDates, isOrderCompleted, milestoneLabel } from '@/lib/crm/status';
import { todayISO } from '@/lib/crm/format';

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗ FAIL'} ${label}${ok ? '' : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

async function expectError(label: string, code: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    failures++;
    console.log(`✗ FAIL ${label} — expected error '${code}', got success`);
  } catch (e: any) {
    check(label, e.code ?? e.message, code);
  }
}

async function milestonesOf(orderId: string) {
  return db().select().from(tables.milestones).where(eq(tables.milestones.orderId, orderId)).orderBy(asc(tables.milestones.sequence));
}

async function status(orderId: string) {
  return deriveStatus(await milestonesOf(orderId));
}

async function main() {
  // Its own throwaway account, not the first real one: prod and dev share this
  // DB, and a smoke order hanging off a paying client would show up on their
  // studio dashboard for as long as the run takes.
  const [acct] = await db()
    .insert(tables.accounts)
    .values({ name: 'Smoke Test (auto-deleted)', company: 'SmokeCo' })
    .returning({ id: tables.accounts.id });

  const orderId = await createOrder(acct.id, 'Smoke Test Order', 'SmokeBrand');
  let ms = await milestonesOf(orderId);
  check('order spawns 6 milestones', ms.length, 6);
  check('initial status', await status(orderId), 'Onboarding in progress');
  check(
    'owners: the client owns two of them',
    ms.map((m) => m.owner),
    ['client', 'neil', 'client', 'neil', 'josh', 'josh'],
  );
  const dayDiff = (a: string, b: string) => Math.round((+new Date(a) - +new Date(b)) / 86400000);
  // Business-timezone today, same as the engine (UTC is a day ahead of PT
  // every evening, which used to fail the offset checks after 5pm).
  const today = todayISO();
  // ONE stored deadline: the first step's. The rest are projected, so an order
  // is never born with five dates it can already be late for.
  check('only the next step carries a date', ms.map((m) => m.targetDate !== null), [true, false, false, false, false, false]);
  check('first deadline is placed + 2', dayDiff(ms[0].targetDate!, today), 2);
  // Expected dates cover EVERY open step, the current one included: the first
  // is its own deadline, the rest roll forward from it one gap at a time.
  check(
    'expected dates run 2/7/12/16/26/36 out',
    [...expectedDates(ms).values()].map((d) => dayDiff(d, today)),
    [2, 7, 12, 16, 26, 36],
  );
  // The approval step is named for what the order actually needs.
  check('approval label with a product', milestoneLabel('approval', true), 'Brief approved & product sent');
  check('approval label without one', milestoneLabel('approval', false), 'Brief approved');
  check('other labels ignore the flag', milestoneLabel('shoot', false), 'Shoot completed');
  const noProductId = await createOrder(acct.id, 'Smoke Test App Order', 'SmokeApp', undefined, undefined, false);
  const [noProduct] = await db().select().from(tables.orders).where(eq(tables.orders.id, noProductId));
  check('an order can say it has nothing to ship', noProduct.needsProduct, false);
  await expectError('setting a deadline on a later step rejected', 'not_next', () =>
    updateMilestone(ms[3].id, { targetDate: today }),
  );

  await expectError('completing shoot out of sequence rejected', 'out_of_sequence', () => completeMilestone(ms[3].id));
  await expectError('start revision before delivery rejected', 'not_in_revision_window', () => startRevisionRound(orderId));

  await completeMilestone(ms[0].id);
  check('strategy done → Scripting in progress', await status(orderId), 'Scripting in progress');
  ms = await milestonesOf(orderId);
  check('scripting picks up the live deadline, today + 5', dayDiff(ms[1].targetDate!, today), 5);
  // A COMPLETED step keeps the date it was completed against — that's the
  // record of what we promised. Only open steps hand theirs back.
  check('and it is the only open one', ms.filter((m) => !m.completedAt && m.targetDate !== null).map((m) => m.kind), ['scripting']);
  await undoLastCompleted(orderId);
  check('undo → back to Onboarding in progress', await status(orderId), 'Onboarding in progress');
  ms = await milestonesOf(orderId);
  check(
    'undo hands the deadline back to strategy',
    ms.filter((m) => !m.completedAt && m.targetDate !== null).map((m) => m.kind),
    ['strategy'],
  );

  await completeMilestone(ms[0].id);
  await completeMilestone(ms[1].id);
  check('scripting done → Awaiting client approval', await status(orderId), 'Awaiting client approval');
  ms = await milestonesOf(orderId);
  check('the blocked step is the client\'s, so no admin board sees it', ms[2].owner, 'client');
  await completeMilestone(ms[2].id);
  check('approval done → Pre-production', await status(orderId), 'Pre-production (casting & scheduling)');
  await completeMilestone(ms[3].id);
  check('shoot done → Post-production', await status(orderId), 'Post-production (editing)');

  await expectError('delivery without link rejected', 'link_required', () => completeMilestone(ms[4].id));
  await completeMilestone(ms[4].id, 'https://drive.example.com/final-v1');
  check('delivered → Optional revisions', await status(orderId), 'Optional revisions');

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  check('revision round adds 2 milestones', ms.length, 8);
  check('round start → Revisions in progress', await status(orderId), 'Revisions in progress');
  check('terminal slid to sequence 8', ms.find((m) => m.kind === 'completed')!.sequence, 8);
  check(
    'the revised delivery took over the live deadline',
    ms.filter((m) => !m.completedAt && m.targetDate !== null).map((m) => m.kind),
    ['revised_delivered'],
  );

  await undoLastCompleted(orderId);
  ms = await milestonesOf(orderId);
  check('undo cancels round: 6 milestones again', ms.length, 6);
  check('round cancelled → Optional revisions', await status(orderId), 'Optional revisions');
  check('terminal back to sequence 6', ms.find((m) => m.kind === 'completed')!.sequence, 6);
  check(
    'and the terminal has its deadline back',
    ms.filter((m) => !m.completedAt && m.targetDate !== null).map((m) => m.kind),
    ['completed'],
  );

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  const revised = ms.find((m) => m.kind === 'revised_delivered')!;
  await expectError('revised delivery without link rejected', 'link_required', () => completeMilestone(revised.id));
  await completeMilestone(revised.id, 'https://drive.example.com/final-v2');
  check('revised delivered → auto-completes order', await status(orderId), 'Completed');
  check('isOrderCompleted after revised delivery', isOrderCompleted(await milestonesOf(orderId)), true);
  await expectError('no new round on a completed order', 'not_in_revision_window', () => startRevisionRound(orderId));

  await undoLastCompleted(orderId);
  check('undo terminal → back to Optional revisions', await status(orderId), 'Optional revisions');

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  check('second round: 10 milestones', ms.length, 10);
  const revised2 = ms.filter((m) => m.kind === 'revised_delivered').find((m) => !m.completedAt)!;
  await completeMilestone(revised2.id, 'https://drive.example.com/final-v3');
  check('second revised delivery → Completed', await status(orderId), 'Completed');
  check('isOrderCompleted', isOrderCompleted(await milestonesOf(orderId)), true);
  await expectError('completing past terminal rejected', 'not_found', async () => {
    const next = (await milestonesOf(orderId)).find((m) => !m.completedAt);
    if (!next) throw Object.assign(new Error('nothing left'), { code: 'not_found' });
    await completeMilestone(next.id);
  });

  await db().delete(tables.accounts).where(eq(tables.accounts.id, acct.id));
  check('cleanup: account deleted (order + milestones cascade)', (await milestonesOf(orderId)).length, 0);

  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
