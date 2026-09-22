/**
 * Re-exports the hardcoded SEO config.
 * Prefer importing from `@/lib/seo-config` in new code.
 */
export {
  SITE_URL,
  API_BASE_URL,
  SITE,
  SEO_DATE_MODIFIED,
  getCanonicalUrl,
  absoluteUrl,
  normalizePath,
} from '@/lib/seo-config';

/** @deprecated Use SITE_URL from `@/lib/seo-config` */
export { SITE_URL as PRODUCTION_SITE_URL } from '@/lib/seo-config';
