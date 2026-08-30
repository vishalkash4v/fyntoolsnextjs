import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

/**
 * Dynamic robots.txt — served by Next.js with correct content-type and caching.
 * Replaces static public/robots.txt to avoid CDN/serverless fetch failures in GSC.
 *
 * Note: Do not use Disallow rules with query-string wildcards — Google strips
 * query strings before matching and some crawlers fail to parse them.
 * and X-Robots-Tag on /tools?search= in middleware.
 */
const DISALLOW = [
  '/fyntoolsadmin/',
  '/api/',
  '/redirect',
  '/deep-link-redirect',
  '/s/',
  '/themes',
  '/themes/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/fyntoolsadmin/', '/api/', '/s/', '/themes'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt', '/ai.txt', '/agents.json', '/agent-instructions.md', '/sitemap.xml'],
        disallow: ['/fyntoolsadmin/', '/api/', '/s/', '/themes'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/llms.txt', '/ai.txt', '/agents.json', '/agent-instructions.md', '/sitemap.xml'],
        disallow: ['/fyntoolsadmin/', '/api/', '/s/', '/themes'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/llms.txt', '/ai.txt', '/agents.json', '/agent-instructions.md', '/sitemap.xml'],
        disallow: ['/fyntoolsadmin/', '/api/', '/s/', '/themes'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/llms.txt', '/ai.txt', '/agents.json', '/sitemap.xml'],
        disallow: ['/fyntoolsadmin/', '/api/', '/s/', '/themes'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
