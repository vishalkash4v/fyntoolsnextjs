'use client';

import dynamic from 'next/dynamic';

/**
 * SSR the form shell so LCP can paint from HTML (not after the client chunk).
 * History/localStorage still hydrate in useEffect inside UrlShortener.
 * QR dialog stays dynamically imported with ssr:false inside the tool.
 */
const UrlShortener = dynamic(() => import('@/components/tools/UrlShortener'), {
  ssr: true,
  loading: () => (
    <div
      className="w-full min-h-[420px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card p-6"
      aria-busy="true"
      aria-label="Loading URL shortener"
    >
      <div className="h-7 w-48 rounded bg-muted animate-pulse mb-4" />
      <div className="h-24 w-full rounded-md bg-muted/60 animate-pulse mb-4" />
      <div className="h-10 w-36 rounded-md bg-muted animate-pulse" />
    </div>
  ),
});

/** Dedicated island — only loads UrlShortener (+ its deps), not the multi-tool registry. */
export default function UrlShortenerClient() {
  return (
    <div className="w-full min-h-[420px]" id="tool-interface">
      <UrlShortener />
    </div>
  );
}
