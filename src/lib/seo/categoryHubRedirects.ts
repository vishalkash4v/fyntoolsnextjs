import { categoryToHubPath } from '@/data/categoriesData';

/** Shorthand category query values Google may crawl (e.g. ?category=Period). */
export const CATEGORY_QUERY_ALIASES: Record<string, string> = {
  'Period & Cycle Tools': '/period-cycle-tools',
  Period: '/period-cycle-tools',
  'Period Tools': '/period-cycle-tools',
  'Cycle Tools': '/period-cycle-tools',
  'Image Tools': '/image-tools',
  Image: '/image-tools',
  'Text & Writing Tools': '/text-tools',
  Text: '/text-tools',
  Writing: '/text-tools',
  'Development Tools': '/developer-tools',
  Developer: '/developer-tools',
  Development: '/developer-tools',
  'Network Tools': '/network-tools',
  Network: '/network-tools',
  'Converter Tools': '/converter-tools',
  Converter: '/converter-tools',
  'Finance Tools': '/finance-tools',
  Finance: '/finance-tools',
  'Typing Tools': '/typing-tools',
  Typing: '/typing-tools',
  'Pregnancy Tools': '/pregnancy-tools',
  Pregnancy: '/pregnancy-tools',
  'Utility Tools': '/utility-tools',
  Utility: '/utility-tools',
  'Timer Tools': '/timer-tools',
  Timer: '/timer-tools',
  'Video & Social Media Tools': '/social-media-tools',
  'Social Media Tools': '/social-media-tools',
  Social: '/social-media-tools',
  'Business Tools': '/business-tools',
  Business: '/business-tools',
  'Number Tools': '/number-tools',
  Number: '/number-tools',
  SEO: '/seo-tools',
  'SEO Tools': '/seo-tools',
  Security: '/security-tools',
  'Security Tools': '/security-tools',
  PDF: '/pdf-tools',
  'PDF Tools': '/pdf-tools',
};

export function resolveCategoryHub(category: string): string | null {
  const trimmed = category.trim();
  if (CATEGORY_QUERY_ALIASES[trimmed]) return CATEGORY_QUERY_ALIASES[trimmed];
  return categoryToHubPath(trimmed);
}
