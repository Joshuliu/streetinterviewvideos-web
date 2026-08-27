import { asc, eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db, tables } from '@/lib/db';

// The client welcome email: studio. login instructions plus the onboarding
// hand-off, sent when a NEW client's first order is created (createOrderAction
// calls maybeSendWelcomeEmails). Server-only — it imports the DB.
//
// Like the OTP mail (lib/auth/email.ts) this is transactional-only via Resend,
// and with no RESEND_API_KEY the email is logged to the console instead so the
// flow stays testable in dev. Each login email on the account gets its own
// copy, because the body tells the recipient which address to log in with.

const STUDIO_URL = 'https://studio.streetinterviewvideos.com';

export type WelcomeEmailInput = {
  contactName: string; // account.name — "Nathan Richardson"
  brand: string; // order.brand
  orderTitle: string;
  needsProduct: boolean | null;
  loginEmail: string; // the address this copy goes to, named in the body
};

export function buildWelcomeEmail(input: WelcomeEmailInput): { subject: string; text: string } {
  const first = input.contactName.trim().split(/\s+/)[0] || 'there';
  const productLine = input.needsProduct
    ? 'After that we send you our shoot brief. You approve it and get the product to our host, and we start filming.'
    : 'After that we send you our shoot brief. You approve it, and we start filming.';
  return {
    subject: `Your ${input.brand} order is booked. Here is your tracker login`,
    text: [
      `Hi ${first},`,
      '',
      `Your order is in: ${input.orderTitle}, for ${input.brand}. Here is how to follow it and what we need from you to get shooting.`,
      '',
      'YOUR ORDER TRACKER',
      `Every order has a live tracker at ${STUDIO_URL}. It shows each step, who owns it, and the expected dates.`,
      '',
      'LOGGING IN',
      `1. Go to ${STUDIO_URL}`,
      `2. Enter this email address (${input.loginEmail})`,
      '3. Enter the 6-digit code we send you',
      'No password to remember.',
      '',
      'FIRST STEP: YOUR ONBOARDING FORM',
      'Once you are in, the tracker asks for your onboarding form. Fill it in, or drop a link to your own brief if you already have one. It covers the product, hooks, CTAs, and who you want on camera. We write the shoot brief from it, so nothing gets filmed until it lands.',
      productLine,
      '',
      'Questions? Reply to this email.',
      '',
      'StreetInterviewVideos.com',
      'Real people. Real reactions.',
    ].join('\n'),
  };
}

export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
  to: string = input.loginEmail,
): Promise<void> {
  const { subject, text } = buildWelcomeEmail(input);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OTP_FROM_EMAIL ?? 'login@streetinterviewvideos.com';

  if (!apiKey) {
    console.log(`[welcome] DEV MODE: would send to ${to}:\n${subject}\n\n${text}`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `StreetInterviewVideos <${from}>`,
    to,
    replyTo: 'hello@streetinterviewvideos.com',
    subject,
    text,
  });
  if (error) {
    console.error('[welcome] Resend send failed:', error);
    throw new Error('welcome_send_failed');
  }
}

/**
 * Send the welcome email for a just-created order IF it is the account's first
 * (Neil's ask: a NEW client gets login + onboarding instructions; a repeat
 * order must not re-teach an existing client how to log in). One copy per
 * login email on the account. Returns how many were sent so the caller can
 * surface "no login email on file" instead of silently emailing nobody.
 * Never throws — order creation must not fail because an email did.
 */
export async function maybeSendWelcomeEmails(orderId: string): Promise<number> {
  try {
    const d = db();
    const [order] = await d.select().from(tables.orders).where(eq(tables.orders.id, orderId));
    if (!order) return 0;
    const orders = await d
      .select({ id: tables.orders.id })
      .from(tables.orders)
      .where(eq(tables.orders.accountId, order.accountId));
    if (orders.length !== 1) return 0; // repeat order, not a new client
    const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, order.accountId));
    if (!account) return 0;
    const logins = await d
      .select({ email: tables.loginEmails.email })
      .from(tables.loginEmails)
      .where(eq(tables.loginEmails.accountId, order.accountId))
      .orderBy(asc(tables.loginEmails.createdAt));
    if (!logins.length) {
      console.warn(`[welcome] account ${account.name} has no login email; welcome email not sent`);
      return 0;
    }
    let sent = 0;
    for (const { email } of logins) {
      await sendWelcomeEmail({
        contactName: account.name,
        // brand is enforced non-empty at creation; the column just predates that.
        brand: order.brand ?? order.title,
        orderTitle: order.title,
        needsProduct: order.needsProduct,
        loginEmail: email,
      });
      sent++;
    }
    return sent;
  } catch (e) {
    console.error('[welcome] failed:', e);
    return 0;
  }
}
