import Link from 'next/link';
import { MILESTONE_META, deriveStatus, isOrderCompleted, nextIncomplete } from '@/lib/crm/status';
import { fmtDate, fmtDateTime } from '@/lib/crm/format';
import type { milestones as milestonesTable, notes as notesTable, orders as ordersTable } from '@/lib/db/schema';

type Order = typeof ordersTable.$inferSelect;
type Milestone = typeof milestonesTable.$inferSelect;
type Note = typeof notesTable.$inferSelect;

// The client-facing order tracker (studio.) — the showpiece. Strictly
// read-only: everything here is display, no actions.

export function StudioOrderView({
  accountName,
  order,
  milestones,
  clientNotes,
  otherOrders,
}: {
  accountName: string;
  order: Order;
  milestones: Milestone[];
  clientNotes: Note[];
  otherOrders: { order: Order; status: string; deliveredLinks: { label: string; href: string }[] }[];
}) {
  const status = deriveStatus(milestones);
  const next = nextIncomplete(milestones);
  const done = isOrderCompleted(milestones);

  return (
    <div className="max-w-2xl space-y-10">
      {/* Order header + status sign */}
      <div>
        <div className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">{order.brand || accountName}</div>
        <h1 className="font-display text-2xl sm:text-3xl mt-1 break-words">{order.title}</h1>
        <div className="mt-4">
          <span className={`tracker-sign text-sm sm:text-base ${done || !next ? '' : 'tracker-sign--current'}`}>{status}</span>
        </div>
      </div>

      {/* Progress bar + stages */}
      <div>
        <div className="tracker-bar mb-6">
          {milestones.map((m) => (
            <div key={m.id} className={m.completedAt ? 'seg-done' : next?.id === m.id ? 'seg-current' : ''} />
          ))}
        </div>
        <ol className="space-y-0">
          {milestones.map((m, i) => {
            const isCurrent = next?.id === m.id;
            return (
              <li key={m.id} className="flex gap-4">
                {/* Node + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      m.completedAt
                        ? 'bg-[#1f7a3a] border-[#0e4a22] text-white'
                        : isCurrent
                          ? 'bg-[#ea580c] border-[#9a3412] text-white'
                          : 'bg-transparent border-[#2a2a2a] text-[#6b6b6b]'
                    }`}
                  >
                    {m.completedAt ? '✓' : i + 1}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-6 ${m.completedAt ? 'bg-[#1f7a3a]' : 'bg-[#2a2a2a]'}`} />
                  )}
                </div>
                {/* Stage body */}
                <div className={`pb-6 min-w-0 ${isCurrent ? '' : ''}`}>
                  <div className={`text-sm font-semibold ${m.completedAt ? 'text-[#9ca3af]' : isCurrent ? 'text-white' : 'text-[#6b6b6b]'}`}>
                    {MILESTONE_META[m.kind].label}
                  </div>
                  <div className="text-xs text-[#6b6b6b] mt-0.5">
                    {m.completedAt ? fmtDateTime(m.completedAt) : m.targetDate ? `Target ${fmtDate(m.targetDate)}` : null}
                    {isCurrent && <span className="ml-2 text-[#f97316] font-semibold">in progress</span>}
                  </div>
                  {m.completedAt && m.deliveredLink && (
                    <a
                      href={m.deliveredLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sign-btn text-xs mt-2 !px-4 !py-2"
                    >
                      Open delivery
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Updates: client-visible notes, newest first */}
      {clientNotes.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Updates</h2>
          <ul className="space-y-3">
            {clientNotes.map((n) => (
              <li key={n.id} className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4">
                <div className="text-xs text-[#9ca3af] mb-1">{fmtDate(n.date)}</div>
                <p className="text-sm text-white whitespace-pre-wrap break-words">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Other orders: switcher + history */}
      {otherOrders.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-3">Your other orders</h2>
          <ul className="space-y-2">
            {otherOrders.map(({ order: o, status: s, deliveredLinks }) => (
              <li key={o.id} className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1 basis-40">
                  <Link href={`/orders/${o.id}`} className="text-sm font-semibold text-white hover:text-[#e9e6da] break-words">
                    {o.title}
                  </Link>
                  <div className="text-xs text-[#9ca3af]">{o.brand || accountName}</div>
                </div>
                <span className="text-xs text-[#9ca3af]">{s}</span>
                {deliveredLinks.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2a9a4a] hover:underline">
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
