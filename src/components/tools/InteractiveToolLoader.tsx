'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { TOOL_SLUGS } from '@/lib/tools/registry.generated';

const ALLOWED = new Set(TOOL_SLUGS);

const loadingFallback = (
  <div
    className="w-full min-h-[560px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/30 animate-pulse flex items-center justify-center text-muted-foreground"
    aria-busy="true"
    aria-label="Loading tool"
  >
    Loading tool…
  </div>
);

/** Cache dynamic components so we never recreate them each render (that remounts forever). */
const dynamicToolCache = new Map<string, ComponentType>();

/**
 * Load ONE per-slug module from `@/lib/tools/loaders/{slug}`.
 * Webpack splits each file; we do NOT import the full registry of 100+ factories on the client.
 */
function getCachedTool(slug: string): ComponentType | null {
  if (!ALLOWED.has(slug)) return null;
  if (dynamicToolCache.has(slug)) return dynamicToolCache.get(slug)!;

  const Tool = dynamic(
    () =>
      import(
        /* webpackPrefetch: false, webpackPreload: false */
        `@/lib/tools/loaders/${slug}`
      ),
    {
      loading: () => loadingFallback,
      ssr: false,
    }
  );
  dynamicToolCache.set(slug, Tool);
  return Tool;
}

/**
 * Client island used by EVERY tool page via ToolPageShell.
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
    <div className="w-full min-h-[560px]" id="tool-interface">
      <Tool />
    </div>
  );
}
