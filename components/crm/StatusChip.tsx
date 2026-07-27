// Status → chip color. Green = client's court / done, orange = we're working,
// gray = not started. Mirrors the tracker's sign palette.
const STATUS_STYLES: Record<string, string> = {
  'Onboarding in progress': 'bg-[#2a2a2a] text-[#e9e6da]',
  'Scripting in progress': 'bg-[#9a3412] text-white',
  'Pre-production (casting & scheduling)': 'bg-[#9a3412] text-white',
  'Post-production (editing)': 'bg-[#ea580c] text-white',
  'Optional revisions': 'bg-[#0e4a22] text-white',
  'Revisions in progress': 'bg-[#ea580c] text-white',
  Completed: 'bg-[#1f7a3a] text-white',
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
        STATUS_STYLES[status] ?? 'bg-[#2a2a2a] text-[#e9e6da]'
      }`}
    >
      {status}
    </span>
  );
}

/** Small green plate marking a milestone task with the client it belongs to. */
export function ClientBadge({ name }: { name: string }) {
  return (
    <span className="inline-block rounded bg-[#1f7a3a] px-1.5 py-0.5 text-[11px] font-semibold text-white align-middle break-words">
      {name}
    </span>
  );
}
