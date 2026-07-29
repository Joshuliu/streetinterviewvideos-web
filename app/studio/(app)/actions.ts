'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getClientSession } from '@/lib/auth/session';
import { EngineError, completeMilestone } from '@/lib/crm/engine';
import { ONBOARDING_FIELDS } from '@/lib/crm/onboarding';

// Server actions for studio.: the client's half of onboarding (spec
// §OnboardingForm). The ONE thing a client can do: hand us their onboarding
// info, by confirming the form or submitting a brief link. Either path
// auto-completes the order's Strategy milestone. Every action re-checks the
// client session and that the order belongs to the session's account.

export type StudioActionResult = { ok: true } | { ok: false; error: string };

const str = (fd: FormData, key: string) => (fd.get(key) ?? '').toString().trim();

/** The session's account owns this order, or null. */
async function authorizeOrder(orderId: string) {
  const session = await getClientSession();
  if (!session || !orderId) return null;
  const [order] = await db()
    .select()
    .from(tables.orders)
    .where(and(eq(tables.orders.id, orderId), eq(tables.orders.accountId, session.accountId)));
  return order ?? null;
}

/**
 * The order's onboarding form row, creating/attaching as needed: the form
 * already attached to the order, else the sales-call form taken on the
 * account's lead (attached to this order on first write), else a fresh row.
 */
async function ensureForm(orderId: string, accountId: string): Promise<string> {
  const d = db();
  const [attached] = await d.select({ id: tables.onboardingForms.id }).from(tables.onboardingForms).where(eq(tables.onboardingForms.orderId, orderId));
  if (attached) return attached.id;

  const convertedLeads = await d
    .select({ id: tables.leads.id })
    .from(tables.leads)
    .where(eq(tables.leads.convertedAccountId, accountId));
  if (convertedLeads.length > 0) {
    const [leadForm] = await d
      .select({ id: tables.onboardingForms.id })
      .from(tables.onboardingForms)
      .where(and(inArray(tables.onboardingForms.leadId, convertedLeads.map((l) => l.id)), isNull(tables.onboardingForms.orderId)))
      .orderBy(desc(tables.onboardingForms.updatedAt))
      .limit(1);
    if (leadForm) {
      await d.update(tables.onboardingForms).set({ orderId }).where(eq(tables.onboardingForms.id, leadForm.id));
      return leadForm.id;
    }
  }

  const [created] = await d.insert(tables.onboardingForms).values({ orderId }).returning({ id: tables.onboardingForms.id });
  return created.id;
}

/** Strategy is sequence 1, so while it's incomplete it's always the next
 *  step; completing anything already done is reported by the engine. */
async function completeStrategy(orderId: string): Promise<void> {
  const [strategy] = await db()
    .select({ id: tables.milestones.id, completedAt: tables.milestones.completedAt })
    .from(tables.milestones)
    .where(and(eq(tables.milestones.orderId, orderId), eq(tables.milestones.kind, 'strategy')));
  if (!strategy || strategy.completedAt) return;
  try {
    await completeMilestone(strategy.id);
  } catch (e) {
    // Someone on the team beat us to it: onboarding is confirmed either way.
    if (!(e instanceof EngineError && e.code === 'already_completed')) throw e;
  }
}

function refresh() {
  revalidatePath('/studio', 'layout');
  revalidatePath('/team', 'layout');
}

function formFields(fd: FormData) {
  return Object.fromEntries(ONBOARDING_FIELDS.map((f) => [f, str(fd, f).slice(0, 5000)]));
}

/** Save the client's form answers without confirming (they can come back). */
export async function saveStudioOnboarding(formData: FormData): Promise<StudioActionResult> {
  const order = await authorizeOrder(str(formData, 'orderId'));
  if (!order) return { ok: false, error: 'Not allowed' };
  const formId = await ensureForm(order.id, order.accountId);
  await db()
    .update(tables.onboardingForms)
    .set({ ...formFields(formData), updatedAt: new Date() })
    .where(eq(tables.onboardingForms.id, formId));
  refresh();
  return { ok: true };
}

/** Confirm the form: save the answers, stamp confirmation, complete Strategy. */
export async function confirmStudioOnboarding(formData: FormData): Promise<StudioActionResult> {
  const order = await authorizeOrder(str(formData, 'orderId'));
  if (!order) return { ok: false, error: 'Not allowed' };
  const fields = formFields(formData);
  if (Object.values(fields).every((v) => !v)) {
    return { ok: false, error: 'Fill in at least one answer before confirming' };
  }
  const formId = await ensureForm(order.id, order.accountId);
  await db()
    .update(tables.onboardingForms)
    .set({ ...fields, confirmedAt: new Date(), updatedAt: new Date() })
    .where(eq(tables.onboardingForms.id, formId));
  await completeStrategy(order.id);
  refresh();
  return { ok: true };
}

/** The other path: submit a link to their own brief instead of the form. */
export async function submitStudioBrief(formData: FormData): Promise<StudioActionResult> {
  const order = await authorizeOrder(str(formData, 'orderId'));
  if (!order) return { ok: false, error: 'Not allowed' };
  const briefLink = str(formData, 'briefLink').slice(0, 2000);
  let url: URL;
  try {
    url = new URL(briefLink);
  } catch {
    return { ok: false, error: 'Enter a full link, starting with https://' };
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'Enter a full link, starting with https://' };
  }
  const formId = await ensureForm(order.id, order.accountId);
  await db()
    .update(tables.onboardingForms)
    .set({ briefLink, confirmedAt: new Date(), updatedAt: new Date() })
    .where(eq(tables.onboardingForms.id, formId));
  await completeStrategy(order.id);
  refresh();
  return { ok: true };
}
