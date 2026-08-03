// How the clients list is grouped. Same philosophy as lead heat and order
// status: derived on every render from what already happened, never stored.
//
// The old list was one flat A-Z roll of every account, so a client we're
// blocking on and a client whose last order shipped in June looked identical.
// The split is by WHO THE BALL IS WITH, because that's the only question this
// page can answer that no other page does:
//
// - waiting: the next milestone is one of the client's two (strategy,
//   approval). Those appear on NO admin's task board on purpose, so this list
//   is the only place the stall is visible — it goes first, longest wait at
//   the top.
// - live: an open order whose next step is ours. The task board is where the
//   work gets done; this is the roll-up.
// - quiet: nothing open. Every order wrapped, or none placed yet. Out of the
//   working list and behind a fold, but still searchable.

export type ClientGroup = 'waiting' | 'live' | 'quiet';

/** The open sections, in render order. 'quiet' is separate — it renders
 *  behind a fold under them, like the leads list's converted & archived. */
export const CLIENT_SECTION_ORDER: Exclude<ClientGroup, 'quiet'>[] = ['waiting', 'live'];

// `order` is the ordering half of the hint, shown only while the list is on
// its default sort — a hint that says "longest wait first" under a name sort
// is worse than no hint at all.
export const CLIENT_GROUP_META: Record<ClientGroup, { label: string; hint: string; order?: string; empty: string }> = {
  waiting: {
    label: 'Waiting on client',
    hint: 'Their move, and on nobody’s task board',
    order: 'longest wait first',
    empty: 'Nobody is holding us up.',
  },
  live: {
    label: 'In production',
    hint: 'On us',
    order: 'soonest deadline first',
    empty: 'No orders in production.',
  },
  quiet: {
    label: 'Nothing live',
    hint: 'Every order wrapped, or none placed yet',
    empty: 'Nothing here.',
  },
};

// Sorting reorders rows WITHIN a section only — the grouping is the page.
// Deadline is the default and puts whatever is furthest past its date at the
// top of each section; the others are for working the list a different way.

export type ClientSort = 'deadline' | 'activity' | 'name';

export const CLIENT_SORTS: { key: ClientSort; label: string }[] = [
  { key: 'deadline', label: 'Deadline' },
  { key: 'activity', label: 'Last activity' },
  { key: 'name', label: 'Name' },
];
