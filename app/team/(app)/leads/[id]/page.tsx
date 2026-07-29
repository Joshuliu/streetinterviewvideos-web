import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { LEAD_STATUS_META, deriveLeadStatus } from '@/lib/crm/leads';
import { fmtDateTime, fmtMeeting } from '@/lib/crm/format';
import { ArchiveLeadButton, ConvertLeadForm, MeetingEditor, OnboardingFormEditor } from '@/components/crm/LeadControls';

export const dynamic = 'force-dynamic';

// Lead detail: everything the funnel captured, the booked meeting, and the
// onboarding form we fill on their behalf during the sales call. Those notes
// pre-seed the client's onboarding after they pay and convert (phase 2).

/** datetime-local default in the business timezone (both admins are PT). */
function meetingLocalValue(d: Date | null): string {
  if (!d) return '';
  // sv-SE formats as "YYYY-MM-DD HH:MM:SS" — exactly datetime-local's shape.
  return d.toLocaleString('sv-SE', { timeZone: 'America/Los_Angeles' }).slice(0, 16).replace(' ', 'T');
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const d = db();
  const [lead] = await d.select().from(tables.leads).where(eq(tables.leads.id, params.id));
  if (!lead) notFound();
  const [form] = await d.select().from(tables.onboardingForms).where(eq(tables.onboardingForms.leadId, lead.id));
  const status = deriveLeadStatus(lead);
  const meta = LEAD_STATUS_META[status];

  const facts: Array<[string, React.ReactNode]> = [
    ['Email', lead.email],
    ['Phone', lead.phone || '—'],
    [
      'Website',
      lead.website ? (
        <a key="w" href={lead.website} target="_blank" rel="noreferrer" className="text-[#fdba74] hover:underline break-all">
          {lead.website}
        </a>
      ) : (
        '—'
      ),
    ],
    ['Monthly ad spend', lead.adspend || '—'],
    ['Funnel stage', lead.stage || '—'],
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

      {/* Meeting */}
      <div className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex-1 min-w-40">
          <div className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">Meeting</div>
          <div className="text-sm text-white mt-1">
            {lead.meetingAt ? fmtMeeting(lead.meetingAt) : lead.stage === 'booked' ? 'Booked — time not synced' : 'Not booked'}
          </div>
        </div>
        <MeetingEditor leadId={lead.id} initialLocal={meetingLocalValue(lead.meetingAt)} />
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
          Fill this in with them on the call. After they pay, these notes pre-seed their onboarding — they add their own
          and confirm, or upload a brief instead.
        </p>
        <OnboardingFormEditor
          leadId={lead.id}
          initial={{
            products: form?.products ?? '',
            hooks: form?.hooks ?? '',
            ctas: form?.ctas ?? '',
            hostPreferences: form?.hostPreferences ?? '',
            additionalNotes: form?.additionalNotes ?? '',
          }}
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
