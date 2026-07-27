/**
 * Smoke test for lib/crm — runs the full order lifecycle against the DB in
 * DATABASE_URL. Usage:
 *   set -a; source .env.local; set +a; npx tsx scripts/crm-engine-smoke.ts
 * Creates its own throwaway order and deletes it at the end.
 */
import { asc, eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { completeMilestone, createOrder, startRevisionRound, undoLastCompleted } from '@/lib/crm/engine';
import { deriveStatus, isOrderCompleted } from '@/lib/crm/status';

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
  const [acct] = await db().select().from(tables.accounts).limit(1);
  if (!acct) throw new Error('No account in DB — seed first');

  const orderId = await createOrder(acct.id, 'Smoke Test Order', 'SmokeBrand');
  let ms = await milestonesOf(orderId);
  check('order spawns 5 milestones', ms.length, 5);
  check('initial status', await status(orderId), 'Onboarding in progress');
  check('owners split neil/neil/neil/josh/josh', ms.map((m) => m.owner), ['neil', 'neil', 'neil', 'josh', 'josh']);
  const dayDiff = (a: string, b: string) => Math.round((+new Date(a) - +new Date(b)) / 86400000);
  const today = new Date().toISOString().slice(0, 10);
  check('target offsets 2/7/11/21/31', ms.map((m) => dayDiff(m.targetDate!, today)), [2, 7, 11, 21, 31]);

  await expectError('completing shoot out of sequence rejected', 'out_of_sequence', () => completeMilestone(ms[2].id));
  await expectError('start revision before delivery rejected', 'not_in_revision_window', () => startRevisionRound(orderId));

  await completeMilestone(ms[0].id);
  check('strategy done → Scripting in progress', await status(orderId), 'Scripting in progress');
  await undoLastCompleted(orderId);
  check('undo → back to Onboarding in progress', await status(orderId), 'Onboarding in progress');

  await completeMilestone(ms[0].id);
  await completeMilestone(ms[1].id);
  check('scripting done → Pre-production', await status(orderId), 'Pre-production (casting & scheduling)');
  await completeMilestone(ms[2].id);
  check('shoot done → Post-production', await status(orderId), 'Post-production (editing)');

  await expectError('delivery without link rejected', 'link_required', () => completeMilestone(ms[3].id));
  await completeMilestone(ms[3].id, 'https://drive.example.com/final-v1');
  check('delivered → Optional revisions', await status(orderId), 'Optional revisions');

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  check('revision round adds 2 milestones', ms.length, 7);
  check('round start → Revisions in progress', await status(orderId), 'Revisions in progress');
  check('terminal slid to sequence 7', ms.find((m) => m.kind === 'completed')!.sequence, 7);

  await undoLastCompleted(orderId);
  ms = await milestonesOf(orderId);
  check('undo cancels round: 5 milestones again', ms.length, 5);
  check('round cancelled → Optional revisions', await status(orderId), 'Optional revisions');
  check('terminal back to sequence 5', ms.find((m) => m.kind === 'completed')!.sequence, 5);

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  const revised = ms.find((m) => m.kind === 'revised_delivered')!;
  await expectError('revised delivery without link rejected', 'link_required', () => completeMilestone(revised.id));
  await completeMilestone(revised.id, 'https://drive.example.com/final-v2');
  check('revised delivered → Optional revisions', await status(orderId), 'Optional revisions');
  ms = await milestonesOf(orderId);
  check('feedback window reset to +10d', dayDiff(ms.find((m) => m.kind === 'completed')!.targetDate!, today), 10);

  await startRevisionRound(orderId);
  ms = await milestonesOf(orderId);
  check('second round: 9 milestones', ms.length, 9);
  const revised2 = ms.filter((m) => m.kind === 'revised_delivered').find((m) => !m.completedAt)!;
  await completeMilestone(revised2.id, 'https://drive.example.com/final-v3');
  const terminal = (await milestonesOf(orderId)).find((m) => m.kind === 'completed')!;
  await completeMilestone(terminal.id);
  check('order completed → Completed', await status(orderId), 'Completed');
  check('isOrderCompleted', isOrderCompleted(await milestonesOf(orderId)), true);
  await expectError('completing past terminal rejected', 'not_found', async () => {
    const next = (await milestonesOf(orderId)).find((m) => !m.completedAt);
    if (!next) throw Object.assign(new Error('nothing left'), { code: 'not_found' });
    await completeMilestone(next.id);
  });

  await db().delete(tables.orders).where(eq(tables.orders.id, orderId));
  check('cleanup: order deleted (milestones cascade)', (await milestonesOf(orderId)).length, 0);

  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
