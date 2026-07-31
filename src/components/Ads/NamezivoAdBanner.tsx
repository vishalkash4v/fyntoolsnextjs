'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';

export const NAMEZIVO_URL =
  'https://namezivo.com/?utm_source=fyntools&utm_medium=display&utm_campaign=tool_banner';
export const NAMEZIVO_PROMO_PATH = '/ai-domain-name-generator';
export const NAMEZIVO_CAMPAIGN_ID = 'namezivo';

type Props = {
  /** Tool path e.g. /word-counter — used for analytics */
  sourcePath?: string;
  /** Where the banner is shown */
  placement?: string;
  /** Compact = slim Google text-ad look; full = richer card */
  variant?: 'compact' | 'full';
  className?: string;
};

/**
 * Google Ads–style sponsored unit for Namezivo (AI Domain Name Generator).
 * Records click (IP + time on server) then opens the partner site.
 */
export default function NamezivoAdBanner({
  sourcePath = '/',
  placement = 'tool_banner',
  variant = 'full',
  className = '',
}: Props) {
  const [tracking, setTracking] = useState(false);

  const trackAndOpen = useCallback(async () => {
    if (tracking) return;
    setTracking(true);
    let destination = NAMEZIVO_URL;
    try {
      const res = await fetch(`${API_BASE_URL}/ads/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: NAMEZIVO_CAMPAIGN_ID,
          sourcePath,
          placement,
        }),
        keepalive: true,
      });
      const data = await res.json().catch(() => null);
      if (data?.data?.destinationUrl) {
        destination = data.data.destinationUrl;
      }
    } catch {
      // Still open partner site if tracking fails
    } finally {
      setTracking(false);
    }
    window.open(destination, '_blank', 'noopener,noreferrer');
  }, [placement, sourcePath, tracking]);

  if (variant === 'compact') {
    return (
      <aside
        className={`rounded-lg border border-[#dadce0] dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 shadow-sm ${className}`}
        aria-label="Sponsored advertisement"
        data-ad-campaign={NAMEZIVO_CAMPAIGN_ID}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 rounded border border-[#dadce0] dark:border-zinc-600 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-zinc-400">
            Ad
          </span>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={trackAndOpen}
              disabled={tracking}
              className="group text-left w-full"
            >
              <span className="block text-[15px] font-medium text-[#1a0dab] dark:text-blue-400 group-hover:underline leading-snug">
                AI Domain Name Generator & Availability Checker — Namezivo
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-[#006621] dark:text-emerald-500">
                <span className="truncate">namezivo.com</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[#4d5156] dark:text-zinc-400">
                Looking for the best brand name but most domains are already taken? Generate
                brandable names and check availability instantly.
              </span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`relative overflow-hidden rounded-xl border border-[#dadce0] dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm ${className}`}
      aria-label="Sponsored advertisement for Namezivo"
      data-ad-campaign={NAMEZIVO_CAMPAIGN_ID}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#4285f4]"
        aria-hidden
      />
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
        <div className="flex-1 px-4 sm:px-5 py-4 pl-5 sm:pl-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded border border-[#dadce0] dark:border-zinc-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5f6368] dark:text-zinc-400">
              Sponsored
            </span>
            <span className="text-[11px] text-[#5f6368] dark:text-zinc-500">
              Partner recommendation
            </span>
          </div>

          <button
            type="button"
            onClick={trackAndOpen}
            disabled={tracking}
            className="group text-left w-full"
          >
            <span className="inline-flex items-center gap-1.5 text-lg sm:text-xl font-medium text-[#1a0dab] dark:text-blue-400 group-hover:underline leading-snug">
              <Sparkles className="h-4 w-4 shrink-0 text-[#fbbc04]" aria-hidden />
              AI Domain Name Generator & Availability Checker
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-sm text-[#006621] dark:text-emerald-500">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e8f0fe] dark:bg-blue-950 text-[10px] font-bold text-[#1967d2]">
                N
              </span>
              https://namezivo.com
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </span>
            <span className="mt-2 block text-sm sm:text-[15px] leading-relaxed text-[#4d5156] dark:text-zinc-400 max-w-2xl">
              Confused about the best brand name for your business? Most great names are already
              registered. Namezivo helps you find available, brandable domains from your idea or
              keywords — instantly.
            </span>
          </button>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={trackAndOpen}
              disabled={tracking}
              className="inline-flex items-center justify-center rounded-md bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-60"
            >
              {tracking ? 'Opening…' : 'Try Namezivo Free'}
            </button>
            <Link
              href={NAMEZIVO_PROMO_PATH}
              className="inline-flex items-center text-sm font-medium text-[#1a73e8] hover:underline px-2 py-2"
            >
              Why we recommend it
            </Link>
          </div>
        </div>

        <div className="sm:w-44 md:w-52 shrink-0 border-t sm:border-t-0 sm:border-l border-[#eceff1] dark:border-zinc-800 bg-[#f8f9fa] dark:bg-zinc-900/80 px-4 py-4 flex flex-col justify-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6368] dark:text-zinc-500">
            Highlights
          </p>
          <ul className="text-[13px] text-[#3c4043] dark:text-zinc-300 space-y-1.5">
            <li>· AI brand name ideas</li>
            <li>· Live availability checks</li>
            <li>· Bulk check up to 500</li>
            <li>· .com .io .ai & more</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
