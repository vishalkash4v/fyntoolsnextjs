'use client';

import dynamic from 'next/dynamic';

const UrlShortener = dynamic(() => import('@/components/tools/UrlShortener'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full min-h-[560px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
      aria-busy="true"
      aria-label="Loading URL shortener"
    >
      Loading tool…
    </div>
  ),
});

/** Dedicated island — only loads UrlShortener (+ its deps), not the 90-tool registry. */
export default function UrlShortenerClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <UrlShortener />
    </div>
  );
}
