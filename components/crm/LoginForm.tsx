'use client';

import { FormEvent, useState } from 'react';

// Shared two-step OTP login for team. and studio.: the audience is decided
// server-side from the Host header, never by the form.

const inputStyles =
  'w-full rounded-[10px] bg-[#0a0a0a] border border-[#3a3a3a] px-4 py-3 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316] transition-colors';

export function LoginForm({ subtitle }: { subtitle: string }) {
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
      <div className="rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-6 sm:p-8">
        <h1 className="font-display text-2xl text-white mb-2">Log in</h1>
        <p className="text-sm text-[#9ca3af] mb-6">{subtitle}</p>

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
              className={inputStyles}
            />
            <button type="submit" disabled={busy} className="sign-btn-cta text-sm w-full disabled:opacity-60">
              {busy ? 'Sending…' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <p className="text-sm text-[#9ca3af]">
              If this email is on file, a 6-digit code is on its way to <span className="text-white">{email}</span>.
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
              className={`${inputStyles} tracking-[0.4em] text-center font-mono text-lg`}
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
              className="w-full text-sm text-[#9ca3af] hover:text-white transition-colors"
            >
              Use a different email or resend
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-[#f97316]">{error}</p>}
      </div>
    </div>
  );
}
