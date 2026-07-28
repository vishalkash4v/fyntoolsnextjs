'use client';

import UrlShortener from '@/components/tools/UrlShortener';

/** Direct client import — avoids fragile dynamic(ssr:false) hang. */
export default function UrlShortenerClient() {
  return (
    <div className="w-full min-h-[420px]" id="tool-interface">
      <UrlShortener />
    </div>
  );
}
