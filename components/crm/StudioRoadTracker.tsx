'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import { TopDownTaxi } from '@/components/TopDownTaxi';

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
 * The client tracker's milestone list, drawn as the same vertical road the
 * marketing process section uses: asphalt rail on the left, checkpoint nodes
 * ON the road, a green "traveled" fill behind the completed stages, and the
 * top-down taxi parked in the gap between the last completed milestone and
 * the next one. Position is data-driven (milestone completion), not
 * scroll-driven, so the car only moves when real progress is made.
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

  useLayoutEffect(() => {
    // The taxi's spot is static per data (the gap row / finish row anchors
    // it), but row heights depend on fonts + wrapping, so measure after
    // layout and re-measure on any resize.
    const place = () => {
      const c = containerRef.current;
      const a = anchorRef.current;
      const taxi = taxiRef.current;
      const fill = fillRef.current;
      if (!c || !taxi || !fill) return;
      if (!a) {
        taxi.style.opacity = '0';
        fill.style.height = '0';
        return;
      }
      const y = a.getBoundingClientRect().top - c.getBoundingClientRect().top;
      taxi.style.top = `${y}px`;
      taxi.style.opacity = '1';
      fill.style.height = `${Math.max(0, y)}px`;
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
      {/* THE ROAD: left rail, same construction as the marketing section
          (asphalt + shoulder highlights + dashed centerline + green fill). */}
      <div aria-hidden className="absolute left-0 top-0 bottom-0 w-10 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-[#1f1f1f]" />
        <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
        {/* GREEN PROGRESS FILL: top of road down to the taxi */}
        <div
          ref={fillRef}
          className="absolute top-0 inset-x-0"
          style={{
            height: '0px',
            background: 'linear-gradient(180deg, #2A9A4A 0%, var(--sign-green) 60%, #155A2A 100%)',
            boxShadow: '0 0 24px 4px rgba(31,122,58,0.45)',
          }}
        />
        {/* dashed centerline, over the fill */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px]"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.85) 50%, transparent 50%)',
            backgroundSize: '6px 28px',
            backgroundRepeat: 'repeat-y',
          }}
        />
        {/* checkered finish line once everything is delivered */}
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

      {/* TAXI: parked at the current gap (opacity flips on after the first
          client-side measurement so SSR doesn't flash it at the top). */}
      <div
        ref={taxiRef}
        aria-hidden
        className="absolute left-5 z-20 pointer-events-none select-none"
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
            {/* The work-in-progress gap: the taxi sits here, between the last
                completed checkpoint and the next one, so an un-ticked stage
                never reads as done. */}
            {s.state === 'current' && (
              <li className="relative flex items-center min-h-[92px] pl-16">
                <div ref={anchorRef} aria-hidden className="absolute left-0 top-1/2" />
                <span className="text-sm font-semibold text-[#f97316]">{statusLabel}</span>
              </li>
            )}
            <li className="relative pl-16 pb-7 min-h-[3.25rem] last:min-h-8 last:pb-0">
              {/* Checkpoint node, centered on the road */}
              <div
                className={`absolute left-5 top-0 -translate-x-1/2 z-10 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  s.state === 'done'
                    ? 'bg-[#1f7a3a] border-[#0e4a22] text-white'
                    : s.state === 'current'
                      ? 'bg-[#0a0a0a] border-[#ea580c] text-[#f97316]'
                      : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#6b6b6b]'
                }`}
              >
                {s.state === 'done' ? '✓' : s.n}
              </div>
              {/* Stage body */}
              <div className="min-w-0 pt-1">
                <div
                  className={`text-sm font-semibold ${
                    s.state === 'done' ? 'text-[#9ca3af]' : s.state === 'current' ? 'text-white' : 'text-[#6b6b6b]'
                  }`}
                >
                  {s.label}
                  {s.state === 'current' && (
                    <span className="ml-2 text-[11px] font-normal uppercase tracking-wide text-[#f97316]">up next</span>
                  )}
                </div>
                {s.dateText && <div className="text-xs text-[#6b6b6b] mt-0.5">{s.dateText}</div>}
                {s.deliveredLink && (
                  <a
                    href={s.deliveredLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sign-btn text-xs mt-2 !px-4 !py-2"
                  >
                    Open delivery
                  </a>
                )}
              </div>
            </li>
          </Fragment>
        ))}
        {/* Journey complete: taxi rolls up to the finish line */}
        {done && (
          <li className="relative flex items-center min-h-[84px] pl-16">
            <div ref={anchorRef} aria-hidden className="absolute left-0 top-1/2" />
            <span className="text-sm font-semibold text-[#2a9a4a]">{statusLabel}</span>
          </li>
        )}
      </ol>
    </div>
  );
}
