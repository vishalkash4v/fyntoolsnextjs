/**
 * Canonical URL normalization and validation utilities
 * Ensures consistent, SEO-friendly canonical URLs across the site
 */

const DEFAULT_SITE_URL = 'https://fyntools.com';

/**
 * Normalizes a canonical URL to ensure consistency
 * - Removes trailing slashes (except for root)
 * - Removes double slashes
 * - Ensures proper protocol and domain
 * - Converts relative URLs to absolute
 */
export const normalizeCanonicalUrl = (
  url: string | undefined,
  currentPath: string,
  siteUrl: string = DEFAULT_SITE_URL
): string => {
  // If no URL provided, generate from current path
  if (!url) {
    return normalizePath(`${siteUrl}${currentPath}`);
  }

  // Handle relative URLs
  if (url.startsWith('/')) {
    return normalizePath(`${siteUrl}${url}`);
  }

  // Handle absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Extract path from full URL
    try {
      const urlObj = new URL(url);
      return normalizePath(`${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}`);
    } catch {
      // If URL parsing fails, try to normalize manually
      return normalizePath(url);
    }
  }

  // If it's just a path without leading slash, add it
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return normalizePath(`${siteUrl}/${url}`);
  }

  return normalizePath(`${siteUrl}${url}`);
};

/**
 * Normalizes a URL path
 * - Removes trailing slashes (except root)
 * - Removes double slashes
 * - Removes query strings and fragments (for canonical)
 */
const normalizePath = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Normalize pathname
    let pathname = urlObj.pathname;
    
    // Remove trailing slash (except for root)
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    
    // Remove double slashes (except after protocol)
    pathname = pathname.replace(/\/+/g, '/');
    
    // Reconstruct URL without query string or fragment (canonical should be clean)
    return `${urlObj.protocol}//${urlObj.host}${pathname}`;
  } catch {
    // Fallback: manual normalization
    let normalized = url;
    
    // Remove query string and fragment
    normalized = normalized.split('?')[0].split('#')[0];
    
    // Remove trailing slash (except root)
    if (normalized !== 'https://fyntools.com' && normalized !== 'https://fyntools.com/') {
      normalized = normalized.replace(/\/$/, '');
    }
    
    // Remove double slashes (but preserve http:// or https://)
    normalized = normalized.replace(/([^:]\/)\/+/g, '$1');
    
    return normalized;
  }
};

/**
 * Validates a canonical URL
 * Returns true if URL is valid and properly formatted
 */
export const validateCanonicalUrl = (url: string): {
  isValid: boolean;
  errors: string[];
  normalized?: string;
} => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('Canonical URL is empty');
    return { isValid: false, errors };
  }

  // Check for trailing slash (except root)
  if (url !== 'https://fyntools.com' && url !== 'https://fyntools.com/' && url.endsWith('/')) {
    errors.push('Canonical URL should not have trailing slash (except root)');
  }

  // Check for double slashes
  if (url.includes('//') && !url.includes('://')) {
    errors.push('Canonical URL contains double slashes');
  }

  // Check for query strings (canonical should be clean)
  if (url.includes('?')) {
    errors.push('Canonical URL should not contain query strings');
  }

  // Check for fragments
  if (url.includes('#')) {
    errors.push('Canonical URL should not contain fragments');
  }

  // Check if it's absolute
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    errors.push('Canonical URL should be absolute (include protocol and domain)');
  }

  const normalized = normalizeCanonicalUrl(url, '', DEFAULT_SITE_URL);
  
  return {
    isValid: errors.length === 0,
    errors,
    normalized: normalized !== url ? normalized : undefined
  };
};

/**
 * Gets the canonical URL for a given path
 * Ensures consistency across all routes
 */
export const getCanonicalUrlForPath = (
  path: string,
  siteUrl: string = DEFAULT_SITE_URL
): string => {
  // Normalize path
  let normalizedPath = path;
  
  // Remove trailing slash (except root)
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  // Ensure leading slash
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Remove double slashes
  normalizedPath = normalizedPath.replace(/\/+/g, '/');
  
  return `${siteUrl}${normalizedPath}`;
};

/**
 * Checks if two URLs are equivalent (ignoring trailing slashes, etc.)
 */
export const areUrlsEquivalent = (url1: string, url2: string): boolean => {
  const normalized1 = normalizeCanonicalUrl(url1, '', DEFAULT_SITE_URL);
  const normalized2 = normalizeCanonicalUrl(url2, '', DEFAULT_SITE_URL);
  return normalized1 === normalized2;
};

