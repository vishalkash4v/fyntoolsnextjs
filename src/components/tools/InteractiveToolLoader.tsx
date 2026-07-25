'use client';

import dynamic from 'next/dynamic';
import { getToolLoader } from '@/lib/tools/registry.generated';

const loadingFallback = (
  <div className="w-full min-h-[200px] rounded-lg border bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground">
    Loading tool…
  </div>
);

export default function InteractiveToolLoader({ slug }: { slug: string }) {
  const loader = getToolLoader(slug);
  if (!loader) {
    return (
      <div className="p-6 rounded-lg border border-destructive/30 text-sm text-muted-foreground">
        Interactive tool UI is temporarily unavailable for this page. SEO content below remains available.
      </div>
    );
  }

  const Tool = dynamic(loader, {
    ssr: false,
    loading: () => loadingFallback,
  });

  return (
    <div className="w-full">
      <Tool />
    </div>
  );
}
