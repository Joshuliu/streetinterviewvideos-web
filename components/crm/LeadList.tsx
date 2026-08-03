'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { LEAD_HEAT_META, LEAD_SORTS, LEAD_STATUS_META, type LeadHeat, type LeadSort, type LeadStatus } from '@/lib/crm/leads';
import { SortSelect, useSortPreference } from '@/components/crm/SortSelect';

// The leads list, grouped by heat (see lib/crm/leads.ts) with a search box.
// Search is client-side on purpose: the whole list is already on the page, it
// is never going to be thousands of rows, and a round trip per keystroke would
// make it feel worse than the browser's own find. While a search is active the
// grouping is dropped for one flat list of every match — including converted
// and archived people, who are exactly who you're looking for when you type a
// name you half remember.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

// The reason line carries the sort order, so it's styled by how much it wants
// attention: a booked call reads loud, a month of silence reads quiet.
const REASON_TONE: Record<LeadHeat, string> = {
  upcoming: 'text-[#fdba74] font-semibold',
  recent: 'text-white',
  warm: 'text-[#9ca3af]',
  cold: 'text-[#6b6b6b]',
  new: 'text-[#9ca3af]',
};

export interface LeadCardView {
  id: string;
  name: string;
  company: string;
  email: string;
  adspend: string;
  status: LeadStatus;
  heat: LeadHeat;
  /** Plain English for the row's position, e.g. "Last call 32d ago". */
  reason: string;
  calls: number;
  /** Heat's own order within a section, ascending — the default sort. */
  sort: number;
  /** Epoch millis the lead came in, for "Newest in". */
  createdMs: number;
  /** Ad-spend tier, 0 when unanswered — see adspendRank(). */
  spendRank: number;
}

function comparator(sort: LeadSort): (a: LeadCardView, b: LeadCardView) => number {
  const displayName = (l: LeadCardView) => (l.name || l.email).toLowerCase();
  switch (sort) {
    case 'newest':
      return (a, b) => b.createdMs - a.createdMs;
    // Ties inside a spend tier fall back to heat, so the hottest of the big
    // budgets is still the first row.
    case 'spend':
      return (a, b) => b.spendRank - a.spendRank || a.sort - b.sort;
    case 'name':
      return (a, b) => displayName(a).localeCompare(displayName(b));
    default:
      return (a, b) => a.sort - b.sort;
  }
}

export interface LeadHeatSection {
  heat: LeadHeat;
  leads: LeadCardView[];
}

function LeadRow({ lead }: { lead: LeadCardView }) {
  const meta = LEAD_STATUS_META[lead.status];
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
      {/* Fixed width from sm up purely so the chips above and below line up
          into a column — a ragged edge makes the list much harder to scan.
          Full width on mobile, where it drops to its own line. */}
      <div className="text-xs basis-full break-words sm:basis-auto sm:w-56 sm:text-right">
        <span className={REASON_TONE[lead.heat]}>{lead.reason}</span>
        {lead.calls > 1 && <span className="text-[#6b6b6b]"> · {lead.calls} calls</span>}
      </div>
    </Link>
  );
}

function List({ leads }: { leads: LeadCardView[] }) {
  return (
    <ul className="divide-y divide-[#1f1f1f]">
      {leads.map((lead) => (
        <li key={lead.id}>
          <LeadRow lead={lead} />
        </li>
      ))}
    </ul>
  );
}

export function LeadList({ sections, done }: { sections: LeadHeatSection[]; done: LeadCardView[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useSortPreference<LeadSort>('siv.leadSort', LEAD_SORTS, 'heat');
  const q = query.trim().toLowerCase();

  const sorted = useMemo(() => {
    const cmp = comparator(sort);
    return {
      sections: sections.map((s) => ({ ...s, leads: [...s.leads].sort(cmp) })),
      done: [...done].sort(cmp),
    };
  }, [sort, sections, done]);

  const matches = useMemo(() => {
    if (!q) return null;
    const all = [...sorted.sections.flatMap((s) => s.leads), ...sorted.done];
    return all
      .filter((l) => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q))
      .sort(comparator(sort));
  }, [q, sorted, sort]);

  const total = sections.reduce((n, s) => n + s.leads.length, 0) + done.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, company or email"
          aria-label="Search leads"
          className={`${fieldStyles} w-full sm:w-80`}
        />
        <SortSelect value={sort} options={LEAD_SORTS} onChange={setSort} />
        {matches && (
          <span className="text-xs text-[#9ca3af]">
            {matches.length} of {total}
            <button type="button" onClick={() => setQuery('')} className="ml-3 text-[#fdba74] hover:underline">
              Clear
            </button>
          </span>
        )}
      </div>

      {matches ? (
        matches.length > 0 ? (
          <List leads={matches} />
        ) : (
          <p className="text-sm text-[#9ca3af]">Nobody matches “{query.trim()}”.</p>
        )
      ) : (
        <>
          {sorted.sections.map((section) => {
            const meta = LEAD_HEAT_META[section.heat];
            return (
              <section key={section.heat} className="mb-8">
                <h2 className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">
                  {meta.label}
                  {section.leads.length > 0 && <span className="text-[#6b6b6b]"> ({section.leads.length})</span>}
                </h2>
                <p className="text-[11px] text-[#6b6b6b] mb-1">
                  {meta.hint}
                  {sort === 'heat' && meta.order ? `, ${meta.order}` : ''}
                </p>
                {section.leads.length > 0 ? (
                  <List leads={section.leads} />
                ) : (
                  <p className="text-sm text-[#6b6b6b]">{meta.empty}</p>
                )}
              </section>
            );
          })}

          {sorted.done.length > 0 && (
            <details className="mt-10">
              <summary className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold cursor-pointer select-none">
                Converted &amp; archived ({sorted.done.length})
              </summary>
              <div className="mt-1">
                <List leads={sorted.done} />
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
