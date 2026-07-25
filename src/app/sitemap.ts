import type { MetadataRoute } from 'next';
import { allTools } from '@/data/toolsData';
import { CATEGORY_HUBS } from '@/data/categoriesData';
import { blogPosts } from '@/data/blogsData';
import { SITE_URL } from '@/lib/seo/site';

const HIGH_PRIORITY = new Set([
  '/word-counter',
  '/json-formatter',
  '/password-generator',
  '/qr-code-generator',
  '/image-compressor',
  '/image-resizer',
  '/bmi-calculator',
  '/url-shortener',
  '/ai-text-rewriter',
  '/percentage-calculator',
  '/age-calculator',
  '/regex-tester',
  '/base64-converter',
  '/html-formatter',
  '/typing-test',
]);

/**
 * Sitemap lists canonical indexable URLs only.
 * lastModified is omitted for tools/hubs (no reliable content dates) — do not fake "now".
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
    { path: '/', priority: 1, freq: 'daily' },
    { path: '/tools', priority: 0.95, freq: 'daily' },
    { path: '/about', priority: 0.7, freq: 'weekly' },
    { path: '/contact', priority: 0.6, freq: 'weekly' },
    { path: '/blog', priority: 0.75, freq: 'weekly' },
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...CATEGORY_HUBS.map((hub) => ({
      url: `${SITE_URL}${hub.path}`,
      changeFrequency: 'weekly' as const,
      priority: 0.88,
    })),
    ...allTools
      .filter((t) => t.path && !t.path.includes(':'))
      .map((t) => ({
        url: `${SITE_URL}${t.path}`,
        changeFrequency: 'weekly' as const,
        priority: HIGH_PRIORITY.has(t.path) ? 0.9 : 0.8,
      })),
    ...blogPosts.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: new Date(b.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ];

  return entries;
}
