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

export const CLIENT_GROUP_META: Record<ClientGroup, { label: string; hint: string; empty: string }> = {
  waiting: {
    label: 'Waiting on client',
    hint: 'Their move. Longest wait first, and on nobody’s task board',
    empty: 'Nobody is holding us up.',
  },
  live: {
    label: 'In production',
    hint: 'On us, soonest deadline first',
    empty: 'No orders in production.',
  },
  quiet: {
    label: 'Nothing live',
    hint: 'Every order wrapped, or none placed yet',
    empty: 'Nothing here.',
  },
};
