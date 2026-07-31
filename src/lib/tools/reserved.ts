import { CATEGORY_HUBS } from '@/data/categoriesData';

/** Slugs that must NOT be handled as generic tools by app/[slug] fallback.
 * Dedicated App Router pages (url-shortener, json-formatter) are NOT listed —
 * they live in allTools and must resolve via resolveToolPage / ToolStaticPage.
 */
export const RESERVED_SLUGS = new Set([
  'about',
  'contact',
  'tools',
  'themes',
  'blog',
  's',
  'fyntoolsadmin',
  'api',
  'redirect',
  'deep-link-redirect',
  'guides',
  'author',
  'ai-domain-name-generator',
  '_next',
  'favicon.ico',
  ...CATEGORY_HUBS.map((h) => h.slug),
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
