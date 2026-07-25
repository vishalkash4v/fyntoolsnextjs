import { buildUniqueToolContent } from '@/data/tool-content/buildUniqueToolContent';
import { allTools } from '@/data/toolsData';
import { isAffectedToolPath, AFFECTED_TOOL_PATHS } from './affectedPaths';
import type { FullSeoPageContent } from './types';

export type { FullSeoPageContent } from './types';
export { isAffectedToolPath, AFFECTED_TOOL_PATHS, AFFECTED_TOOL_PATH_SET } from './affectedPaths';

const cache = new Map<string, FullSeoPageContent | null>();

/**
 * Unique, intent-fit SEO content for every tool path.
 * Uses curated toolSeoContent where available; never the old longFormGenerator filler.
 */
export function getFullSeoPage(path: string): FullSeoPageContent | null {
  const normalized = path.replace(/\/$/, '') || '/';
  if (cache.has(normalized)) return cache.get(normalized) ?? null;

  const tool = allTools.find((t) => t.path === normalized);
  if (!tool) {
    cache.set(normalized, null);
    return null;
  }

  const content = buildUniqueToolContent(tool);
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
    ...content.introParagraphs,
    content.overview,
    ...content.features,
    ...content.benefits,
    ...content.howToUse,
    ...content.faqs.map((f) => `${f.question} ${f.answer}`),
    content.conclusion,
  ];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}
