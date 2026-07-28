'use client';

import JsonFormatter from '@/components/tools/JsonFormatter';

/** Direct client import — avoids fragile dynamic(ssr:false) hang. */
export default function JsonFormatterClient() {
  return (
    <div className="w-full min-h-[420px]" id="tool-interface">
      <JsonFormatter />
    </div>
  );
}
