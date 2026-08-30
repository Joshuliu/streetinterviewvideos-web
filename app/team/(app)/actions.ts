'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { isOrderStatus } from '@/lib/crm/status';
import { ONBOARDING_FIELDS } from '@/lib/crm/onboarding';
import type { OnboardingField } from '@/lib/crm/onboarding';
import { dateISO, todayISO } from '@/lib/crm/format';

// Server actions for team.: every one re-checks the admin session; the
// layout redirect is just the front door.

function requireAdmin() {
  const session = getAdminSession();
  if (!session) throw new Error('unauthorized');
  return session;
}

// All team pages render under the internal /team path (host-rewritten), so
// one layout-wide revalidate refreshes every view after a mutation.
function refresh() {
  revalidatePath('/team', 'layout');
}

export type ActionResult = { ok: true } | { ok: false; error: string };

const str = (fd: FormData, key: string) => (fd.get(key) ?? '').toString().trim();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// --- Personal tasks ---

export async function addTask(formData: FormData) {
  const { owner } = requireAdmin();
  const title = str(formData, 'title').slice(0, 300);
  if (!title) return;
  const due = str(formData, 'dueDate');
  await db().insert(tables.tasks).values({
    owner,
    title,
    dueDate: DATE_RE.test(due) ? due : null,
    // New tasks land at the bottom of their day (positions are epoch-based).
    position: Date.now() / 1000,
    notes: str(formData, 'notes').slice(0, 2000),
  });
  refresh();
}

// A day on the board is one merged list of personal tasks and meetings, so a
// drop's neighbors can be either kind. Both tables share the same `position`
// number space for exactly this reason.
export type BoardRef = { kind: 'task' | 'meeting'; id: string };

/** Current position of a row, whichever table it lives in. */
async function positionOf(ref: BoardRef): Promise<number | null> {
  const d = db();
  if (ref.kind === 'task') {
    const [row] = await d
      .select({ position: tables.tasks.position })
      .from(tables.tasks)
      .where(eq(tables.tasks.id, ref.id));
    return row?.position ?? null;
  }
  const [row] = await d
    .select({ position: tables.calendarEvents.position })
    .from(tables.calendarEvents)
    .where(eq(tables.calendarEvents.id, ref.id));
  return row?.position ?? null;
}

/**
 * Drag-and-drop move: slot a row between its new neighbors (of either kind)
 * and, for tasks, re-date it. Fractional positions: the midpoint of the
 * neighbors, or just past the edge when dropped at the top or bottom.
 *
 * Per-kind rules the UI also enforces, re-checked here:
 * - task: any day, including the undated section at the top.
 * - meeting: reorder within its own day only. The day comes from the
 *   calendar, so moving one here would quietly disagree with it; a real
 *   reschedule happens in Google Calendar.
 */
export async function moveBoardItem(
  item: BoardRef,
  date: string | null,
  before: BoardRef | null,
  after: BoardRef | null,
): Promise<ActionResult> {
  const { owner } = requireAdmin();
  if (date !== null && !DATE_RE.test(date)) return { ok: false, error: 'Bad date' };

  const [beforePos, afterPos] = await Promise.all([
    before ? positionOf(before) : Promise.resolve(null),
    after ? positionOf(after) : Promise.resolve(null),
  ]);
  let position: number;
  if (beforePos !== null && afterPos !== null) position = (beforePos + afterPos) / 2;
  else if (afterPos !== null) position = afterPos - 1;
  else if (beforePos !== null) position = beforePos + 1;
  else position = Date.now() / 1000;

  if (item.kind === 'task') {
    const updated = await db()
      .update(tables.tasks)
      .set({ dueDate: date, position })
      .where(and(eq(tables.tasks.id, item.id), eq(tables.tasks.owner, owner)))
      .returning({ id: tables.tasks.id });
    if (updated.length === 0) return { ok: false, error: 'Task not found' };
  } else {
    const [meeting] = await db()
      .select({ startAt: tables.calendarEvents.startAt })
      .from(tables.calendarEvents)
      .where(eq(tables.calendarEvents.id, item.id));
    if (!meeting) return { ok: false, error: 'Meeting not found' };
    const day = meeting.startAt ? dateISO(meeting.startAt) : null;
    // The day belongs to Google. Dragging only reorders within it; moving a
    // call to another day is a reschedule, and that happens in the calendar.
    if (date !== day) return { ok: false, error: 'Move the call in Google Calendar to change its day' };
    await db().update(tables.calendarEvents).set({ position }).where(eq(tables.calendarEvents.id, item.id));
  }

  refresh();
  return { ok: true };
}

export async function updateTask(formData: FormData) {
  const { owner } = requireAdmin();
  const id = str(formData, 'id');
  const title = str(formData, 'title').slice(0, 300);
  if (!id || !title) return;
  const due = str(formData, 'dueDate');
  await db()
    .update(tables.tasks)
    .set({ title, dueDate: DATE_RE.test(due) ? due : null, notes: str(formData, 'notes').slice(0, 2000) })
    .where(and(eq(tables.tasks.id, id), eq(tables.tasks.owner, owner)));
  refresh();
}

