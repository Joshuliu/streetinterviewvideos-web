'use client';

import { useEffect, useRef, useState } from 'react';
import { TopDownTaxi } from '@/components/TopDownTaxi';

/**
 * RoadProcess
 * Renders a vertical "road" with the process steps as signs hanging off it.
 *
 * Desktop (lg+): road runs down the center, signs alternate left/right.
 * Mobile: road runs along the left edge, all signs to its right.
 *
 * As the user scrolls past this section, a green progress line fills the
 * road from top to current scroll position, and a 🚗 marker rides along
 * the road with the user.
 */
export function RoadProcess({ steps }: { steps: { title: string; body: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const taxiRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const fillDashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Drive the taxi + progress fill with a self-sustaining rAF loop that runs
    // ONLY while the section is on-screen (gated by IntersectionObserver, so it
    // isn't burning frames the rest of the page). Reading getBoundingClientRect
    // every frame tracks the live scroll position even on iOS, where scroll
    // events are sparse during momentum scrolling — that, plus writing styles
    // straight to the DOM (no React re-render) and dropping the CSS transition,
    // is what kills the "car only moves after scrolling stops" lag.
    let raf = 0;
    let running = false;
    const apply = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.65;
      const span = rect.height || 1;
      const p = Math.max(0, Math.min(1, (start - rect.top) / span));
      const pct = `${p * 100}%`;
      if (taxiRef.current) taxiRef.current.style.top = pct;
      if (fillRef.current) fillRef.current.style.height = pct;
      if (fillDashRef.current) fillDashRef.current.style.height = pct;
    };
    const tick = () => {
      apply();
      if (running) raf = requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startLoop();
        else {
          stopLoop();
          apply(); // settle to final position when leaving view
        }
      },
      { threshold: 0 }
    );
    if (ref.current) io.observe(ref.current);
    apply();
    window.addEventListener('resize', apply);
    return () => {
      stopLoop();
      io.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* THE ROAD, z-[5]: above the masts (auto) but below sign-plates (z-10) */}
      <div
        aria-hidden
        className="absolute left-6 lg:left-1/2 top-0 bottom-0 lg:-translate-x-1/2 w-10 lg:w-14 rounded-full overflow-hidden z-[5]"
      >
        {/* asphalt body */}
        <div className="absolute inset-0 bg-ink-900" />
        {/* white dashed centerline */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px]"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.85) 50%, transparent 50%)',
            backgroundSize: '6px 28px',
            backgroundRepeat: 'repeat-y',
          }}
        />
        {/* shoulder highlights */}
        <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
        {/* GREEN PROGRESS FILL */}
        <div
          ref={fillRef}
          className="absolute top-0 inset-x-0 will-change-[height]"
          style={{
            height: '0%',
            background:
              'linear-gradient(180deg, #2A9A4A 0%, var(--sign-green) 60%, #155A2A 100%)',
            boxShadow: '0 0 24px 4px rgba(31,122,58,0.45)',
          }}
        />
        {/* dashed centerline OVER the fill, white still, but slightly brighter */}
        <div
          ref={fillDashRef}
          className="absolute inset-x-0 top-0 left-1/2 -translate-x-1/2 w-[3px] pointer-events-none"
          style={{
            height: '0%',
            backgroundImage:
              'linear-gradient(180deg, #fff 50%, transparent 50%)',
            backgroundSize: '6px 28px',
            backgroundRepeat: 'repeat-y',
          }}
        />
      </div>

      {/* TAXI, drives down with scroll (top-down view, pointing down the road) */}
      <div
        ref={taxiRef}
        aria-hidden
        className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 z-20 pointer-events-none select-none will-change-transform"
        style={{
          top: '0%',
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.45))',
        }}
      >
        <TopDownTaxi />
      </div>

      {/* STEP ROWS, no z-index on the container so children can sit on
          either side of the road in z-stacking (masts behind, signs in front). */}
      <div className="relative space-y-16 lg:space-y-24 py-10 lg:py-16">
        {steps.map((s, i) => {
          const isLeft = i % 2 === 0;
          return <StepRow key={s.title} step={s} index={i} isLeft={isLeft} sectionRef={ref} />;
        })}
      </div>
    </div>
  );
}

/**
 * A single row in the road. Step is mounted on the appropriate side and has
 * a horizontal "mast" attaching its sign to the road. The whole row fades
 * in slightly + slides toward the road when it enters the viewport, so each
 * sign feels like it's "passing" the driver.
 */
function StepRow({
  step,
  index,
  isLeft,
  sectionRef,
}: {
  step: { title: string; body: string };
  index: number;
  isLeft: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!rowRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.35) {
            setPassed(true);
          }
        }
      },
      { threshold: [0.35, 0.6], rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(rowRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="grid lg:grid-cols-2 lg:gap-x-24 items-center"
    >
      {/* Single-column on mobile (all signs on right of road).
          Two-column on desktop (alternating side). */}
      <div
        className={[
          'relative',
          // mobile: pad past the road so content sits to its right
          'pl-20',
          // desktop placement, no inner padding; sign sits at column edge nearest the road
          isLeft ? 'lg:col-start-1 lg:pl-0 lg:pr-0 lg:text-right' : 'lg:col-start-2 lg:pl-0 lg:pr-0 lg:text-left',
          'transition-all duration-700 ease-out',
          passed ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-3 lg:-translate-x-6' : 'translate-x-3 lg:translate-x-6'}`,
        ].join(' ')}
      >
        {/* SIGN + BODY stack. The sign-plate sits in a relative wrapper
            alongside the mast, they're siblings so each can be z-stacked
            independently (mast behind the road, sign-plate in front). */}
        <div className={`inline-flex flex-col gap-3 ${isLeft ? 'lg:items-end' : 'lg:items-start'} items-start max-w-md`}>
          <div className="relative">
            {/* MAST, auto z-index (no stacking context); the road's z-[5]
                renders ABOVE this, the sign-plate's z-10 renders below the road. */}
            <span
              aria-hidden
              className={[
                'absolute top-1/2 -translate-y-1/2 h-[3px] bg-ink-900',
                // mobile: mast on left of sign (road is to the left)
                'right-full w-[44px]',
                // desktop: side depends on which column the sign is in
                isLeft
                  ? 'lg:left-full lg:right-auto lg:w-[60px]'
                  : 'lg:right-full lg:left-auto lg:w-[60px]',
              ].join(' ')}
            />
            <span className="sign-plate relative z-10">
              <span className="sign-plate-rivet-bl" />
              <span className="sign-plate-rivet-br" />
              <span className="opacity-70 mr-1">{String(index + 1).padStart(2, '0')} ·</span>
              {step.title}
            </span>
          </div>
          <p className="text-text-700 text-sm lg:text-base leading-relaxed">{step.body}</p>
        </div>
      </div>
    </div>
  );
}
