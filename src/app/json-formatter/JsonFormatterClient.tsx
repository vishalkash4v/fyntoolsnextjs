'use client';

import dynamic from 'next/dynamic';

const JsonFormatter = dynamic(() => import('@/components/tools/JsonFormatter'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full min-h-[560px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
      aria-busy="true"
      aria-label="Loading JSON formatter"
    >
      Loading tool…
    </div>
  ),
});

export default function JsonFormatterClient() {
  return (
    <div className="w-full min-h-[560px]" id="tool-interface">
      <JsonFormatter />
    </div>
  );
}
