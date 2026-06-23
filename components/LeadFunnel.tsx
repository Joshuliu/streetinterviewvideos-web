'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SITE } from '@/lib/site';

// Multi-step lead funnel that replaces Meta lead-ad forms. Flow:
//   Stop 1: name + email          → fire Pixel "Lead", POST partial capture
//   Stop 2: company + website url
//   Stop 3: monthly ad spend      → fire "CompleteRegistration", POST full lead
//   Stop 4: Calendly (prefilled)  → existing event_scheduled listener fires
//                                    Pixel "Schedule" on a completed booking.
// Required gate: each stop validates before the next appears; Calendly only
// renders after stop 3. Street-sign themed on the dark asphalt surface to
// match the homepage hero.

const ADSPEND_OPTIONS = [
  { value: 'Under $5k', label: 'Under $5k', sub: 'Getting started' },
  { value: '$5k–25k', label: '$5k–25k', sub: 'Scaling up' },
  { value: '$25k–100k', label: '$25k–100k', sub: 'Growth mode' },
  { value: '$100k–500k', label: '$100k–500k', sub: 'High volume' },
  { value: '$500k–1M', label: '$500k–1M', sub: 'Big league' },
  { value: '$1M+', label: '$1M+', sub: 'Enterprise' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Calendly widget.js is loaded once in the layout (CalendlyBooking). We just
// wait for window.Calendly to exist before initialising the inline embed.
type CalendlyWindow = Window & {
  Calendly?: {
    initInlineWidget: (opts: {
      url: string;
      parentElement: HTMLElement;
      prefill?: Record<string, unknown>;
    }) => void;
  };
  fbq?: (...args: unknown[]) => void;
};

type Step = 1 | 2 | 3 | 4;

const STOPS = ['You', 'Brand', 'Budget', 'Book'];

export function LeadFunnel() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [adspend, setAdspend] = useState('');
  const [error, setError] = useState('');
  // Calendly reports its content height via postMessage; we grow the embed to
  // fit so it never scrolls internally (an internal scroll would move the
  // "Powered by Calendly" ribbon out from under our corner mask). The page
  // scrolls instead. Default covers the date view before the first message.
  const [embedHeight, setEmbedHeight] = useState(640);
  const calendlyRef = useRef<HTMLDivElement>(null);

  // UTM / attribution captured from the landing URL, forwarded to both the
  // lead webhook and Calendly so each booking keeps its campaign source.
  const utm = useMemo<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
    return out;
  }, []);

  const postLead = useCallback(
    (stage: 'partial' | 'complete') => {
      // Fire-and-forget — never block the visitor on the network.
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, name, email, company, website, adspend, utm }),
        keepalive: true,
      }).catch(() => {});
    },
    [name, email, company, website, adspend, utm]
  );

  function goNext() {
    setError('');
    if (step === 1) {
      if (!name.trim()) return setError('Add your name so we know who we’re talking to.');
      if (!EMAIL_RE.test(email.trim())) return setError('That email doesn’t look right. Mind checking it?');
      // Capture the lead the moment we have contact details.
      const w = window as CalendlyWindow;
      if (w.fbq) w.fbq('track', 'Lead');
      postLead('partial');
      return setStep(2);
    }
    if (step === 2) {
      if (!company.trim()) return setError('What’s the brand or company name?');
      if (!website.trim()) return setError('Drop your website so we can take a look first.');
      return setStep(3);
    }
    if (step === 3) {
      if (!adspend) return setError('Pick a monthly ad spend so we can tailor the call.');
      const w = window as CalendlyWindow;
      if (w.fbq) w.fbq('track', 'CompleteRegistration');
      postLead('complete');
      return setStep(4);
    }
  }

  function goBack() {
    setError('');
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  // Normalise a typed website into a clean https URL for Calendly/CRM.
  const normalizedWebsite = useMemo(() => {
    const w = website.trim();
    if (!w) return '';
    return /^https?:\/\//i.test(w) ? w : `https://${w}`;
  }, [website]);

  // Split the full name so we can prefill Calendly whether its event uses a
  // single "Name" field or split "First name / Last name" fields.
  const [firstName, lastName] = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return [parts[0] || '', parts.slice(1).join(' ')];
  }, [name]);

  // Build the prefilled Calendly URL once we reach the booking stop.
  const calendlyUrl = useMemo(() => {
    const url = new URL(SITE.bookingUrl);
    if (name.trim()) url.searchParams.set('name', name.trim());
    // Split-name events read first_name/last_name instead of name; set both so
    // the name prefills regardless of how the event is configured.
    if (firstName) url.searchParams.set('first_name', firstName);
    if (lastName) url.searchParams.set('last_name', lastName);
    if (email.trim()) url.searchParams.set('email', email.trim());
    // a1/a2/a3 prefill Calendly custom questions if the event has them; if
    // not, Calendly safely ignores unknown params.
    if (company.trim()) url.searchParams.set('a1', company.trim());
    if (normalizedWebsite) url.searchParams.set('a2', normalizedWebsite);
    if (adspend) url.searchParams.set('a3', `Monthly ad spend: ${adspend}`);
    for (const [k, v] of Object.entries(utm)) url.searchParams.set(k, v);
    // Match the brand: CTA-orange booking action (primary_color does apply on
    // the current embed; full dark background_color does not, so we frame the
    // widget in a clean white card instead — see the wrapper below).
    // hide_event_type_details drops Calendly's own host/title header AND the
    // "Powered by Calendly" ribbon that sits over it — we provide that context
    // ourselves above the embed. hide_gdpr_banner removes the cookie strip.
    url.searchParams.set('primary_color', 'ea580c');
    url.searchParams.set('hide_event_type_details', '1');
    url.searchParams.set('hide_gdpr_banner', '1');
    return url.toString();
  }, [name, firstName, lastName, email, company, normalizedWebsite, adspend, utm]);

  // Initialise the Calendly inline embed when stop 4 mounts.
  useEffect(() => {
    if (step !== 4 || !calendlyRef.current) return;
    const el = calendlyRef.current;
    let cancelled = false;
    let attempts = 0;
    // Grow the embed to Calendly's reported content height so it never scrolls
    // internally. Tiny transient values are emitted during load (2px/26px) —
    // ignore anything implausibly short.
    const onHeight = (e: MessageEvent) => {
      if (e.origin !== 'https://calendly.com') return;
      const d = e.data as { event?: string; payload?: { height?: string } } | null;
      if (!d || d.event !== 'calendly.page_height' || !d.payload?.height) return;
      const h = parseInt(d.payload.height, 10);
      if (h > 300) setEmbedHeight(h);
    };
    window.addEventListener('message', onHeight);
    const tryInit = () => {
      if (cancelled) return;
      const w = window as CalendlyWindow;
      if (w.Calendly && el) {
        el.innerHTML = '';
        w.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: el,
          prefill: {
            name: name.trim(),
            firstName,
            lastName,
            email: email.trim(),
            customAnswers: {
              a1: company.trim(),
              a2: normalizedWebsite,
              a3: adspend ? `Monthly ad spend: ${adspend}` : '',
            },
          },
        });
        return;
      }
      if (attempts++ < 40) setTimeout(tryInit, 200);
    };
    tryInit();
    return () => {
      cancelled = true;
      window.removeEventListener('message', onHeight);
    };
  }, [step, calendlyUrl, name, firstName, lastName, email, company, normalizedWebsite, adspend]);

  return (
    <section className="relative asphalt-bg text-white overflow-hidden min-h-[100svh]">
      {/* ambient glows, matching the hero / FinalCTA treatment */}
      <div aria-hidden className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-24 -left-24 w-[22rem] h-[22rem] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 lg:px-8 pt-36 pb-20 lg:pt-40">
        {/* Progress: four mile-marker stops */}
        <ProgressRoute step={step} />

        <div className="mt-8 lg:mt-10">
          {step === 1 && (
            <StepShell
              eyebrow="Stop 1 of 4"
              title="Let’s get you on the map"
              sub="Real people. Real reactions. Tell us who to send the game plan to."
            >
              <Field
                label="Your name"
                value={name}
                onChange={setName}
                placeholder="Alex Rivera"
                autoFocus
                onEnter={goNext}
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="alex@brand.com"
                onEnter={goNext}
              />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              eyebrow="Stop 2 of 4"
              title="Which brand are we repping?"
              sub="We’ll pull up your site before we hop on, so the call starts with ideas — not intros."
            >
              <Field
                label="Company / brand name"
                value={company}
                onChange={setCompany}
                placeholder="Rivera Athletics"
                autoFocus
                onEnter={goNext}
              />
              <Field
                label="Website URL"
                value={website}
                onChange={setWebsite}
                placeholder="riveraathletics.com"
                inputMode="url"
                onEnter={goNext}
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              eyebrow="Stop 3 of 4"
              title="What’s your monthly ad spend?"
              sub="No exact figure needed — just the lane you’re in so we tailor the call."
            >
              <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
                {ADSPEND_OPTIONS.map((opt) => {
                  const active = adspend === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setError('');
                        setAdspend(opt.value);
                      }}
                      aria-pressed={active}
                      className={`group relative text-left rounded-xl px-5 py-4 transition-all border-2 ${
                        active
                          ? 'bg-accent border-white text-white shadow-[0_4px_0_var(--sign-green-deep)]'
                          : 'bg-white/[0.04] border-white/15 text-white hover:border-white/40 hover:bg-white/[0.07]'
                      }`}
                    >
                      <span className="block text-lg font-extrabold tracking-tight">{opt.label}</span>
                      <span className={`block text-xs uppercase tracking-[0.14em] mt-0.5 ${active ? 'text-white/80' : 'text-white/50'}`}>
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <div className="animate-fade-up">
              <div className="text-center mb-6">
                <span className="kicker dark">Last stop · grab a time</span>
                <h1 className="text-h2 font-extrabold tracking-tight mt-4">
                  Nice to meet you{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}.
                </h1>
                <p className="text-white/70 text-lead mt-3 max-w-lg mx-auto">
                  Pick a time for your 30-minute strategy call and we’ll come ready with ideas for{' '}
                  <span className="text-white font-semibold break-words">{company.trim() || 'your brand'}</span>.
                </p>
              </div>
              <div
                className="relative rounded-2xl overflow-hidden bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-[height] duration-300"
                style={{ minWidth: '320px', height: `${embedHeight}px` }}
              >
                <div ref={calendlyRef} className="h-full w-full" />
                {/* Mask the "Powered by Calendly" corner ribbon. It sits over
                    empty white space in the top-right corner, so a matching
                    white wedge hides it without covering any booking control.
                    The embed auto-grows to fit (no internal scroll), so the
                    ribbon stays pinned under this wedge. pointer-events block
                    clicks here so tapping the corner can't reach Calendly's
                    hidden branding link. clip-path limits the hit area to the
                    visible triangle, leaving the rest of the calendar fully
                    interactive. (The supported removal is Calendly's paid
                    "Remove branding" setting.) */}
                <div
                  aria-hidden
                  className="absolute top-0 right-0 bg-white"
                  style={{ width: '132px', height: '112px', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                />
              </div>
            </div>
          )}

          {step !== 4 && (
            <>
              {error && (
                <p className="mt-5 text-sm font-semibold text-[#FFD7C2]" role="alert">
                  {error}
                </p>
              )}
              <div className="mt-7 flex items-center gap-3">
                {step > 1 && (
                  <button type="button" onClick={goBack} className="sign-btn-alt on-dark text-sm" data-cta="funnel-back">
                    Back
                  </button>
                )}
                <button type="button" onClick={goNext} className="sign-btn-cta text-sm" data-cta={`funnel-next-${step}`}>
                  {step === 3 ? 'See the calendar' : 'Continue'}
                </button>
              </div>
              <p className="mt-6 text-xs text-white/45">
                No spam. We use your details to prep your call and follow up. See our{' '}
                <a href="/privacy/" className="underline hover:text-white/70">privacy policy</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ProgressRoute({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {STOPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-colors ${
                  active
                    ? 'bg-accent border-white text-white'
                    : done
                    ? 'bg-white border-white text-ink-900'
                    : 'bg-transparent border-white/25 text-white/40'
                }`}
              >
                {done ? '✓' : n}
              </span>
              <span className={`text-[11px] uppercase tracking-[0.14em] font-bold truncate hidden sm:block ${active ? 'text-white' : 'text-white/40'}`}>
                {label}
              </span>
            </div>
            {n < STOPS.length && (
              <span className={`h-0.5 flex-1 rounded-full ${done ? 'bg-white' : 'bg-white/15'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up">
      <span className="kicker dark">{eyebrow}</span>
      <h1 className="text-h2 font-extrabold tracking-tight mt-4">{title}</h1>
      <p className="text-white/70 text-lead mt-3 max-w-lg">{sub}</p>
      <div className="mt-7 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoFocus = false,
  inputMode,
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  inputMode?: 'url' | 'email' | 'text';
  onEnter?: () => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] font-bold text-white/55 mb-2">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/[0.06] border-2 border-white/15 px-4 py-3.5 text-white text-base placeholder:text-white/35 focus:outline-none focus:border-accent focus:bg-white/[0.1] transition-colors"
      />
    </label>
  );
}
