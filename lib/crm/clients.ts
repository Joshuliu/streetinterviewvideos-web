// How the clients list is grouped. Derived on every render from the orders,
// never stored — same philosophy as lead heat.
//
// Two groups since the 2026-08-30 simplification (order status is a hand-set
// ongoing / completed / canceled, so there is no "waiting on client" state to
// derive any more):
//
// - live: at least one ongoing order.
// - quiet: nothing ongoing. Every order wrapped or canceled, or none placed
//   yet. Behind a fold, but still searchable.

export type ClientGroup = 'live' | 'quiet';

export const CLIENT_GROUP_META: Record<ClientGroup, { label: string; hint: string; empty: string }> = {
  live: {
    label: 'Ongoing orders',
    hint: 'At least one order in progress',
    empty: 'No ongoing orders.',
  },
  quiet: {
    label: 'Nothing live',
    hint: 'Every order wrapped, or none placed yet',
    empty: 'Nothing here.',
  },
};

// Sorting reorders rows WITHIN a section only — the grouping is the page.

export type ClientSort = 'activity' | 'name';

export const CLIENT_SORTS: { key: ClientSort; label: string }[] = [
  { key: 'activity', label: 'Last activity' },
  { key: 'name', label: 'Name' },
];
