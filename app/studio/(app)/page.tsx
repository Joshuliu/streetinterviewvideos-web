import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { getClientSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Placeholder landing until build step 6 (order tracker). Proves the client
// session resolves to the right account.
export default async function StudioHomePage() {
  const session = (await getClientSession())!;
  const [account] = await db()
    .select({ name: tables.accounts.name })
    .from(tables.accounts)
    .where(eq(tables.accounts.id, session.accountId))
    .limit(1);

  return (
    <div>
      <h1 className="font-display text-3xl mb-4">Welcome, {account?.name ?? 'there'}</h1>
      <p className="text-[#9ca3af]">
        You’re logged in as <span className="text-white">{session.email}</span>. Your order tracker is on its way.
      </p>
    </div>
  );
}
