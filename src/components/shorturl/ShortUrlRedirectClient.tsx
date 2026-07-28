'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, AlertCircle, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';

const API = `${API_BASE_URL}/shorturl`;
const REDIRECT_SECONDS = 3;
const NAMEZIVO_URL = 'https://namezivo.com';

function hostnameHint(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'destination';
  }
}

export default function ShortUrlRedirectClient({ code }: { code: string }) {
  const router = useRouter();
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'loading' | 'interstitial' | 'password' | 'error'>('loading');
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const resolveJson = useCallback(async (response: Response) => {
    const text = await response.text();
    if (!text) throw new Error('Empty response from server.');
    return JSON.parse(text);
  }, []);

  useEffect(() => {
    if (!code) {
      setError('Invalid short URL code');
      setPhase('error');
      return;
    }

    let cancelled = false;

    const run = async () => {
      for (let attempt = 0; attempt <= 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          const response = await fetch(`${API}/${code}`, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (cancelled) return;

          if (!response.ok) {
            if (response.status === 404) {
              setError('This short link was not found. It may have been removed or never existed.');
              setPhase('error');
              return;
            }
            if (response.status === 410) {
              setError('This short link has expired.');
              setPhase('error');
              return;
            }
            if (response.status >= 500 && attempt < 3) {
              await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
              continue;
            }
            setError('We could not load this short link. Please try again in a moment.');
            setPhase('error');
            return;
          }

          const data = await resolveJson(response);
          if (cancelled) return;

          if (data.success && data.protected && data.data?.hasPassword) {
            setPhase('password');
            return;
          }

          const dest =
            data.success && data.redirect && data.location
              ? data.location
              : data.success && data.data?.originalUrl
                ? data.data.originalUrl
                : null;

          if (dest) {
            setPendingRedirect(dest);
            setCountdown(REDIRECT_SECONDS);
            setPhase('interstitial');
            return;
          }

          setError('Invalid response from the short link service.');
          setPhase('error');
          return;
        } catch {
          if (cancelled) return;
          if (attempt === 3) {
            setError('Network error. Check your connection and try again.');
            setPhase('error');
            return;
          }
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [code, resolveJson]);

  useEffect(() => {
    if (phase !== 'interstitial' || !pendingRedirect) return;
    if (countdown <= 0) {
      window.location.replace(pendingRedirect);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, pendingRedirect, countdown]);

  const handleUnlock = async () => {
    if (!code) return;
    setUnlockError(null);
    try {
      const response = await fetch(`${API}/${code}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUnlockError('Incorrect password. Try again.');
          return;
        }
        if (response.status === 404) {
          setError('Short link not found.');
          setPhase('error');
          return;
        }
        if (response.status === 410) {
          setError('This short link has expired.');
          setPhase('error');
          return;
        }
        setUnlockError('Could not unlock this link.');
        return;
      }

      const data = await response.json();
      const dest =
        data.success && data.redirect && data.location
          ? data.location
          : data.success && data.data?.originalUrl
            ? data.data.originalUrl
            : null;

      if (dest) {
        setPendingRedirect(dest);
        setCountdown(REDIRECT_SECONDS);
        setPhase('interstitial');
        return;
      }
      setUnlockError('Unexpected response from server.');
    } catch {
      setUnlockError('Network error while unlocking.');
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950/90 to-slate-900 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.2), transparent 40%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.12), transparent 35%)',
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );

  if (phase === 'loading') {
    return shell(
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
          <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
        </div>
        <div>
          <p className="text-sm font-medium tracking-wide text-violet-200/90 uppercase">FYN Tools</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Preparing your link</h1>
          <p className="mt-2 text-sm text-slate-400">Hang tight — we are verifying this short URL.</p>
        </div>
      </div>
    );
  }

  if (phase === 'error' && error) {
    return shell(
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-rose-300">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <h1 className="text-lg font-semibold text-white">Link unavailable</h1>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{error}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1 bg-violet-600 hover:bg-violet-500">
            <Link href="/url-shortener">Create a short link</Link>
          </Button>
          <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'password') {
    return shell(
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-violet-200">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Protected link</span>
        </div>
        <h1 className="mt-3 text-xl font-semibold text-white">Password required</h1>
        <p className="mt-2 text-sm text-slate-400">
          The person who created this link added a password. Enter it to continue.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/60"
          placeholder="Enter password"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUnlock();
          }}
        />
        {unlockError && <p className="mt-2 text-xs text-rose-300">{unlockError}</p>}
        <div className="mt-6 flex gap-2">
          <Button className="flex-1 bg-violet-600 hover:bg-violet-500" onClick={handleUnlock}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Unlock
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => router.push('/url-shortener')}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'interstitial' && pendingRedirect) {
    const host = hostnameHint(pendingRedirect);
    return shell(
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            FYN Tools short link
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">You are leaving FYN Tools</h1>
          <p className="text-sm text-slate-400">
            Redirecting to <span className="font-medium text-slate-200">{host}</span> in{' '}
            <span className="tabular-nums text-violet-300">{Math.max(0, countdown)}</span>s
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Destination</p>
              <p className="mt-1 truncate text-sm text-slate-200" title={pendingRedirect}>
                {pendingRedirect}
              </p>
            </div>
            <div className="relative h-14 w-14 shrink-0">
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                {Math.max(0, countdown)}
              </span>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
              onClick={() => window.location.replace(pendingRedirect)}
            >
              Continue now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/url-shortener">Stay on FYN Tools</Link>
            </Button>
          </div>
        </div>

        <a
          href={NAMEZIVO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/80 to-slate-900/90 p-5 shadow-lg transition hover:border-cyan-400/40"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90">Sponsored pick</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Namezivo — name your product with AI</h2>
          <p className="mt-2 text-sm text-slate-400">
            Choose strong brand names and check domain availability before you commit.
          </p>
        </a>
      </div>
    );
  }

  return null;
}
