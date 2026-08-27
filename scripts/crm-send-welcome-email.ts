/**
 * Send the client welcome email (studio. login + onboarding instructions) for
 * one order, by hand. The automatic path is createOrderAction →
 * maybeSendWelcomeEmails (first order on the account only); this script covers
 * the manual cases: a test send, a resend, or an existing client who predates
 * the automation.
 *
 * Usage:
 *   set -a; source .env.local; set +a; npx tsx scripts/crm-send-welcome-email.ts "<order id or title substring>" [--to test@example.com]
 *
 * Without --to, one copy goes to each login email on the account (the real
 * thing). With --to, every copy is delivered to that address instead, body
 * unchanged, so you can preview exactly what the client would get. If the
 * account has no login emails, --to also stands in for the login address in
 * the body (and the automatic send would have been skipped entirely).
 */
import { asc, eq, ilike, or } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/crm/welcome';

async function main() {
  const args = process.argv.slice(2);
  const toFlag = args.indexOf('--to');
  const overrideTo = toFlag >= 0 ? args[toFlag + 1] : null;
  const query = args.filter((_, i) => i !== toFlag && i !== toFlag + 1)[0];
  if (!query || (toFlag >= 0 && !overrideTo)) {
    console.error('Usage: crm-send-welcome-email.ts "<order id or title substring>" [--to email]');
    process.exit(1);
  }

  const d = db();
  const isUuid = /^[0-9a-f-]{36}$/i.test(query);
  const orders = await d
    .select()
    .from(tables.orders)
    .where(isUuid ? eq(tables.orders.id, query) : or(ilike(tables.orders.title, `%${query}%`), ilike(tables.orders.brand, `%${query}%`)));
  if (orders.length !== 1) {
    console.error(`Matched ${orders.length} orders for "${query}" — need exactly 1:`);
    for (const o of orders) console.error(`  ${o.id}  ${o.brand}: ${o.title}`);
    process.exit(1);
  }
  const order = orders[0];
  const [account] = await d.select().from(tables.accounts).where(eq(tables.accounts.id, order.accountId));
  const logins = await d
    .select({ email: tables.loginEmails.email })
    .from(tables.loginEmails)
    .where(eq(tables.loginEmails.accountId, order.accountId))
    .orderBy(asc(tables.loginEmails.createdAt));

  let loginEmails = logins.map((l) => l.email);
  if (!loginEmails.length) {
    if (!overrideTo) {
      console.error(`${account.name} has no login email on file — add one on the client page first.`);
      process.exit(1);
    }
    console.warn(`NOTE: ${account.name} has no login email on file. Using ${overrideTo} as the stand-in; the automatic welcome email would NOT have sent for this account.`);
    loginEmails = [overrideTo];
  }

  for (const loginEmail of loginEmails) {
    const to = overrideTo ?? loginEmail;
    await sendWelcomeEmail(
      {
        contactName: account.name,
        brand: order.brand ?? order.title,
        orderTitle: order.title,
        needsProduct: order.needsProduct,
        loginEmail,
      },
      to,
    );
    console.log(`Sent: ${order.brand} (${order.title}) welcome for login ${loginEmail} → delivered to ${to}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
