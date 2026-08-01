import { desc, eq, inArray, or } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import type { notes } from '@/lib/db/schema';

// Notes are ONE stream per person that spans the whole relationship:
// notes written while they were a lead stay attached to the lead, notes written
// after conversion attach to the account, and both read back as a single list.
// Nothing is re-pointed at conversion, so a note can never be orphaned or lost.

export type NoteRow = typeof notes.$inferSelect;

/** A lead's notes, newest first. */
export async function leadNotes(leadId: string): Promise<NoteRow[]> {
  return db()
    .select()
    .from(tables.notes)
    .where(eq(tables.notes.leadId, leadId))
    .orderBy(desc(tables.notes.date), desc(tables.notes.createdAt));
}

/**
 * A client's notes, newest first: the account's own notes plus the notes of
 * every lead that converted into this account (more than one lead can, when a
 * returning contact converts again). That union is what makes the sales-call
 * history readable from the client page without a detour to the lead.
 */
export async function accountNotes(accountId: string, leadIds: string[]): Promise<NoteRow[]> {
  const owned = eq(tables.notes.accountId, accountId);
  return db()
    .select()
    .from(tables.notes)
    .where(leadIds.length ? or(owned, inArray(tables.notes.leadId, leadIds)) : owned)
    .orderBy(desc(tables.notes.date), desc(tables.notes.createdAt));
}
