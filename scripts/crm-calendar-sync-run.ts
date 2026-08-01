import { desc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { syncCalendars, outsideAttendees } from '@/lib/crm/calendar';
import { fmtMeeting } from '@/lib/crm/format';

// Run the Google Calendar sync by hand and print what it did. Needs a Vercel
// OIDC token in the environment (see the keyless auth note in CLAUDE.md):
//
//   vercel env pull /tmp/.env.vercel --environment=development --yes
//   set -a; source .env.local; export VERCEL_OIDC_TOKEN=$(grep '^VERCEL_OIDC_TOKEN=' /tmp/.env.vercel | cut -d= -f2- | tr -d '"'); set +a
//   npx tsx scripts/crm-calendar-sync-run.ts

async function main() {
  const summary = await syncCalendars();
  console.log('sync summary:', JSON.stringify(summary, null, 2));

  const rows = await db()
    .select()
    .from(tables.calendarEvents)
    .orderBy(desc(tables.calendarEvents.startAt))
    .limit(60);

  console.log(`\n${rows.length} rows in calendar_events (newest first):\n`);
  for (const r of rows) {
    const who = r.leadId ? `lead ${r.leadId.slice(0, 8)}` : r.accountId ? `client ${r.accountId.slice(0, 8)}` : 'UNMATCHED';
    const guests = outsideAttendees(r.attendees).join(', ') || '(no outside guests)';
    console.log(
      `${r.startAt ? fmtMeeting(r.startAt) : 'no time'} | ${r.owners.join('+').padEnd(9)} | ${who.padEnd(16)} | ${r.summary.slice(0, 42)}`,
    );
    console.log(`      ${guests.slice(0, 100)}${r.status !== 'confirmed' ? `  [${r.status}]` : ''}`);
  }

  const unmatched = rows.filter((r) => !r.leadId && !r.accountId);
  console.log(`\nmatched ${rows.length - unmatched.length} / ${rows.length}`);
  process.exit(0);
}

main();
