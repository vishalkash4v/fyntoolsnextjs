import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

/**
 * Crawl budget + indexing policy.
 * - BLOCK /s/* short links (user-generated, never index — GSC "Blocked by robots.txt" is intentional)
 * - Allow tools, hubs, blogs, guides
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/*?',
    '/fyntoolsadmin/',
    '/api/',
    '/redirect',
    '/deep-link-redirect',
    '/s/', // all short URLs e.g. /s/ijP1MR — do not index
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
