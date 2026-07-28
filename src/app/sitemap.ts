import type { MetadataRoute } from 'next';
import { allTools } from '@/data/toolsData';
import { CATEGORY_HUBS } from '@/data/categoriesData';
import { blogPosts } from '@/data/blogsData';
import { guides } from '@/data/guides/guidesData';
import { authors } from '@/data/authors';
import { SITE_URL } from '@/lib/seo/site';

const CONTENT_LASTMOD = new Date('2026-07-27');

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
 * Homepage 1.0 · Tools 0.9 · Hubs 0.85 · Guides 0.8 · About 0.7 · Author 0.6
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
    { path: '/', priority: 1.0, freq: 'daily' },
    { path: '/tools', priority: 0.95, freq: 'daily' },
    { path: '/guides', priority: 0.85, freq: 'weekly' },
    { path: '/about', priority: 0.7, freq: 'weekly' },
    { path: '/contact', priority: 0.6, freq: 'weekly' },
    { path: '/blog', priority: 0.75, freq: 'weekly' },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
      lastModified: CONTENT_LASTMOD,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...CATEGORY_HUBS.map((hub) => ({
      url: `${SITE_URL}${hub.path}`,
      lastModified: CONTENT_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...allTools
      .filter((t) => t.path && !t.path.includes(':'))
      .map((t) => ({
        url: `${SITE_URL}${t.path}`,
        lastModified: CONTENT_LASTMOD,
        changeFrequency: 'weekly' as const,
        priority: HIGH_PRIORITY.has(t.path) ? 0.9 : 0.8,
      })),
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updatedAt || g.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...authors.map((a) => ({
      url: `${SITE_URL}/author/${a.slug}`,
      lastModified: CONTENT_LASTMOD,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...blogPosts.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: new Date(b.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ];
}
