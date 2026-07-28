'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/session';
import { normalizeEmail } from '@/lib/auth/config';
import {
  EngineError,
  completeMilestone,
  createOrder,
  startRevisionRound,
  undoLastCompleted,
  updateMilestone,
} from '@/lib/crm/engine';
import { INITIAL_TEMPLATE } from '@/lib/crm/status';
import type { Owner } from '@/lib/crm/status';

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

function asResult(fn: () => Promise<void>): Promise<ActionResult> {
  return fn()
    .then(() => ({ ok: true as const }))
    .catch((e) => ({ ok: false as const, error: e instanceof EngineError ? e.message : 'Something went wrong' }));
}

const isOwner = (v: unknown): v is Owner => v === 'josh' || v === 'neil';
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

/**
 * Drag-and-drop move: set the task's day (null = the undated section) and
 * slot it between its new neighbors. Fractional positions: the midpoint of
 * the neighbors, or just past the edge when dropped at the top/bottom.
 */
export async function moveTask(
  taskId: string,
  date: string | null,
  beforeTaskId: string | null,
  afterTaskId: string | null,
): Promise<ActionResult> {
  const { owner } = requireAdmin();
  if (date !== null && !DATE_RE.test(date)) return { ok: false, error: 'Bad date' };

  const neighborIds = [beforeTaskId, afterTaskId].filter((v): v is string => !!v);
  const neighbors = neighborIds.length
    ? await db()
        .select({ id: tables.tasks.id, position: tables.tasks.position })
        .from(tables.tasks)
        .where(and(inArray(tables.tasks.id, neighborIds), eq(tables.tasks.owner, owner)))
    : [];
  const before = neighbors.find((n) => n.id === beforeTaskId)?.position ?? null;
  const after = neighbors.find((n) => n.id === afterTaskId)?.position ?? null;
  let position: number;
  if (before !== null && after !== null) position = (before + after) / 2;
  else if (after !== null) position = after - 1;
  else if (before !== null) position = before + 1;
  else position = Date.now() / 1000;

  const updated = await db()
    .update(tables.tasks)
    .set({ dueDate: date, position })
    .where(and(eq(tables.tasks.id, taskId), eq(tables.tasks.owner, owner)))
    .returning({ id: tables.tasks.id });
  if (updated.length === 0) return { ok: false, error: 'Task not found' };
  refresh();
  return { ok: true };
}

/** Drag-and-drop move for milestone tasks: only the target date changes. */
export async function moveMilestone(milestoneId: string, date: string): Promise<ActionResult> {
  requireAdmin();
  if (!DATE_RE.test(date)) return { ok: false, error: 'Bad date' };
  await updateMilestone(milestoneId, { targetDate: date });
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

// --- Milestones (called from client components; return a result) ---

export async function completeMilestoneAction(milestoneId: string, deliveredLink?: string): Promise<ActionResult> {
  requireAdmin();
  return asResult(() => completeMilestone(milestoneId, deliveredLink));
}

export async function undoLastCompletedAction(orderId: string): Promise<ActionResult> {
  requireAdmin();
  return asResult(() => undoLastCompleted(orderId));
}

export async function startRevisionRoundAction(orderId: string): Promise<ActionResult> {
  requireAdmin();
  return asResult(() => startRevisionRound(orderId));
}

export async function updateMilestoneAction(formData: FormData) {
  requireAdmin();
  const id = str(formData, 'id');
  if (!id) return;
  const owner = str(formData, 'owner');
  const date = str(formData, 'targetDate');
  await updateMilestone(id, {
    ...(isOwner(owner) ? { owner } : {}),
    targetDate: DATE_RE.test(date) ? date : null,
  });
  refresh();
}

// --- Clients / accounts ---

// NOTE: server-action redirect() renders the target internally WITHOUT
// re-running the host-rewrite middleware, so on team. it 404s. Actions
// therefore return the destination and the client form router.push()es it.
export async function createClient(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  requireAdmin();
  const name = str(formData, 'name').slice(0, 200);
  if (!name) return { ok: false, error: 'Name is required' };
  const [account] = await db().insert(tables.accounts).values({ name }).returning({ id: tables.accounts.id });
  refresh();
  return { ok: true, id: account.id };
}

export async function createOrderAction(formData: FormData): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
  requireAdmin();
  const accountId = str(formData, 'accountId');
  const title = str(formData, 'title').slice(0, 300);
  if (!accountId || !title) return { ok: false, error: 'Title is required' };
  const brand = str(formData, 'brand').slice(0, 200);
  const placedDate = str(formData, 'placedDate');
  if (!DATE_RE.test(placedDate)) return { ok: false, error: 'Pick an order placed date' };
  try {
    const overrides = INITIAL_TEMPLATE.map((t) => {
      const owner = str(formData, `owner_${t.kind}`);
      const date = str(formData, `date_${t.kind}`);
      if (!isOwner(owner) || !DATE_RE.test(date)) throw new EngineError('bad_input', 'Every milestone needs an owner and a date');
      return { kind: t.kind, owner, targetDate: date };
    });
    await createOrder(accountId, title, brand || null, overrides, placedDate);
  } catch (e) {
    return { ok: false, error: e instanceof EngineError ? e.message : 'Something went wrong' };
  }
  refresh();
  return { ok: true, accountId };
}

export async function addNote(formData: FormData) {
  requireAdmin();
  const accountId = str(formData, 'accountId');
  const text = str(formData, 'text').slice(0, 5000);
  if (!accountId || !text) return;
  const date = str(formData, 'date');
  await db().insert(tables.notes).values({
    accountId,
    date: DATE_RE.test(date) ? date : new Date().toISOString().slice(0, 10),
    text,
    clientVisible: formData.get('clientVisible') === 'on',
  });
  refresh();
}

export async function addLoginEmail(formData: FormData): Promise<ActionResult> {
  requireAdmin();
  const accountId = str(formData, 'accountId');
  const email = normalizeEmail(str(formData, 'email'));
  if (!accountId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter a valid email' };
  }
  try {
    await db().insert(tables.loginEmails).values({ accountId, email });
  } catch {
    // Globally-unique email (one email → one account).
    return { ok: false, error: 'That email is already on an account' };
  }
  refresh();
  return { ok: true };
}

export async function removeLoginEmail(formData: FormData) {
  requireAdmin();
  const id = str(formData, 'id');
  if (!id) return;
  // Revocation is immediate: studio sessions re-resolve the email per request.
  await db().delete(tables.loginEmails).where(eq(tables.loginEmails.id, id));
  refresh();
}
