import { buildUniqueToolContent } from '@/data/tool-content/buildUniqueToolContent';
import { allTools } from '@/data/toolsData';
import { canonicalizeSeoContent } from '@/lib/seo/canonicalPaths';
import type { FullSeoPageContent } from './types';

export type { FullSeoPageContent } from './types';

const cache = new Map<string, FullSeoPageContent | null>();

/**
 * Unique, intent-fit SEO content for every tool path.
 * Merges Vite page overrides + curated toolSeoContent via buildUniqueToolContent.
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

export function fullSeoToShortIntro(content: FullSeoPageContent): string {
  return [...content.introParagraphs, content.overview, content.conclusion]
    .filter(Boolean)
    .join('\n\n');
}

/** @deprecated — use word counts from validation scripts if needed */
export function countWords(content: FullSeoPageContent): number {
  const parts = [
    content.title,
    content.metaDescription,
    content.h1,
    ...(content.introParagraphs || []),
    content.overview,
    content.howItWorks,
    content.conclusion,
    ...(content.howToUse || []),
    ...(content.features || []),
    ...(content.faqs || []).flatMap((f) => [f.question, f.answer]),
  ];
  return parts
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}
