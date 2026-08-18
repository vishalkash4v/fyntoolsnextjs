'use client';

import JsonFormatter from '@/components/tools/JsonFormatter';

/** Direct import — full tool HTML in SSR for Google/crawlers. */
export default function JsonFormatterClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <JsonFormatter />
    </div>
  );
}
