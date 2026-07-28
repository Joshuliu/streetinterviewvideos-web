'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import { TopDownTaxi } from '@/components/TopDownTaxi';

// Road geometry: a 40px-wide rail with a 3px centerline, so the dash clears
// the left and right edges by 18.5px. The end dashes get the same clearance
// from the rounded caps, which is what makes them read as centered in the
// cap rather than crowding it.
const ROAD_W = 40;
const DASH_W = 3;
const DASH_INSET = (ROAD_W - DASH_W) / 2;
const DASH_TILE = 28; // preferred dash+gap pitch, adjusted to fit exactly

export type TrackerStage = {
  id: string;
  n: number;
  label: string;
  state: 'done' | 'current' | 'upcoming';
  dateText: string | null;
  deliveredLink: string | null;
};

/**
 * StudioRoadTracker
 * The client tracker's milestones drawn as the marketing site's road: asphalt
 * rail on the left, each milestone a highway sign-plate hanging off the road
 * on a mast, a green "traveled" fill behind the completed stretch, and the
 * top-down taxi driving the gap between the last completed sign and the next.
 *
 * The signs live OFF the road (not as nodes on it) for the same reason the
 * marketing section does it that way: a green tick on a green road has no
 * contrast, and a circle sitting inside a rounded rail never aligns to the
 * corner radius. On a mast, each sign gets its own chrome and reads at a
 * glance.
 *
 * The taxi's parking spot is data-driven (milestone completion), so it only
 * advances on real progress; the idle drive animation is what makes a static
 * page read as "work in progress".
 */
