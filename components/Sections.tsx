import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { SITE, CTA } from '@/lib/site';

export function Section({ children, className = '', dark = false, id }: { children: ReactNode; className?: string; dark?: boolean; id?: string }) {
  return (
    <section id={id} className={`${dark ? 'asphalt-bg text-white' : ''} ${className}`}>
      <div className="section-body max-w-site mx-auto px-6 lg:px-12 py-16 lg:py-24">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <span className={`kicker ${dark ? 'dark' : ''}`}>{children}</span>;
}

export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-h1 font-extrabold tracking-tight ${className}`}>{children}</h1>;
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-h2 font-extrabold tracking-tight ${className}`}>{children}</h2>;
}

export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-lead text-text-700 ${className}`}>{children}</p>;
}

export function TrustLine({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 text-sm ${dark ? 'text-white/75' : 'text-text-400'}`}>
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-70 pulse-dot" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span>
        Trusted by <span className="font-semibold tabular-nums">{SITE.brandsServed}+</span> brands
      </span>
    </div>
  );
}

export function CTAStack({ secondaryHref = '/work/', secondaryLabel = CTA.secondary, dark = false }: { secondaryHref?: string; secondaryLabel?: string; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button href={SITE.bookingUrl} external variant={dark ? 'darkPrimary' : 'primary'} dataCta="hero-book">
        {CTA.primary}
      </Button>
      <Button href={secondaryHref} variant={dark ? 'darkSecondary' : 'secondary'} dataCta="hero-secondary">
        {secondaryLabel}
      </Button>
    </div>
  );
}