export async function completeTask(formData: FormData) {
  const { owner } = requireAdmin();
  const id = str(formData, 'id');
  if (!id) return;
  // Soft-hide: the row stays, completed_at set, recoverable from Completed.
  await db()
    .update(tables.tasks)
    .set({ completedAt: new Date() })
    .where(and(eq(tables.tasks.id, id), eq(tables.tasks.owner, owner)));
  refresh();
}

export async function uncompleteTask(formData: FormData) {
  const { owner } = requireAdmin();
  const id = str(formData, 'id');
  if (!id) return;
  await db()
    .update(tables.tasks)
    .set({ completedAt: null })
    .where(and(eq(tables.tasks.id, id), eq(tables.tasks.owner, owner)));
  refresh();
}

export async function deleteTask(formData: FormData) {
  const { owner } = requireAdmin();
  const id = str(formData, 'id');
  if (!id) return;
  await db().delete(tables.tasks).where(and(eq(tables.tasks.id, id), eq(tables.tasks.owner, owner)));
  refresh();
}

// --- Clients / accounts ---

// NOTE: server-action redirect() renders the target internally WITHOUT
// re-running the host-rewrite middleware, so on team. it 404s. Actions
// therefore return the destination (or an error) and a client component does
// router.push().
export async function createClient(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  requireAdmin();
  // The client is a person (point of contact); company is who they represent
  // (their own brand, or the agency they work at).
  const name = str(formData, 'name').slice(0, 200);
  const company = str(formData, 'company').slice(0, 200);
  if (!name) return { ok: false, error: 'Contact name is required' };
  if (!company) return { ok: false, error: 'Company is required' };
  const [account] = await db().insert(tables.accounts).values({ name, company }).returning({ id: tables.accounts.id });
  refresh();
  return { ok: true, id: account.id };
}

export async function updateClient(formData: FormData): Promise<ActionResult> {
  requireAdmin();
  const id = str(formData, 'id');
  const name = str(formData, 'name').slice(0, 200);
  const company = str(formData, 'company').slice(0, 200);
  if (!id || !name) return { ok: false, error: 'Contact name is required' };
  if (!company) return { ok: false, error: 'Company is required' };
  await db().update(tables.accounts).set({ name, company }).where(eq(tables.accounts.id, id));
  refresh();
  return { ok: true };
}

/**
 * Hard-delete a client, for clearing out test rows and dead accounts. There is
 * no undo, so the caller has to echo back the contact name.
 *
 * FK cascades take everything the ACCOUNT owns: orders (with their notes) and
 * account notes.
 *
 * The lead row is handled by hand, because a lead is the PERSON record and the
 * account is only their client chapter (see CLAUDE.md):
 * - A stub we minted ourselves just to hang a client's calls off
 *   (`source: 'client-record'`, from `personLeadId`) has no life of its own, so
 *   it goes with the account and takes its meetings with it.
 * - A real funnel lead is unlinked and archived instead. Their sales history
 *   survives, and archiving keeps them from silently reappearing at the top of
 *   the live pipeline as a fresh lead. Restore them from Archived if that's
 *   what you actually wanted.
 */
export async function deleteClient(accountId: string, confirmName: string): Promise<ActionResult> {
  requireAdmin();
  if (!accountId) return { ok: false, error: 'Missing client' };
  const d = db();
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, accountId));
  if (!account) return { ok: false, error: 'Client not found' };
  if (confirmName.trim().toLowerCase() !== account.name.trim().toLowerCase()) {
    return { ok: false, error: `Type "${account.name}" exactly to confirm` };
  }

  const linked = await d
    .select({ id: tables.leads.id, source: tables.leads.source })
    .from(tables.leads)
    .where(eq(tables.leads.convertedAccountId, accountId));
  const stubIds = linked.filter((l) => l.source === 'client-record').map((l) => l.id);
  const realIds = linked.filter((l) => l.source !== 'client-record').map((l) => l.id);

  // Onboarding forms point at an order with ON DELETE SET NULL, so a form that
  // belongs to no lead would outlive its order as an unreachable orphan.
  const orderIds = (
    await d.select({ id: tables.orders.id }).from(tables.orders).where(eq(tables.orders.accountId, accountId))
  ).map((o) => o.id);
  if (orderIds.length) {
    await d
      .delete(tables.onboardingForms)
      .where(and(inArray(tables.onboardingForms.orderId, orderIds), isNull(tables.onboardingForms.leadId)));
  }
  if (stubIds.length) await d.delete(tables.leads).where(inArray(tables.leads.id, stubIds));
  if (realIds.length) {
    await d
      .update(tables.leads)
      .set({ convertedAccountId: null, archivedAt: sql`coalesce(${tables.leads.archivedAt}, now())`, updatedAt: new Date() })
      .where(inArray(tables.leads.id, realIds));
  }
  await d.delete(tables.accounts).where(eq(tables.accounts.id, accountId));
  refresh();
  return { ok: true };
}

