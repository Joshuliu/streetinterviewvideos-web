'use client';

import { FormEvent, useState } from 'react';

// Shared two-step OTP login for team. and studio.: the audience is decided
// server-side from the Host header, never by the form. `light` switches the
// chrome for studio's light theme; team stays dark.

const themes = {
  dark: {
    input:
      'w-full rounded-[10px] bg-[#0a0a0a] border border-[#3a3a3a] px-4 py-3 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316] transition-colors',
    card: 'rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-6 sm:p-8',
    heading: 'font-display text-2xl text-white mb-2',
    muted: 'text-[#9ca3af]',
    strong: 'text-white',
    subtle: 'w-full text-sm text-[#9ca3af] hover:text-white transition-colors',
    error: 'mt-4 text-sm text-[#f97316]',
  },
  light: {
    input:
      'w-full rounded-[10px] bg-paper border border-border px-4 py-3 text-ink-900 placeholder-[#9b978c] focus:outline-none focus:border-[#ea580c] transition-colors',
    card: 'rounded-2xl bg-paper border border-border p-6 sm:p-8 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)]',
    heading: 'font-display text-2xl text-ink-900 mb-2',
    muted: 'text-text-400',
    strong: 'text-ink-900',
    subtle: 'w-full text-sm text-text-400 hover:text-ink-900 transition-colors',
    error: 'mt-4 text-sm text-[#c2410c]',
  },
};

export function LoginForm({ subtitle, light = false }: { subtitle: string; light?: boolean }) {
  const t = themes[light ? 'light' : 'dark'];
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError('Too many requests. Wait a few minutes and try again.');
      } else if (!res.ok) {
        setError('Something went wrong. Try again.');
      } else {
        setStep('code');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        window.location.assign('/');
        return;
      }
      setError('That code didn’t work. It may have expired, so request a new one below.');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className={t.card}>
        <h1 className={t.heading}>Log in</h1>
        <p className={`text-sm ${t.muted} mb-6`}>{subtitle}</p>

        {step === 'email' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={t.input}
            />
            <button type="submit" disabled={busy} className="sign-btn-cta text-sm w-full disabled:opacity-60">
              {busy ? 'Sending…' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <p className={`text-sm ${t.muted}`}>
              If this email is on file, a 6-digit code is on its way to <span className={t.strong}>{email}</span>.
            </p>
            <input
              type="text"
              required
              autoFocus
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${t.input} tracking-[0.4em] text-center font-mono text-lg`}
            />
            <button type="submit" disabled={busy} className="sign-btn-cta text-sm w-full disabled:opacity-60">
              {busy ? 'Checking…' : 'Log in'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              className={t.subtle}
            >
              Use a different email or resend
            </button>
          </form>
        )}

        {error && <p className={t.error}>{error}</p>}
      </div>
    </div>
  );
}
