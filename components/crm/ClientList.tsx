'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CLIENT_GROUP_META, CLIENT_SORTS, type ClientGroup, type ClientSort } from '@/lib/crm/clients';
import type { OrderStatus } from '@/lib/crm/status';
import { SortSelect, useSortPreference } from '@/components/crm/SortSelect';
import { StatusChip } from '@/components/crm/StatusChip';

// The clients list, grouped by whether anything is ongoing (see
// lib/crm/clients.ts) with a search box. Search is client-side for the same
// reason the leads list is: the whole list is already on the page, and while a
// query is active the grouping drops to one flat list of every match —
// including wrapped-up clients, who are exactly who you're looking for when
// you type a half-remembered name.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

export interface ClientCardView {
  id: string;
  name: string;
  company: string | null;
  group: ClientGroup;
  /** The order line under the name: title · brand, or why there isn't one. */
  line: string;
  /** The current (else latest) order's stored status; null with no orders. */
  status: OrderStatus | null;
  /** Right-hand line: when the current order started, or the last activity. */
  detail: string;
  /** Epoch millis of the newest order, 0 if none — the default sort. */
  activityMs: number;
}

function comparator(sort: ClientSort): (a: ClientCardView, b: ClientCardView) => number {
  switch (sort) {
    case 'name':
      return (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    default:
      return (a, b) => b.activityMs - a.activityMs;
  }
}

export interface ClientGroupSection {
  group: ClientGroup;
  clients: ClientCardView[];
}

function ClientRow({ client }: { client: ClientCardView }) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 hover:bg-[var(--crm-hover)] -mx-3 px-3 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1 basis-48">
        <div className="text-sm font-semibold text-[var(--crm-text)] break-words">
          {client.name}
          {client.company && <span className="font-normal text-[var(--crm-muted)]"> · {client.company}</span>}
        </div>
        <div className="text-xs text-[var(--crm-muted)] mt-0.5 break-words">{client.line}</div>
      </div>
      {client.status && <StatusChip status={client.status} />}
      {/* Full width on mobile, where it drops to its own line; a fixed width
          from sm up so the dates line up into a scannable column. */}
      <div className="text-xs basis-full break-words sm:basis-auto sm:w-64 sm:text-right">
        <span className={client.group === 'quiet' ? 'text-[var(--crm-faint)]' : 'text-[var(--crm-muted)]'}>
          {client.detail}
        </span>
      </div>
    </Link>
  );
}

function List({ clients }: { clients: ClientCardView[] }) {
  return (
    <ul className="divide-y divide-[var(--crm-divide)]">
      {clients.map((client) => (
        <li key={client.id}>
          <ClientRow client={client} />
        </li>
      ))}
    </ul>
  );
}

export function ClientList({ sections, quiet }: { sections: ClientGroupSection[]; quiet: ClientCardView[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useSortPreference<ClientSort>('siv.clientSort', CLIENT_SORTS, 'activity');
  const q = query.trim().toLowerCase();

  const sorted = useMemo(() => {
    const cmp = comparator(sort);
    return {
      sections: sections.map((s) => ({ ...s, clients: [...s.clients].sort(cmp) })),
      quiet: [...quiet].sort(cmp),
    };
  }, [sort, sections, quiet]);

  const matches = useMemo(() => {
    if (!q) return null;
    const all = [...sorted.sections.flatMap((s) => s.clients), ...sorted.quiet];
    return all
      .filter((c) => `${c.name} ${c.company ?? ''} ${c.line}`.toLowerCase().includes(q))
      .sort(comparator(sort));
  }, [q, sorted, sort]);

  const total = sections.reduce((n, s) => n + s.clients.length, 0) + quiet.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, company or brand"
          aria-label="Search clients"
          className={`${fieldStyles} w-full sm:w-80`}
        />
        <SortSelect value={sort} options={CLIENT_SORTS} onChange={setSort} />
        {matches && (
          <span className="text-xs text-[var(--crm-muted)]">
            {matches.length} of {total}
            <button type="button" onClick={() => setQuery('')} className="ml-3 text-[var(--crm-accent-soft)] hover:underline">
              Clear
            </button>
          </span>
        )}
      </div>

      {matches ? (
        matches.length > 0 ? (
          <List clients={matches} />
        ) : (
          <p className="text-sm text-[var(--crm-muted)]">Nobody matches “{query.trim()}”.</p>
        )
      ) : (
        <>
          {sorted.sections.map((section) => {
            const meta = CLIENT_GROUP_META[section.group];
            return (
              <section key={section.group} className="mb-8">
                <h2 className="text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold">
                  {meta.label}
                  {section.clients.length > 0 && <span className="text-[var(--crm-faint)]"> ({section.clients.length})</span>}
                </h2>
                <p className="text-[11px] text-[var(--crm-faint)] mb-1">{meta.hint}</p>
                {section.clients.length > 0 ? (
                  <List clients={section.clients} />
                ) : (
                  <p className="text-sm text-[var(--crm-faint)]">{meta.empty}</p>
                )}
              </section>
            );
          })}

          {sorted.quiet.length > 0 && (
            <details className="mt-10">
              <summary className="text-xs uppercase tracking-wider text-[var(--crm-muted)] font-semibold cursor-pointer select-none">
                {CLIENT_GROUP_META.quiet.label} ({sorted.quiet.length})
              </summary>
              <p className="text-[11px] text-[var(--crm-faint)] mb-1">{CLIENT_GROUP_META.quiet.hint}</p>
              <List clients={sorted.quiet} />
            </details>
          )}
        </>
      )}
    </div>
  );
}
