import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

/**
 * Crawl budget + LLM discovery (2026).
 * - Block faceted/query URLs and non-content surfaces
 * - Allow all indexable tool/hub/guide/blog pages
 * - Point crawlers at sitemap + host (apex)
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/*?',
    '/fyntoolsadmin/',
    '/api/',
    '/redirect',
    '/deep-link-redirect',
    '/s/',
    '/themes',
    '/themes/',
  ];

  const allowPublic = [
    '/',
    '/llms.txt',
    '/ai.txt',
    '/agents.json',
    '/agent-instructions.md',
    '/sitemap.xml',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow,
      },
      { userAgent: 'GPTBot', allow: allowPublic, disallow },
      { userAgent: 'ChatGPT-User', allow: allowPublic, disallow },
      { userAgent: 'ClaudeBot', allow: allowPublic, disallow },
      { userAgent: 'anthropic-ai', allow: allowPublic, disallow },
      { userAgent: 'Google-Extended', allow: allowPublic, disallow },
      { userAgent: 'PerplexityBot', allow: allowPublic, disallow },
      { userAgent: 'Applebot-Extended', allow: allowPublic, disallow },
      { userAgent: 'Bytespider', allow: allowPublic, disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