export function StudioRoadTracker({
  stages,
  statusLabel,
  done,
}: {
  stages: TrackerStage[];
  statusLabel: string;
  done: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const taxiRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Row heights depend on fonts + wrapping, so measure after layout and
    // re-measure on any resize rather than guessing an offset.
    const place = () => {
      const c = containerRef.current;
      const a = anchorRef.current;
      const taxi = taxiRef.current;
      const fill = fillRef.current;
      if (!c || !taxi || !fill) return;

      // Centerline dashes: the road's end caps are semicircles, so a dash
      // running to the very edge gets clipped by the curve and sits closer to
      // the cap than to the road's sides. Inset the line by DASH_INSET (the
      // same gap the dash has left and right of it) and size the repeating
      // tile so a WHOLE dash lands at each end — the tile has to divide the
      // run as k dashes + k-1 gaps, i.e. run = (k + 0.5) tiles.
      const dash = dashRef.current;
      if (dash) {
        const run = c.getBoundingClientRect().height - DASH_INSET * 2;
        if (run > 0) {
          const k = Math.max(1, Math.round(run / DASH_TILE - 0.5));
          dash.style.backgroundSize = `6px ${run / (k + 0.5)}px`;
        }
      }

      if (!a) {
        taxi.style.opacity = '0';
        fill.style.height = '0';
        return;
      }
      const y = a.getBoundingClientRect().top - c.getBoundingClientRect().top;
      taxi.style.top = `${y}px`;
      taxi.style.opacity = '1';
      // Fill stops where the car is, minus half its idle travel, so the green
      // never runs out ahead of the bumper at the top of the bob.
      fill.style.height = `${Math.max(0, y - 10)}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [stages, done]);

  return (
    <div ref={containerRef} className="relative">
      {/* THE ROAD: asphalt + shoulder highlights + dashed centerline + the
          green traveled fill, same construction as the marketing section. */}
      <div aria-hidden className="absolute left-0 top-0 bottom-0 w-10 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-[#1f1f1f]" />
        <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
        <div
          ref={fillRef}
          className="absolute top-0 inset-x-0"
          style={{
            height: '0px',
            background: 'linear-gradient(180deg, #2A9A4A 0%, var(--sign-green) 60%, #155A2A 100%)',
            boxShadow: '0 0 24px 4px rgba(31,122,58,0.45)',
          }}
        />
        <div
          ref={dashRef}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: `${DASH_INSET}px`,
            bottom: `${DASH_INSET}px`,
            width: `${DASH_W}px`,
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.85) 50%, transparent 50%)',
            backgroundSize: `6px ${DASH_TILE}px`,
            backgroundRepeat: 'repeat-y',
          }}
        />
        {done && (
          <div
            className="absolute bottom-0 inset-x-0 h-[14px]"
            style={{
              backgroundImage: 'repeating-conic-gradient(#e9e6da 0% 25%, #0a0a0a 0% 50%)',
              backgroundSize: '7px 7px',
            }}
          />
        )}
      </div>

      {/* TAXI: parked in the current gap, idling forward and back. Opacity
          flips on after the first measurement so SSR doesn't flash it at the
          top of the road. */}
      <div
        ref={taxiRef}
        aria-hidden
        className={`absolute left-5 z-20 pointer-events-none select-none ${done ? '' : 'tracker-taxi'}`}
        style={{
          top: '0px',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.45))',
        }}
      >
        <TopDownTaxi />
      </div>

      <ol className="relative">
        {stages.map((s) => (
          <Fragment key={s.id}>
            {/* The work-in-progress gap the taxi occupies: it sits between the
                last completed sign and the next one, so an un-ticked stage
                never reads as done. */}
            {s.state === 'current' && (
              <li className="relative flex items-center min-h-[104px] pl-[4.5rem]">
                <div ref={anchorRef} aria-hidden className="absolute left-0 top-1/2" />
                {/* Rides the same bob as the taxi so the label stays level
                    with the car it belongs to. */}
                <span className="tracker-chip tracker-chip--riding">{statusLabel}</span>
              </li>
            )}
            <li className="relative pl-[4.5rem] pb-8 last:pb-0">
              <div className="min-w-0">
                {/* Sign + mast. The mast hangs off the wrapper so it meets the
                    sign at its vertical center however many lines it wraps to,
                    and its far end lands exactly on the road's centerline
                    (72px of padding minus the 52px mast = the road center). */}
                <div className="relative inline-block max-w-full">
                  <span
                    aria-hidden
                    className={`absolute right-full top-1/2 -translate-y-1/2 h-[3px] w-[52px] ${
                      s.state === 'done' ? 'bg-[#0e4a22]' : s.state === 'current' ? 'bg-[#9a3412]' : 'bg-[#cfccc3]'
                    }`}
                  >
                    {/* Bolt where the mast meets the road */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border ${
                        s.state === 'done'
                          ? 'bg-[#e9e6da] border-[#0e4a22]'
                          : s.state === 'current'
                            ? 'bg-[#e9e6da] border-[#9a3412]'
                            : 'bg-[#4a4a4a] border-[#1a1a1a]'
                      }`}
                    />
                  </span>
                  <span
                    className={`milestone-sign max-w-full ${
                      s.state === 'done'
                        ? ''
                        : s.state === 'current'
                          ? 'milestone-sign--current'
                          : 'milestone-sign--upcoming'
                    }`}
                  >
                    <span className="opacity-70 shrink-0 whitespace-nowrap">
                      {s.state === 'done' ? '✓' : String(s.n).padStart(2, '0')} ·
                    </span>
                    <span className="break-words">{s.label}</span>
                  </span>
                </div>
                {s.dateText && <div className="text-xs text-[#6b6b6b] mt-2">{s.dateText}</div>}
                {s.deliveredLink && (
                  <a
                    href={s.deliveredLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sign-btn text-xs mt-3 !px-4 !py-2"
                  >
                    Open delivery
                  </a>
                )}
              </div>
            </li>
          </Fragment>
        ))}
        {/* Journey complete: the taxi rolls up to the finish line. */}
        {done && (
          <li className="relative flex items-center min-h-[96px] pl-[4.5rem]">
            <div ref={anchorRef} aria-hidden className="absolute left-0 top-1/2" />
            <span className="tracker-chip tracker-chip--done">{statusLabel}</span>
          </li>
        )}
      </ol>
    </div>
  );
}
