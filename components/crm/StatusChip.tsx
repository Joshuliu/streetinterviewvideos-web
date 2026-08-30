import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/crm/status';

// Status → chip color. Orange = in progress, green = done, neutral = canceled.
//
// The saturated plates keep their colours in both CRM themes on purpose: they
// read as signs against paper and against ink alike. Only the neutral one has
// to follow the theme, so it goes through the chip tokens.
const STATUS_STYLES: Record<OrderStatus, string> = {
  ongoing: 'bg-[#ea580c] text-white',
  completed: 'bg-[#1f7a3a] text-white',
  canceled: 'bg-[var(--crm-chip-bg)] text-[var(--crm-chip-text)]',
};

export function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

/** Small green plate marking a task-board row with the client it belongs to. */
export function ClientBadge({ name }: { name: string }) {
  return (
    <span className="inline-block rounded bg-[#1f7a3a] px-1.5 py-0.5 text-[11px] font-semibold text-white align-middle break-words">
      {name}
    </span>
  );
}
