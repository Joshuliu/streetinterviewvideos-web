// The task board's sort space. Personal tasks, milestone tasks and meetings
// all live in one hand-sortable list per day, so tasks.position,
// milestones.position and leads.position are read as a single number line and
// a drag can drop any row between any two others.
//
// Untouched rows sit in bands around the epoch-seconds middle where tasks
// live, which is what makes a day read sensibly before anyone has dragged
// anything: calls at the top, then tasks, then pipeline steps. Dragging pulls
// a row out of its band for good, which is the point.

/** Meetings: above every task, ordered by start time. */
export const MEETING_BAND = -1_000_000_000_000;
/** Milestones: below every task (the pipeline is background work). */
export const MILESTONE_BAND = 1_000_000_000_000;

// Dropping between two rows takes the midpoint of their positions, so repeated
// drops into the SAME gap halve it each time. At the ~1e12 band a double runs
// out of room after roughly a dozen splits in one gap (tasks, near 1e9, get
// ~20). If two rows ever land on the same position the list still renders
// stably — the sort falls back to kind then id — and dragging past a neighbour
// re-spaces them by ±1.

/**
 * Where a booked call sits by default: chronological within its day. Stamped
 * whenever the meeting time is set or changes, never on other lead edits, so
 * a hand-dragged call keeps its slot until the call itself moves.
 */
export function meetingPosition(meetingAt: Date): number {
  return meetingAt.getTime() / 1000 + MEETING_BAND;
}
