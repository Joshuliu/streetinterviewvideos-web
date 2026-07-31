import { desc, isNotNull } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import {
  LEAD_HEAT_ORDER,
  deriveLeadStatus,
  leadHeat,
  type LeadMeetingRow,
  type LeadRow,
} from '@/lib/crm/leads';
import { LeadList, type LeadCardView, type LeadHeatSection } from '@/components/crm/LeadList';

export const dynamic = 'force-dynamic';

// Every funnel lead, ordered by heat rather than by funnel stage: calls ahead
// first, then by how recently we last touched the person (a call that happened
// or a note written about them). The funnel's own marker stops moving once a
// call is booked, so sorting by it collapsed most of the list into one
// undifferentiated "Meeting booked" pile with the coldest leads mixed into the
// hottest. Heat is derived on every render — see lib/crm/leads.ts — so there
// is no new field for anyone to keep up to date.

export default async function LeadsPage() {
  const d = db();
  const [leads, allMeetings, noteRows] = await Promise.all([
    d.select().from(tables.leads).orderBy(desc(tables.leads.updatedAt)),
    d.select().from(tables.leadMeetings),
    // Only the dates: a note's existence and day is the whole signal here.
    d
      .select({ leadId: tables.notes.leadId, date: tables.notes.date })
      .from(tables.notes)
      .where(isNotNull(tables.notes.leadId)),
  ]);

  const meetingsByLead = new Map<string, LeadMeetingRow[]>();
  for (const m of allMeetings) {
    const list = meetingsByLead.get(m.leadId) ?? [];
    list.push(m);
    meetingsByLead.set(m.leadId, list);
  }
  const noteDatesByLead = new Map<string, string[]>();
  for (const n of noteRows) {
    if (!n.leadId) continue;
    const list = noteDatesByLead.get(n.leadId) ?? [];
    list.push(n.date);
    noteDatesByLead.set(n.leadId, list);
  }

  // One clock for the whole page, so two leads an instant apart can't land on
  // opposite sides of a day boundary.
  const now = new Date();
  const view = (lead: LeadRow): LeadCardView & { sort: number } => {
    const meetings = meetingsByLead.get(lead.id) ?? [];
    const heat = leadHeat(lead, meetings, noteDatesByLead.get(lead.id) ?? [], now);
    return {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      adspend: lead.adspend,
      status: deriveLeadStatus(lead, meetings.some((m) => !m.canceledAt)),
      heat: heat.tier,
      reason: heat.reason,
      calls: heat.calls,
      sort: heat.sort,
    };
  };

  const active = leads.filter((l) => !l.convertedAccountId && !l.archivedAt).map(view);
  const sections: LeadHeatSection[] = LEAD_HEAT_ORDER.map((heat) => ({
    heat,
    leads: active.filter((l) => l.heat === heat).sort((a, b) => a.sort - b.sort),
  }));
  // Converted and archived keep their heat line (it still reads "last call
  // 12d ago"), but they're out of the working list and only surface by search.
  const done = leads.filter((l) => l.convertedAccountId || l.archivedAt).map(view);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Leads</h1>
      {leads.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">
          No leads yet. New funnel submissions on the marketing site land here automatically.
        </p>
      ) : (
        <LeadList sections={sections} done={done} />
      )}
    </div>
  );
}
