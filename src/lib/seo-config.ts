/**
 * FYN Tools SEO / AEO / GEO source of truth.
 *
 * CRITICAL: SITE_URL is hardcoded. Never read NEXT_PUBLIC_SITE_URL here.
 * Vercel previously mixed SITE_URL with the Render API host
 * (express-kieg.onrender.com/api), which poisoned every canonical, og:url,
 * and JSON-LD @id — Search Console then showed zero impressions.
 */

export const SITE_URL = 'https://fyntools.com' as const;

/** API only — never use for canonicals, Open Graph, or schema URLs. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://express-kieg.onrender.com/api';

export const SITE_NAME = 'FYN Tools Worldwide';
export const SITE_SHORT_NAME = 'FYN Tools';

/** Bump when shipping a sitewide SEO/AEO content refresh. */
export const SEO_DATE_MODIFIED = '2026-09-23';

export const SITE = {
  name: SITE_NAME,
  shortName: SITE_SHORT_NAME,
  url: SITE_URL,
  description:
    'Free professional online tools — calculators, text tools, image editors, converters, and developer utilities.',
  email: 'support@fyntools.com',
  twitter: '@fyntoolsworldwide',
  twitterUrl: 'https://twitter.com/fyntoolsworldwide',
  locale: 'en_US',
  defaultOgImage: '/opengraph-image',
} as const;

/**
 * Absolute URL on https://fyntools.com for canonicals, og:url, and JSON-LD.
 * Strips query/hash. Always apex — never www, never the API host.
 */
export function getCanonicalUrl(path: string = '/'): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const u = new URL(path);
      const host = u.hostname.toLowerCase();
      // Only trust pathnames from our own apex; strip /api from foreign hosts
      let cleanPath = (u.pathname.split('?')[0] || '/').split('#')[0] || '/';
      if (host !== 'fyntools.com' && host !== 'www.fyntools.com') {
        cleanPath = cleanPath.replace(/^\/api(?=\/|$)/, '') || '/';
      }
      return getCanonicalUrl(cleanPath);
    } catch {
      return `${SITE_URL}/`;
    }
  }
  const clean = (path.split('?')[0] || '/').split('#')[0] || '/';
  const normalized = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SITE_URL}${normalized === '/' ? '/' : normalized.replace(/\/$/, '')}`;
}

/** Alias used by existing SEO helpers — identical to getCanonicalUrl. */
export function absoluteUrl(path: string): string {
  return getCanonicalUrl(path);
}

export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.replace(/\/$/, '') || '/';
}
