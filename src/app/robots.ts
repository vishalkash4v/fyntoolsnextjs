import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

/**
 * Crawl budget rules:
 * - Allow all indexable content
 * - Disallow query-string URLs (faceted /tools?category=… burned GSC crawl budget)
 * - Keep admin, short-link, and redirect helpers out of the index
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
  ];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: 'Googlebot', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
