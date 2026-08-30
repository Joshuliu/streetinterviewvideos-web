// One-shot backfill for the 2026-08-30 simplification (milestones removed,
// stored order status added). For every order:
//   - status: 'completed' if its terminal 'completed' milestone was done,
//     else 'ongoing' (nothing maps to 'canceled' — none existed).
//   - notes: the order's completed-milestone history (step, date, delivery
//     link) flattened into the new free-text notes field, so the delivery
//     links — which lived ONLY on milestones — survive the eventual drop.
// Idempotent-ish: skips any order whose notes already carry the marker line.
//
// Run: set -a; source .env.local; set +a; npx tsx scripts/crm-backfill-order-status.ts

import { asc, eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';

// The old display names, frozen here because lib/crm/status.ts no longer
// carries the milestone pipeline. 'approval' varied by orders.needs_product.
const LABELS: Record<string, string> = {
  strategy: 'Onboarding received',
  scripting: 'Scripting completed',
  approval: 'Brief approved & product sent',
  shoot: 'Shoot completed',
  delivered: 'Order delivered',
  revisions_ordered: 'Revisions ordered',
  revised_delivered: 'Revised order delivered',
  completed: 'Order completed',
};

const MARKER = 'History (migrated from milestones';

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' });
}

async function main() {
  const d = db();
  const [orders, milestones] = await Promise.all([
    d.select().from(tables.orders),
    d.select().from(tables.milestones).orderBy(asc(tables.milestones.sequence)),
  ]);
  const byOrder = new Map<string, typeof milestones>();
  for (const m of milestones) {
    const list = byOrder.get(m.orderId) ?? [];
    list.push(m);
    byOrder.set(m.orderId, list);
  }

  let updated = 0;
  for (const order of orders) {
    if (order.notes.includes(MARKER)) {
      console.log(`skip (already migrated): ${order.title}`);
      continue;
    }
    const ms = byOrder.get(order.id) ?? [];
    const done = ms.filter((m) => m.completedAt);
    const isCompleted = done.some((m) => m.kind === 'completed');

    const lines = done.map((m) => {
      const label =
        m.kind === 'approval' && !order.needsProduct ? 'Brief approved' : LABELS[m.kind] ?? m.kind;
      const link = m.deliveredLink ? ` — ${m.deliveredLink}` : '';
      return `- ${label} — ${fmtDate(m.completedAt!)}${link}`;
    });
    const next = ms.find((m) => !m.completedAt);
    if (!isCompleted && next) {
      const label = next.kind === 'approval' && !order.needsProduct ? 'Brief approved' : LABELS[next.kind] ?? next.kind;
      lines.push(`- (was next: ${label}${next.targetDate ? `, due ${next.targetDate}` : ''})`);
    }

    const history = lines.length
      ? `${MARKER} ${new Date().toISOString().slice(0, 10)}):\n${lines.join('\n')}`
      : '';
    const notes = [order.notes.trim(), history].filter(Boolean).join('\n\n');

    await d
      .update(tables.orders)
      .set({ status: isCompleted ? 'completed' : 'ongoing', notes })
      .where(eq(tables.orders.id, order.id));
    updated++;
    console.log(`${isCompleted ? 'completed' : 'ongoing  '}  ${order.title} (${done.length} steps flattened)`);
  }
  console.log(`\n${updated} of ${orders.length} orders updated.`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
