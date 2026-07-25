import { CATEGORY_HUBS } from '@/data/categoriesData';

/** Slugs that must NOT be handled by app/[slug] tool routes */
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
  '_next',
  'favicon.ico',
  ...CATEGORY_HUBS.map((h) => h.slug),
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
