'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Your own mutations already call router.refresh(); this covers everyone
// else's — the other admin's edits and the 10-minute calendar-sync cron.
// Refreshes the server-component payload when the tab regains focus and on
// an interval while it stays visible. Client component state (search boxes,
// half-typed notes) survives a refresh, but we still skip refreshing while
// a field is focused so the data under an open form never shifts mid-edit.
const INTERVAL_MS = 60_000;
const MIN_GAP_MS = 5_000; // focus + visibilitychange both fire on tab switch

export function AutoRefresh() {
  const router = useRouter();
  const lastRefresh = useRef(Date.now());

  useEffect(() => {
    const refresh = () => {
      if (document.hidden) return;
      if (Date.now() - lastRefresh.current < MIN_GAP_MS) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      lastRefresh.current = Date.now();
      router.refresh();
    };

    const id = setInterval(refresh, INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router]);

  return null;
}
