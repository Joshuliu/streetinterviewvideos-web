'use client';

import { useEffect, useState } from 'react';

// The sort control shared by the leads and clients lists: a segmented row of
// pills, not a native <select>. Every option is visible, so you can see what
// the list can do without opening anything, and one tap switches — on a phone
// a select costs a modal wheel and two taps for the same result.
//
// Sorting itself happens in the browser (both lists are already fully on the
// page) and the choice is remembered per list in localStorage, because a sort
// you have to re-pick on every visit is one nobody uses twice.
//
// The stored value is applied after mount, never in the useState initializer:
// the server has no localStorage, so seeding from it there would hydrate a
// different order than it rendered.

export interface SortOption<K extends string> {
  key: K;
  label: string;
}

export function useSortPreference<K extends string>(storageKey: string, options: SortOption<K>[], fallback: K) {
  const [sort, setSort] = useState<K>(fallback);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && options.some((o) => o.key === saved)) setSort(saved as K);
    // Options are module constants; the key is a literal. Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const choose = (key: K) => {
    setSort(key);
    window.localStorage.setItem(storageKey, key);
  };

  return [sort, choose] as const;
}

export function SortSelect<K extends string>({
  value,
  options,
  onChange,
  label = 'Sort',
}: {
  value: K;
  options: SortOption<K>[];
  onChange: (key: K) => void;
  label?: string;
}) {
  return (
    // items-start, not items-center: the pills wrap to two rows on a narrow
    // phone, and a vertically centred label next to a two-row group reads as
    // floating between them.
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-xs text-[var(--crm-faint)] shrink-0 pt-2">{label}</span>
      {/* role=group + aria-pressed rather than a listbox: these are buttons
          that act immediately, not a value being picked from a menu. */}
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-pill border border-[var(--crm-line)] bg-[var(--crm-soft)] p-1"
      >
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.key)}
              className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[var(--crm-accent-2)] text-white'
                  : 'text-[var(--crm-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-hover)]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
