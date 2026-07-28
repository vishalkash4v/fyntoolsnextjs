'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { getToolLoader } from '@/lib/tools/registry.generated';

const loadingFallback = (
  <div
    className="w-full min-h-[420px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
    aria-busy="true"
    aria-label="Loading tool"
  >
    Loading tool…
  </div>
);

/** Cache dynamic components so we never recreate them each render (that remounts forever). */
const dynamicToolCache = new Map<string, ComponentType>();

function getCachedTool(slug: string): ComponentType | null {
  if (dynamicToolCache.has(slug)) return dynamicToolCache.get(slug)!;
  const loader = getToolLoader(slug);
  if (!loader) return null;
  const Tool = dynamic(loader, {
    loading: () => loadingFallback,
    ssr: false,
  });
  dynamicToolCache.set(slug, Tool);
  return Tool;
}

/**
 * Client island: lazy-loads the interactive tool.
 * Outer min-height reserves space to prevent CLS when the chunk hydrates.
 */
export default function InteractiveToolLoader({ slug }: { slug: string }) {
  const Tool = useMemo(() => getCachedTool(slug), [slug]);

  if (!Tool) {
    return (
      <div className="p-6 min-h-[200px] rounded-lg border border-destructive/30 text-sm text-muted-foreground">
        Interactive tool UI is temporarily unavailable for this page. SEO content below remains available.
      </div>
    );
  }

  return (
    <div className="w-full min-h-[420px]" id="tool-interface">
      <Tool />
    </div>
  );
}
