'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { moveVideo } from '@/app/team/(app)/portfolio/actions';

// The portfolio order editor: one flat draggable list, the same
// pointer-event drag as the task board (iOS Safari has no touch support for
// HTML5 drag-and-drop, and this tool gets used from a phone). The saved
// order IS the site: homepage shows the first 6, the hero wall the first 12,
// and the featured pair on /portfolio is the first unscripted plus the first
// scripted published row — so those chips are computed live right here, and
// dragging a row watches them move.

export interface ManagerVideo {
  id: string;
  slug: string;
  title: string;
  category: string;
  kind: 'scripted' | 'unscripted';
  published: boolean;
  poster: string;
}

interface DragState {
  id: string;
  title: string;
  y: number;
  targetIdx: number | null; // slot among the OTHER rows (dragged one excluded)
}

function featuredIds(rows: ManagerVideo[]): Set<string> {
  const pub = rows.filter((r) => r.published);
  const ids = new Set<string>();
  const un = pub.find((r) => r.kind === 'unscripted');
  const sc = pub.find((r) => r.kind === 'scripted');
  if (un) ids.add(un.id);
  if (sc) ids.add(sc.id);
  return ids;
}

export function PortfolioManager({ videos }: { videos: ManagerVideo[] }) {
  const [local, setLocal] = useState(videos);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setLocal(videos), [videos]);

  const featured = featuredIds(local);

  function computeTarget(clientY: number, cur: DragState): number | null {
    const list = listRef.current;
    if (!list) return null;
    const rows = [...list.querySelectorAll<HTMLElement>('[data-row-id]')].filter(
      (r) => r.dataset.rowId !== cur.id,
    );
    let idx = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  function startDrag(e: React.PointerEvent, v: ManagerVideo) {
    e.preventDefault();
    const state: DragState = { id: v.id, title: v.title, y: e.clientY, targetIdx: null };
    dragRef.current = state;
    setDrag(state);
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      if (ev.clientY < 110) window.scrollBy(0, -14);
      else if (ev.clientY > window.innerHeight - 110) window.scrollBy(0, 14);
      const next = { ...dragRef.current!, y: ev.clientY, targetIdx: computeTarget(ev.clientY, dragRef.current!) };
      dragRef.current = next;
      setDrag(next);
    };
    const finish = (commit: boolean) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.body.style.userSelect = '';
      const cur = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (commit && cur && cur.targetIdx !== null) commitDrop(cur);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function commitDrop(cur: DragState) {
    const remaining = local.filter((v) => v.id !== cur.id);
    const oldIdx = local.findIndex((v) => v.id === cur.id);
    const idx = cur.targetIdx!;
    const before = remaining[idx - 1] ?? null;
    const after = remaining[idx] ?? null;
    if ((before?.id ?? null) === null && (after?.id ?? null) === null) return;

    const moved = local[oldIdx];
    const next = [...remaining.slice(0, idx), moved, ...remaining.slice(idx)];
    if (next.every((v, i) => v.id === local[i].id)) return; // no-op drop
    setLocal(next);

    startTransition(async () => {
      const res = await moveVideo(cur.id, before?.id ?? null, after?.id ?? null);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  const dropLine = <li aria-hidden className="list-none h-0.5 bg-[var(--crm-accent)] rounded-full my-1" />;

  return (
    <div className={drag ? 'cursor-grabbing' : ''}>
      <ul ref={listRef} className="divide-y divide-[var(--crm-divide)]">
        {local.map((v, i) => {
          const visibleBefore = local.slice(0, i).filter((r) => r.id !== drag?.id).length;
          const showLine = drag && drag.targetIdx !== null && v.id !== drag.id && visibleBefore === drag.targetIdx;
          return (
            <li key={v.id} className="list-none">
              {showLine && dropLine}
              <div
                data-row-id={v.id}
                className={`flex items-center gap-3 py-2.5 ${drag?.id === v.id ? 'opacity-40' : ''}`}
              >
                <button
                  onPointerDown={(e) => startDrag(e, v)}
                  aria-label="Drag to reorder"
                  className="shrink-0 h-8 px-2 flex items-center text-[var(--crm-line-2)] hover:text-[var(--crm-faint)] cursor-grab select-none touch-none text-sm leading-none"
                >
                  ⠿
                </button>
                <span className="shrink-0 w-6 text-right text-xs tabular-nums text-[var(--crm-faint)]">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.poster}
                  alt=""
                  className={`shrink-0 h-14 w-8 rounded object-cover bg-[var(--crm-inset)] ${v.published ? '' : 'opacity-40'}`}
                />
                <Link href={`/portfolio/${v.id}`} className="min-w-0 flex-1 group">
                  <div
                    className={`text-sm font-semibold truncate group-hover:text-[var(--crm-accent-2)] transition-colors ${
                      v.published ? 'text-[var(--crm-text)]' : 'text-[var(--crm-muted)] line-through decoration-1'
                    }`}
                  >
                    {v.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--crm-muted)]">
                    <span className="capitalize">{v.kind}</span>
                    {v.category && (
                      <>
                        <span className="text-[var(--crm-line-2)]">·</span>
                        <span className="truncate">{v.category}</span>
                      </>
                    )}
                  </div>
                </Link>
                <div className="shrink-0 flex items-center gap-1.5">
                  {featured.has(v.id) && (
                    <span className="rounded-full border border-[var(--crm-chip-orange-line)] bg-[var(--crm-chip-orange-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--crm-chip-orange-text)]">
                      Featured
                    </span>
                  )}
                  {!v.published && (
                    <span className="rounded-full border border-[var(--crm-chip-line)] bg-[var(--crm-chip-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--crm-chip-text)]">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {drag && drag.targetIdx === local.filter((v) => v.id !== drag.id).length && dropLine}
      </ul>

      {/* Floating ghost of the dragged row */}
      {drag && (
        <div
          className="fixed left-4 right-4 z-50 pointer-events-none rounded-xl bg-[var(--crm-soft)] border border-[var(--crm-accent)] px-4 py-2.5 text-sm text-[var(--crm-text)] shadow-2xl truncate"
          style={{ top: drag.y + 10 }}
        >
          {drag.title}
        </div>
      )}
    </div>
  );
}
