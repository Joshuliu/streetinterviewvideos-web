'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Top-down NYC-yellow-taxi icon, nose pointed DOWN the page (in the same
 * direction the user is scrolling). Sized to ride comfortably on a ~40-56px
 * wide road. Inline SVG so we can tint and animate without loading external
 * assets.
 */
function TopDownTaxi() {
  return (
    <svg
      width="44"
      height="68"
      viewBox="0 0 40 60"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      {/* body */}
      <rect x="5" y="3" width="30" height="54" rx="7" fill="#F5D518" stroke="#0A0A0A" strokeWidth="1.4" />
      {/* hood + trunk seam lines */}
      <line x1="5" y1="14" x2="35" y2="14" stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="5" y1="46" x2="35" y2="46" stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="1" />
      {/* rear window (top) */}
      <rect x="9" y="16" width="22" height="11" rx="3" fill="#1F2937" />
      {/* windshield (bottom) */}
      <rect x="9" y="33" width="22" height="13" rx="3" fill="#1F2937" />
      {/* iconic checker stripe across the roof */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={9 + i * 3.7}
            y={27.5}
            width={3.7}
            height={5.5}
            fill={i % 2 === 0 ? '#0A0A0A' : '#F5D518'}
          />
        ))}
      </g>
      {/* side mirrors */}
      <rect x="2.5" y="22" width="3" height="5" rx="1" fill="#0A0A0A" />
      <rect x="34.5" y="22" width="3" height="5" rx="1" fill="#0A0A0A" />
      {/* headlights (at the bottom, leading the way) */}
      <circle cx="12" cy="53" r="1.8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="0.5" />
      <circle cx="28" cy="53" r="1.8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="0.5" />
      {/* taillights (at the top) */}
      <circle cx="12" cy="6.5" r="1.3" fill="#DC2626" />
      <circle cx="28" cy="6.5" r="1.3" fill="#DC2626" />
    </svg>
  );
}

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
  const [progress, setProgress] = useState(0); // 0 → 1

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress starts when the section is ~halfway up the viewport
      // and completes when the section's bottom passes that same line.
      const start = vh * 0.65;
      const span = rect.height;
      const scrolled = start - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / span));
      setProgress(p);
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
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
          className="absolute top-0 inset-x-0 will-change-[height]"
          style={{
            height: `${progress * 100}%`,
            background:
              'linear-gradient(180deg, #2A9A4A 0%, var(--sign-green) 60%, #155A2A 100%)',
            transition: 'height 80ms linear',
            boxShadow: '0 0 24px 4px rgba(31,122,58,0.45)',
          }}
        />
        {/* dashed centerline OVER the fill, white still, but slightly brighter */}
        <div
          className="absolute inset-x-0 top-0 left-1/2 -translate-x-1/2 w-[3px] pointer-events-none"
          style={{
            height: `${progress * 100}%`,
            backgroundImage:
              'linear-gradient(180deg, #fff 50%, transparent 50%)',
            backgroundSize: '6px 28px',
            backgroundRepeat: 'repeat-y',
            transition: 'height 80ms linear',
          }}
        />
      </div>

      {/* TAXI, drives down with scroll (top-down view, pointing down the road) */}
      <div
        aria-hidden
        className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 z-20 pointer-events-none select-none will-change-transform"
        style={{
          top: `${progress * 100}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'top 80ms linear',
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
