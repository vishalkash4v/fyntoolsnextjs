'use client';

import UrlShortener from '@/components/tools/UrlShortener';

/** Direct import — form shell in SSR HTML; history/QR hydrate client-side. */
export default function UrlShortenerClient() {
  return (
    <div className="w-full min-h-[420px]" id="tool-interface">
      <UrlShortener />
    </div>
  );
}
