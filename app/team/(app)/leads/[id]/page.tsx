import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { LEAD_STATUS_META, deriveLeadStatus } from '@/lib/crm/leads';
import { leadNotes } from '@/lib/crm/notes';
import { fmtDate, fmtDateTime, todayISO } from '@/lib/crm/format';
import { ONBOARDING_FIELDS } from '@/lib/crm/onboarding';
import { ArchiveLeadButton, ConvertLeadForm, OnboardingFormEditor } from '@/components/crm/LeadControls';
import { Notes } from '@/components/crm/Notes';

export const dynamic = 'force-dynamic';

// Lead detail: everything the funnel captured, their calls, our internal notes
// (one stream per person — it follows them onto the client page when they
// convert), and the onboarding form we fill on their behalf during the sales
// call. That form is the client-facing one: it pre-seeds their onboarding after
// they pay and convert (phase 2).

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const d = db();
  const [lead] = await d.select().from(tables.leads).where(eq(tables.leads.id, params.id));
  if (!lead) notFound();
  const [[form], calls, notes] = await Promise.all([
    d.select().from(tables.onboardingForms).where(eq(tables.onboardingForms.leadId, lead.id)),
    // Status only — calls themselves aren't shown on this page any more, they
    // live on the task board. The chip still needs to know one happened.
    d
      .select({ status: tables.calendarEvents.status })
      .from(tables.calendarEvents)
      .where(eq(tables.calendarEvents.leadId, lead.id)),
    leadNotes(lead.id),
  ]);
  const status = deriveLeadStatus(lead, calls.some((c) => c.status !== 'cancelled'));
  const meta = LEAD_STATUS_META[status];
  const noteViews = notes.map((n) => ({
    id: n.id,
    date: fmtDate(n.date),
    text: n.text,
    fromLead: true,
  }));

  const blank = <span className="text-[#6b6b6b]">Not given</span>;
  const facts: Array<[string, React.ReactNode]> = [
    ['Email', lead.email],
    ['Phone', lead.phone || blank],
    [
      'Website',
      lead.website ? (
        <a key="w" href={lead.website} target="_blank" rel="noreferrer" className="text-[#fdba74] hover:underline break-all">
          {lead.website}
        </a>
      ) : (
        blank
      ),
    ],
    ['Monthly ad spend', lead.adspend || blank],
    ['Funnel stage', lead.stage || blank],
    ['First seen', fmtDateTime(lead.createdAt)],
  ];
  const utmEntries = Object.entries(lead.utm ?? {});

  return (
    <div className="max-w-3xl">
      <Link href="/leads" className="text-xs text-[#9ca3af] hover:text-white">
        ← All leads
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl break-words">{lead.name || lead.email}</h1>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.className}`}>{meta.label}</span>
      </div>
      {lead.company && <p className="text-sm text-[#9ca3af] mt-1 break-words">{lead.company}</p>}

      {lead.convertedAccountId && (
        <p className="mt-3 text-xs text-[#9ca3af]">
          Converted to a client.{' '}
          <Link href={`/clients/${lead.convertedAccountId}`} className="text-[#fdba74] hover:underline">
            Their client page
          </Link>{' '}
          carries these calls and notes forward, and is where new ones belong.
        </p>
      )}

      {/* Notes: ours only, and they follow this person into the client page
          after conversion */}
      <div id="notes" className="mt-8 scroll-mt-24">
        <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-1">Notes</h2>
        <p className="text-xs text-[#6b6b6b] mb-3">Ours only. The client never sees these.</p>
        <Notes leadId={lead.id} notes={noteViews} today={todayISO()} />
      </div>

      {/* Captured info */}
      <dl className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {facts.map(([label, value]) => (
          <div key={label as string}>
            <dt className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">{label}</dt>
            <dd className="text-sm text-white mt-0.5 break-words">{value}</dd>
          </div>
        ))}
        {utmEntries.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">Attribution</dt>
            <dd className="text-sm text-[#9ca3af] mt-0.5 break-words">
              {utmEntries.map(([k, v]) => `${k.replace('utm_', '')}: ${v}`).join(' · ')}
            </dd>
          </div>
        )}
      </dl>

      {/* Onboarding form */}
      <div className="mt-10">
        <h2 className="font-display text-xl mb-1">Onboarding form</h2>
        <p className="text-sm text-[#9ca3af] mb-5">
          The brief, not your notes. Fill it in with them on the call; after they pay it pre-seeds their onboarding, which
          they extend and confirm (or replace with a brief link) from their dashboard.
        </p>
        <OnboardingFormEditor
          leadId={lead.id}
          initial={Object.fromEntries(ONBOARDING_FIELDS.map((f) => [f, form?.[f] ?? '']))}
          updatedAt={form ? fmtDateTime(form.updatedAt) : null}
        />
      </div>

      {/* Convert / archive */}
      <div className="mt-10 pt-6 border-t border-[#2a2a2a] flex flex-wrap items-center gap-5">
        {lead.convertedAccountId ? (
          <Link href={`/clients/${lead.convertedAccountId}`} className="sign-btn-cta text-xs px-4 py-2">
            Open client page
          </Link>
        ) : (
          <ConvertLeadForm leadId={lead.id} name={lead.name} company={lead.company} email={lead.email} />
        )}
        {!lead.convertedAccountId && <ArchiveLeadButton leadId={lead.id} archived={!!lead.archivedAt} />}
      </div>
    </div>
  );
}
