import type { MetadataRoute } from 'next';
import { allTools } from '@/data/toolsData';
import { CATEGORY_HUBS } from '@/data/categoriesData';
import { blogPosts } from '@/data/blogsData';
import { guides } from '@/data/guides/guidesData';
import { authors } from '@/data/authors';
import { SITE_URL } from '@/lib/seo/site';
import { TOOL_CANONICAL_REDIRECTS } from '@/lib/tools/tool-slugs.generated';

/** Bump on content/CWV deploys so Google sees freshness. */
const SITEMAP_LASTMOD = new Date('2026-08-05');

/**
 * Paths from GSC “Crawled – currently not indexed” that need a stronger crawl signal.
 * Higher priority + weekly changefreq encourages recrawl after SEO/CWV fixes.
 */
const GSC_RECRAWL_PRIORITY = new Set([
  '/logo-to-favicon',
  '/ovulation-calculator',
  '/html-formatter',
  '/pms-symptom-tracker',
  '/safe-days-calculator',
  '/percentage-calculator',
  '/json-validator',
  '/typing-test',
  '/url-slug-generator',
  '/image-resizer',
  '/xml-sitemap-tester',
  '/meta-tag-previewer',
  '/typing-games',
  '/text-reverser',
  '/period-tracker',
  '/barcode-scanner-online',
  '/pregnancy-weight-gain-calculator',
  '/markdown-editor',
  '/list-randomizer',
  '/hash-generator',
  '/gradient-generator',
  '/text-font-changer',
  '/text-to-speech',
  '/image-format-converter',
  '/image-metadata-viewer',
  '/ip-address-to-location-finder',
  // Phase 0 shell deploy — keep Batch 1 URLs boosted for recrawl
  '/word-counter',
  '/password-generator',
  '/qr-code-generator',
  '/image-compressor',
  '/bmi-calculator',
  '/age-calculator',
  '/regex-tester',
  '/base64-converter',
  '/unit-converter',
  // Phase 1 Batch 1 — hand-tuned content deploy, boost for recrawl
  '/url-shortener',
  '/json-formatter',
  '/barcode-generator',
  // Phase 1 Batch 2 — hand-tuned content deploy, boost for recrawl
  // (json-validator, url-slug-generator, hash-generator, markdown-editor,
  //  percentage-calculator, typing-test, image-resizer, meta-tag-previewer,
  //  text-to-speech, regex-tester, base64-converter already boosted above)
  '/jwt-decoder',
  // Phase 1 Batch 3 — hand-tuned content deploy, boost for recrawl
  // (text-reverser already boosted above)
  '/text-case-converter',
  '/ai-text-rewriter',
  '/lorem-ipsum-generator',
  '/whitespace-remover',
  '/duplicate-line-remover',
  '/text-to-handwriting',
  '/discord-formatter',
  '/hashtag-generator',
  '/name-generator',
  '/username-generator',
  '/live-preview',
  '/javascript-minifier',
  '/css-minifier',
  '/url-encode-decode',
  // Phase 1 Batch 4 — hand-tuned content deploy, boost for recrawl
  // (image-cropper, image-format-converter, svg-optimizer, gradient-generator,
  //  placeholder-image-generator, blur-image, color-palette-generator,
  //  color-picker-tool, photo-annotation-tool, logo-to-favicon,
  //  image-metadata-viewer, image-resizer already boosted above)
  '/pixelate-tool',
  '/invert-image-colors',
  '/background-remover',
]);

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
  '/unit-converter',
  '/photo-annotation-tool',
  '/hash-generator',
  '/meta-tag-previewer',
]);

const SKIP_SITEMAP = new Set([
  ...Object.keys(TOOL_CANONICAL_REDIRECTS).map((s) => `/${s}`),
]);

/**
 * Complete indexable sitemap — homepage, hubs, ALL live tools, guides, authors, blogs.
 * Excludes: themes, admin, short links, soft-duplicate aliases, query URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
    { path: '/', priority: 1.0, freq: 'daily' },
    { path: '/tools', priority: 0.95, freq: 'daily' },
    { path: '/guides', priority: 0.85, freq: 'weekly' },
    { path: '/blog', priority: 0.75, freq: 'weekly' },
    { path: '/about', priority: 0.7, freq: 'weekly' },
    { path: '/contact', priority: 0.6, freq: 'weekly' },
    { path: '/ai-domain-name-generator', priority: 0.75, freq: 'weekly' },
  ];

  const toolEntries = allTools
    .filter((t) => t.path && !t.path.includes(':') && !SKIP_SITEMAP.has(t.path))
    .map((t) => {
      const gscBoost = GSC_RECRAWL_PRIORITY.has(t.path);
      const high = HIGH_PRIORITY.has(t.path);
      return {
        url: `${SITE_URL}${t.path}`,
        lastModified: SITEMAP_LASTMOD,
        changeFrequency: 'weekly' as const,
        priority: high || gscBoost ? 0.9 : 0.8,
      };
    });

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...CATEGORY_HUBS.map((hub) => ({
      url: `${SITE_URL}${hub.path}`,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...toolEntries,
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updatedAt || g.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...authors.map((a) => ({
      url: `${SITE_URL}/author/${a.slug}`,
      lastModified: SITEMAP_LASTMOD,
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
