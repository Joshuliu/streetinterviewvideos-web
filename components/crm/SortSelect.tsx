'use client';

import { useEffect, useState } from 'react';

// The sort control shared by the leads and clients lists. Sorting happens in
// the browser — both lists are already fully on the page — and the choice is
// remembered per list in localStorage, because a sort you have to re-pick on
// every visit is one nobody uses twice.
//
// The stored value is applied after mount, never in the useState initializer:
// the server has no localStorage, so seeding from it there would hydrate a
// different order than it rendered.

export interface SortOption<K extends string> {
  key: K;
  label: string;
}

/** text-base at the default breakpoint, or iOS Safari zooms the page on tap. */
const selectStyles =
  'rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-2 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-[#f97316]';

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
  label = 'Sort by',
}: {
  value: K;
  options: SortOption<K>[];
  onChange: (key: K) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[#9ca3af]">
      <span className="shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as K)}
        aria-label={label}
        className={selectStyles}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