// --- Orders ---

export async function createOrderAction(formData: FormData): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
  requireAdmin();
  const accountId = str(formData, 'accountId');
  const title = str(formData, 'title').slice(0, 300);
  if (!accountId || !title) return { ok: false, error: 'Title is required' };
  const brand = str(formData, 'brand').slice(0, 200);
  if (!brand) return { ok: false, error: 'Every order is for a brand — fill it in' };
  const placedDate = str(formData, 'placedDate');
  if (!DATE_RE.test(placedDate)) return { ok: false, error: 'Pick an order placed date' };
  const status = str(formData, 'status');
  if (!isOrderStatus(status)) return { ok: false, error: 'Pick a status' };
  await db().insert(tables.orders).values({
    accountId,
    title,
    brand,
    status,
    notes: str(formData, 'notes').slice(0, 10000),
    // Noon UTC on the placed date lands on the same calendar day in ET.
    createdAt: new Date(`${placedDate}T16:00:00Z`),
  });
  refresh();
  return { ok: true, accountId };
}

/** The order card's one form: status + notes, saved together. */
export async function updateOrder(formData: FormData) {
  requireAdmin();
  const id = str(formData, 'orderId');
  if (!id) return;
  const status = str(formData, 'status');
  await db()
    .update(tables.orders)
    .set({
      ...(isOrderStatus(status) ? { status } : {}),
      notes: str(formData, 'notes').slice(0, 10000),
    })
    .where(eq(tables.orders.id, id));
  refresh();
}

/**
 * Add a note to a person: `accountId` once they're a client, `leadId` while
 * they're still a lead. Exactly one, matching the DB's own check constraint.
 * Every note is internal (2026-07-31).
 */
export async function addNote(formData: FormData) {
  requireAdmin();
  const accountId = str(formData, 'accountId');
  const leadId = str(formData, 'leadId');
  const text = str(formData, 'text').slice(0, 5000);
  if (!text) return;
  if (!accountId === !leadId) return; // need exactly one owner
  const date = str(formData, 'date');
  await db().insert(tables.notes).values({
    ...(accountId ? { accountId } : { leadId }),
    date: DATE_RE.test(date) ? date : todayISO(),
    text,
  });
  refresh();
}

/** Remove a note. The one notes stream is now the only place internal history
 *  lives, so fixing a bad entry has to be possible. */
export async function deleteNote(noteId: string): Promise<ActionResult> {
  requireAdmin();
  if (!noteId) return { ok: false, error: 'Missing note' };
  await db().delete(tables.notes).where(eq(tables.notes.id, noteId));
  refresh();
  return { ok: true };
}

// --- Leads ---

export async function saveOnboardingForm(formData: FormData): Promise<ActionResult> {
  requireAdmin();
  const leadId = str(formData, 'leadId');
  if (!leadId) return { ok: false, error: 'Missing lead' };
  const fields = Object.fromEntries(
    ONBOARDING_FIELDS.map((f) => [f, str(formData, f).slice(0, 5000)]),
  ) as Record<OnboardingField, string>;
  await db()
    .insert(tables.onboardingForms)
    .values({ leadId, ...fields })
    .onConflictDoUpdate({
      target: tables.onboardingForms.leadId,
      set: { ...fields, updatedAt: sql`now()` },
    });
  refresh();
  return { ok: true };
}

export async function setLeadArchived(leadId: string, archived: boolean): Promise<ActionResult> {
  requireAdmin();
  if (!leadId) return { ok: false, error: 'Missing lead' };
  await db()
    .update(tables.leads)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(eq(tables.leads.id, leadId));
  refresh();
  return { ok: true };
}

/**
 * Convert a lead into a client: create the account and link the lead. The
 * lead row survives as the person record — its email, calls and notes carry
 * onto the client page. Stripe will trigger this automatically later; for
 * now it's the manual button on the lead page.
 */
export async function convertLead(formData: FormData): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
  requireAdmin();
  const leadId = str(formData, 'leadId');
  const name = str(formData, 'name').slice(0, 200);
  const company = str(formData, 'company').slice(0, 200);
  if (!leadId) return { ok: false, error: 'Missing lead' };
  if (!name) return { ok: false, error: 'Contact name is required' };
  if (!company) return { ok: false, error: 'Company is required' };

  const [lead] = await db().select().from(tables.leads).where(eq(tables.leads.id, leadId));
  if (!lead) return { ok: false, error: 'Lead not found' };
  if (lead.convertedAccountId) return { ok: false, error: 'Already converted' };

  const [account] = await db().insert(tables.accounts).values({ name, company }).returning({ id: tables.accounts.id });
  await db()
    .update(tables.leads)
    .set({ convertedAccountId: account.id, updatedAt: new Date() })
    .where(eq(tables.leads.id, leadId));
  refresh();
  return { ok: true, accountId: account.id };
}