export function FinalCTA({ headline = 'Ready to build your next campaign?', sub = 'Real people. Real reactions. Real ad creative.' }: { headline?: string; sub?: string }) {
  return (
    <section className="relative asphalt-bg text-white overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-[22rem] h-[22rem] rounded-full bg-accent/10 blur-3xl pointer-events-none"
      />
      <div aria-hidden className="absolute left-0 right-0 top-1/2 road-dash dark opacity-60 pointer-events-none" />
      <div className="relative max-w-site mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Eyebrow dark>Get started</Eyebrow>
            <h2 className="text-display-2 font-extrabold tracking-tight mt-5 mb-5 max-w-2xl">{headline}</h2>
            <p className="text-lead text-white/80 mb-8 max-w-xl">{sub}</p>
            <CTAStack dark secondaryHref="/work/" secondaryLabel="View Work" />
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="grid grid-cols-3 gap-4 lg:gap-6 lg:border-l lg:border-white/10 lg:pl-8">
              {[
                { stat: '600+', label: 'Brands' },
                { stat: '5–10', label: 'Days · fastest' },
                { stat: '100%', label: 'Owned' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-accent">{s.stat}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/60 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Brand = {
  name: string;
  logo?: string;
  // 'wordmark' = wide text logo. 'mark' = symbol/icon.
  type?: 'wordmark' | 'mark';
  // How to render this logo on a dark surface:
  //  - 'invert'  → logo is dark elements on transparent bg → invert to white
  //  - 'screen'  → logo has a dark/black background built in → mix-blend-mode: screen to knock it out
  //  - 'asis'    → already light or colorful, render unchanged
  treatment?: 'invert' | 'screen' | 'asis';
  scale?: number;
  // If the brand name is already visually part of the logo (e.g. Dell inside its
  // circle), skip the separate text label below.
  hideLabel?: boolean;
};

const BRANDS: Brand[] = [
  { name: 'Study.com',            logo: '/logos/study.svg',            type: 'wordmark', treatment: 'invert', scale: 1.0 },
  { name: 'Mott & Bow',           logo: '/logos/mottandbow.svg',       type: 'wordmark', treatment: 'invert', scale: 1.05 },
  { name: 'Dating.com',           logo: '/logos/dating.svg',           type: 'wordmark', treatment: 'invert', scale: 1.0 },
  { name: 'The Perfect Jean',     logo: '/logos/theperfectjean.png',   type: 'wordmark', treatment: 'invert', scale: 1.2 },
  { name: 'Gasper',               logo: '/logos/gasper.svg',           type: 'mark',     treatment: 'invert', scale: 0.7 },
  { name: 'Readability Tutor',    logo: '/logos/readabilitytutor.png', type: 'mark',     treatment: 'asis' },
  { name: 'Fella Health',         logo: '/logos/fellahealth.png',      type: 'mark',     treatment: 'asis' },
  { name: 'Nugenix',              logo: '/logos/nugenix.svg',          type: 'wordmark', treatment: 'invert', scale: 1.3 },
  { name: 'iFunny',               logo: '/logos/ifunny.png',           type: 'mark',     treatment: 'screen' },
  { name: 'Blackstone Launchpad', logo: '/logos/blackstone.png',       type: 'wordmark', treatment: 'asis',   scale: 1.4 },
  { name: 'Wordscapes',           logo: '/logos/wordscapes.png',       type: 'mark',     treatment: 'asis' },
  { name: 'DoorDash',             logo: '/logos/doordash.svg',         type: 'wordmark', treatment: 'asis',   scale: 1.0 },
  { name: 'Dell',                 logo: '/logos/dell.svg',             type: 'mark',     treatment: 'asis', scale: 1.1, hideLabel: true },
  { name: 'TikTok',               logo: '/logos/tiktok.svg',           type: 'wordmark', treatment: 'asis',   scale: 1.2 },
  { name: 'Dreama',               type: 'wordmark' },
];

// Single tile renderer shared between both lanes of the strip.
function BrandTile({ brand, baseHeight }: { brand: Brand; baseHeight: number }) {
  const scale = brand.scale ?? 1;
  const isWordmark = brand.type === 'wordmark';
  const showName = !isWordmark && !brand.hideLabel;
  const filter =
    brand.treatment === 'invert' ? 'brightness(0) invert(1)' :
    brand.treatment === 'asis' ? 'none' :
    undefined;
  const blend = brand.treatment === 'screen' ? ('screen' as const) : undefined;
  return (
    <div className="flex-none flex flex-col items-center justify-end gap-1.5" title={brand.name}>
      <div className="flex items-center justify-center" style={{ height: `${baseHeight}px` }}>
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            loading="lazy"
            className="object-contain"
            style={{
              height: `${baseHeight * scale * (isWordmark ? 0.55 : 0.9)}px`,
              maxWidth: isWordmark ? '200px' : '96px',
              filter,
              mixBlendMode: blend,
            }}
          />
        ) : (
          <span className="text-lg lg:text-xl font-extrabold tracking-tight whitespace-nowrap text-white">
            {brand.name}
          </span>
        )}
      </div>
      <span
        className={`text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap leading-none text-white/55 ${showName ? '' : 'invisible'}`}
        style={{ minHeight: '10px' }}
      >
        {brand.name || ' '}
      </span>
    </div>
  );
}

// Lane assignments are DISJOINT by name — the only mathematical guarantee
// that the same brand can never appear in both lanes simultaneously is to
// give each lane its own non-overlapping set. Within each lane, brands are
// ordered to alternate wordmark / mark for visual rhythm, and total widths
// are balanced so the two lanes scroll at the same visible pace.
const TOP_BRAND_NAMES = [
  'Study.com',          // wordmark
  'Gasper',             // mark
  'Mott & Bow',         // wordmark
  'Readability Tutor',  // mark
  'Dating.com',         // wordmark
  'Fella Health',       // mark
  'The Perfect Jean',   // wordmark
];
const BOTTOM_BRAND_NAMES = [
  'Nugenix',                // wordmark
  'Wordscapes',             // mark
  'Blackstone Launchpad',   // wordmark
  'iFunny',                 // mark
  'DoorDash',               // wordmark
  'Dell',                   // mark
  'TikTok',                 // wordmark
];

function buildLane(brandNames: string[]): Brand[] {
  const byName = new Map(BRANDS.map((b) => [b.name, b]));
  return brandNames.map((n) => byName.get(n)).filter((b): b is Brand => !!b);
}

function LaneRow({ items, direction }: { items: Brand[]; direction: 'left' | 'right' }) {
  // Duplicate the lane for seamless marquee loop.
  const set = [...items, ...items];
  const trackClass = direction === 'left' ? 'marquee-track' : 'marquee-track-reverse';
  return (
    <div className="overflow-hidden relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 lg:w-14 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 lg:w-14 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
      <div className={`${trackClass} gap-8 lg:gap-12 items-center py-1`}>
        {set.map((brand, i) => (
          <BrandTile key={`${direction}-${i}`} brand={brand} baseHeight={58} />
        ))}
      </div>
    </div>
  );
}

export function LogoStrip({ label }: { label?: string }) {
  const topLane = buildLane(TOP_BRAND_NAMES);
  const bottomLane = buildLane([...BOTTOM_BRAND_NAMES, 'Dreama']);
  return (
    <div className="relative asphalt-bg text-white border-y border-white/10 overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-3 h-px bg-white/30 pointer-events-none" />
      <div aria-hidden className="absolute inset-x-0 bottom-3 h-px bg-white/30 pointer-events-none" />

      <div className="relative max-w-site mx-auto px-6 lg:px-12 py-8 lg:py-10">
        {label && (
          <div className="text-center text-base lg:text-xl font-bold uppercase tracking-[0.16em] mb-6 lg:mb-8 text-white">
            {label}
          </div>
        )}
        <LaneRow items={topLane} direction="left" />
        <div className="relative my-3 lg:my-4">
          <div aria-hidden className="lane-dash" />
        </div>
        <LaneRow items={bottomLane} direction="right" />
      </div>
    </div>
  );
}

export function ProcessSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {steps.map((step, i) => (
        <div
          key={step.title}
          className="relative rounded-2xl bg-white border border-border p-6 lg:p-7 card-hover overflow-hidden"
        >
          <div
            aria-hidden
            className="absolute -top-4 -right-2 text-[7rem] lg:text-[8rem] font-extrabold leading-none tracking-tighter text-ink-900/[0.04] select-none pointer-events-none"
          >
            {String(i + 1).padStart(2, '0')}
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="sign-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-accent-deep text-[11px] font-extrabold uppercase tracking-[0.18em]">Step {i + 1}</span>
            </div>
            <div className="text-lg lg:text-xl font-extrabold text-ink-900 mb-2 tracking-tight">{step.title}</div>
            <div className="text-text-700 text-sm leading-relaxed">{step.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.q} className="group py-5 lg:py-6">
          <summary className="flex justify-between items-start gap-4 cursor-pointer list-none">
            <span className="font-semibold text-ink-900 text-base lg:text-lg pr-2 group-hover:text-accent transition-colors">
              {item.q}
            </span>
            <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink-900 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all group-open:bg-accent group-open:text-white group-open:border-accent">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-open:rotate-45">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
            </span>
          </summary>
          <div className="text-text-700 mt-3 leading-relaxed max-w-3xl">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function FormatGrid({ items }: { items: string[] }) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {items.map((item) => (
        <li
          key={item}
          className="group flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-ink-900 font-medium text-sm hover:border-ink-900/30 hover:translate-x-0.5 transition-all"
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-3 lg:gap-4">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3 text-ink-900 text-sm rounded-xl bg-white border border-border px-4 py-3 hover:border-ink-900/30 transition-colors">
          <span className="mt-0.5 text-accent shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,7 6,11 12,3" /></svg>
          </span>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export function PillarCards({ pillars, dark = false }: { pillars: { title: string; body: string }[]; dark?: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {pillars.map((p, i) => (
        <div
          key={p.title}
          className={`relative rounded-2xl border p-6 card-hover transition-colors overflow-hidden ${
            dark
              ? 'bg-white/[0.04] border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20'
              : 'bg-white border-border hover:border-ink-900/30'
          }`}
        >
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${dark ? 'via-accent/60' : 'via-accent'} to-transparent`} />
          <div className="flex items-center justify-between mb-4">
            <span className="sign-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="h-2 w-2 rounded-full bg-accent" />
          </div>
          <div className={`text-lg lg:text-xl font-extrabold mb-2 tracking-tight ${dark ? 'text-white' : 'text-ink-900'}`}>
            {p.title}
          </div>
          <div className={`text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-text-700'}`}>
            {p.body}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompareTwoCol({
  left,
  right,
}: {
  left: { title: string; body: string; bullets?: string[] };
  right: { title: string; body: string; bullets?: string[] };
}) {
  const cols = [
    { ...left, side: 'left' as const, href: '/services/scripted-street-interviews/' },
    { ...right, side: 'right' as const, href: '/services/unscripted-street-interviews/' },
  ];
  return (
    <div className="compare-row">
      {cols.map((col) => (
        <Link
          key={col.title}
          href={col.href}
          className={`compare-card compare-${col.side}`}
          aria-label={`${col.title} — learn more`}
        >
          <span aria-hidden className="compare-mast" />
          <span aria-hidden className="rivet-bl" />
          <span aria-hidden className="rivet-br" />

          <h3 className="compare-title">{col.title}</h3>
          <p className="compare-body">{col.body}</p>
          {col.bullets && (
            <ul className="compare-bullets">
              {col.bullets.map((b) => (
                <li key={b}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="2,7 6,11 12,3" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Two arrows per sign — like a real overhead exit sign that
              covers two highway lanes. Both arrows point in the same
              outward direction (CSS rotates the SVG per-side). */}
          <span aria-hidden className="compare-arrows">
            <span className="compare-arrow">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8 42 L 58 42 L 58 22 L 94 50 L 58 78 L 58 58 L 8 58 Z" />
              </svg>
            </span>
            <span className="compare-arrow">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 8 42 L 58 42 L 58 22 L 94 50 L 58 78 L 58 58 L 8 58 Z" />
              </svg>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function InternalLinkBlock({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="rounded-2xl bg-white border border-border p-6 lg:p-7">
      <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Related
      </div>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-2 text-ink-900 hover:text-accent text-sm font-medium transition-colors"
            >
              <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
              <span>{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="text-sm text-text-400 mb-6">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link href={item.href} className="hover:text-accent">{item.label}</Link>
          ) : (
            <span className="text-ink-900">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2 text-text-400">/</span>}
        </span>
      ))}
    </nav>
  );
}
