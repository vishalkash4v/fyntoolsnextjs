'use client';

import dynamic from 'next/dynamic';

const UrlShortener = dynamic(() => import('@/components/tools/UrlShortener'), {
  ssr: false,
});

/** Client-only island — crawlable HTML in ToolCrawlerFallback. */
export default function UrlShortenerClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <UrlShortener />
    </div>
  );
}
