'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { isKnownToolSlug } from '@/lib/tools/tool-slugs.generated';

const loadingFallback = (
  <div
    className="w-full min-h-[560px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
    aria-busy="true"
    aria-label="Loading tool"
    role="status"
  >
    Loading tool…
  </div>
);

/** Cache dynamic components so we never recreate them each render (that remounts forever). */
const dynamicToolCache = new Map<string, ComponentType>();

/**
 * Fallback island for any tool still served via `[slug]`.
 * Prefers dedicated `@/lib/tools/clients/{slug}` modules (UrlShortenerClient pattern).
 *
 * Critical: do NOT import `registry.generated` — that pulls 100+ sibling chunks.
 */
function getCachedTool(slug: string): ComponentType | null {
  if (!isKnownToolSlug(slug)) return null;
  if (dynamicToolCache.has(slug)) return dynamicToolCache.get(slug)!;

  const Tool = dynamic(() => import(`@/lib/tools/clients/${slug}`), {
    loading: () => loadingFallback,
    ssr: false,
  });
  dynamicToolCache.set(slug, Tool);
  return Tool;
}

export default function InteractiveToolLoader({ slug }: { slug: string }) {
  const Tool = useMemo(() => getCachedTool(slug), [slug]);

  if (!Tool) {
    return (
      <div
        className="p-6 min-h-[200px] rounded-lg border border-destructive/30 text-sm text-muted-foreground"
        role="status"
      >
        Interactive tool UI is temporarily unavailable for this page. SEO content below remains available.
      </div>
    );
  }

  return <Tool />;
}
