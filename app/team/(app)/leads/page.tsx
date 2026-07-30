import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import {
  LEAD_STATUS_META,
  deriveLeadStatus,
  headlineMeeting,
  type LeadMeetingRow,
  type LeadRow,
} from '@/lib/crm/leads';
import { fmtMeeting } from '@/lib/crm/format';

export const dynamic = 'force-dynamic';

// Every funnel lead, with or without a meeting booked. Meetings first
// (soonest at the top, so the row to open at call time is right there),
// then the rest, with converted/archived tucked into a collapsed section.
// Each lead's meeting shown is its NEXT upcoming one (else the latest past
// one) — follow-ups and history live on the lead page.

function LeadRowLink({ lead, meetings }: { lead: LeadRow; meetings: LeadMeetingRow[] }) {
  const live = meetings.filter((m) => !m.canceledAt);
  const meta = LEAD_STATUS_META[deriveLeadStatus(lead, live.length > 0)];
  const meeting = headlineMeeting(meetings);
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 hover:bg-[#141414] -mx-3 px-3 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1 basis-48">
        <div className="text-sm font-semibold text-white break-words">
          {lead.name || lead.email}
          {lead.company && <span className="font-normal text-[#9ca3af]"> · {lead.company}</span>}
        </div>
        <div className="text-xs text-[#9ca3af] mt-0.5 break-words">
          {lead.email}
          {lead.adspend ? ` · ${lead.adspend}/mo ads` : ''}
        </div>
      </div>
      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.className}`}>
        {meta.label}
      </span>
      {meeting ? (
        <div className="text-xs text-[#9ca3af] basis-full sm:basis-auto">
          Meeting: <span className="text-white font-semibold">{meeting.startAt ? fmtMeeting(meeting.startAt) : 'time not synced'}</span>
          {live.length > 1 && <span> · {live.length} total</span>}
        </div>
      ) : lead.stage === 'booked' ? (
        <div className="text-xs text-[#f97316] basis-full sm:basis-auto">Meeting time not synced, set it on the lead</div>
      ) : null}
    </Link>
  );
}

export default async function LeadsPage() {
  const d = db();
  const [leads, allMeetings] = await Promise.all([
    d.select().from(tables.leads).orderBy(desc(tables.leads.updatedAt)),
    d.select().from(tables.leadMeetings),
  ]);
  const meetingsByLead = new Map<string, LeadMeetingRow[]>();
  for (const m of allMeetings) {
    const list = meetingsByLead.get(m.leadId) ?? [];
    list.push(m);
    meetingsByLead.set(m.leadId, list);
  }
  const meetingsFor = (l: LeadRow) => meetingsByLead.get(l.id) ?? [];

  const active = leads.filter((l) => !l.convertedAccountId && !l.archivedAt);
  // Booked counts even when the time didn't sync from Calendly — those float
  // to the top (time unknown = needs a hand-entered time).
  const nextTime = (l: LeadRow) => headlineMeeting(meetingsFor(l))?.startAt?.getTime() ?? 0;
  const withMeeting = active
    .filter((l) => headlineMeeting(meetingsFor(l)) || l.stage === 'booked')
    .sort((a, b) => nextTime(a) - nextTime(b));
  const withoutMeeting = active.filter((l) => !withMeeting.includes(l));
  const done = leads.filter((l) => l.convertedAccountId || l.archivedAt);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Leads</h1>

      <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-1">Meetings booked</h2>
      <ul className="divide-y divide-[#1f1f1f] mb-8">
        {withMeeting.map((lead) => (
          <li key={lead.id}>
            <LeadRowLink lead={lead} meetings={meetingsFor(lead)} />
          </li>
        ))}
      </ul>
      {withMeeting.length === 0 && <p className="text-sm text-[#9ca3af] mb-8 -mt-6">No meetings on the books.</p>}

      <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold mb-1">No meeting yet</h2>
      <ul className="divide-y divide-[#1f1f1f]">
        {withoutMeeting.map((lead) => (
          <li key={lead.id}>
            <LeadRowLink lead={lead} meetings={meetingsFor(lead)} />
          </li>
        ))}
      </ul>
      {withoutMeeting.length === 0 && <p className="text-sm text-[#9ca3af]">Nothing waiting.</p>}

      {done.length > 0 && (
        <details className="mt-10">
          <summary className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold cursor-pointer select-none">
            Converted & archived ({done.length})
          </summary>
          <ul className="divide-y divide-[#1f1f1f] mt-1">
            {done.map((lead) => (
              <li key={lead.id}>
                <LeadRowLink lead={lead} meetings={meetingsFor(lead)} />
              </li>
            ))}
          </ul>
        </details>
      )}

      {leads.length === 0 && (
        <p className="text-sm text-[#9ca3af] mt-8">
          No leads yet. New funnel submissions on the marketing site land here automatically.
        </p>
      )}
    </div>
  );
}
