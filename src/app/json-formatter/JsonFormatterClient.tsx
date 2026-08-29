'use client';

import dynamic from 'next/dynamic';

const JsonFormatter = dynamic(() => import('@/components/tools/JsonFormatter'), {
  ssr: false,
});

/** Client-only island — crawlable HTML in ToolCrawlerFallback. */
export default function JsonFormatterClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <JsonFormatter />
    </div>
  );
}
