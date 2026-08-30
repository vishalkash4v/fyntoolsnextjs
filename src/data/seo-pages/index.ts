import { buildUniqueToolContent } from '@/data/tool-content/buildUniqueToolContent';
import { allTools } from '@/data/toolsData';
import { canonicalizeSeoContent } from '@/lib/seo/canonicalPaths';
import type { FullSeoPageContent } from './types';

export type { FullSeoPageContent } from './types';

const cache = new Map<string, FullSeoPageContent | null>();

/**
 * Unique, intent-fit SEO content for every tool path.
 * Merged via buildUniqueToolContent (batches + pageOverrides + toolHowToCatalog).
 */
export function getFullSeoPage(path: string): FullSeoPageContent | null {
  const normalized = path.replace(/\/$/, '') || '/';
  if (cache.has(normalized)) return cache.get(normalized) ?? null;

  const tool = allTools.find((t) => t.path === normalized);
  if (!tool) {
    cache.set(normalized, null);
    return null;
  }

  const content = canonicalizeSeoContent(buildUniqueToolContent(tool));
  cache.set(normalized, content);
  return content;
}
