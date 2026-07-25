/**
 * Runtime checker to detect duplicate canonical URLs
 * Can be used in development to warn about issues
 */

/**
 * Checks if there are duplicate canonical tags in the document
 * Should be called after page render
 */
export const checkForDuplicateCanonicals = (): {
  hasDuplicates: boolean;
  count: number;
  urls: string[];
} => {
  if (typeof document === 'undefined') {
    return { hasDuplicates: false, count: 0, urls: [] };
  }

  const canonicalTags = document.querySelectorAll('link[rel="canonical"]');
  const urls = Array.from(canonicalTags).map(tag => 
    (tag as HTMLLinkElement).href
  );

  const uniqueUrls = new Set(urls);
  
  return {
    hasDuplicates: canonicalTags.length > 1,
    count: canonicalTags.length,
    urls: Array.from(uniqueUrls)
  };
};

/**
 * Logs canonical URL issues in development
 */
export const logCanonicalIssues = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const check = checkForDuplicateCanonicals();
  
  if (check.hasDuplicates) {
    console.warn('⚠️ Multiple canonical URLs found:', {
      count: check.count,
      urls: check.urls
    });
    console.warn('Only one canonical URL should be present per page.');
  }

  // Check for trailing slashes
  check.urls.forEach(url => {
    if (url !== 'https://fyntools.com' && url !== 'https://fyntools.com/' && url.endsWith('/')) {
      console.warn(`⚠️ Canonical URL has trailing slash: ${url}`);
    }
  });

  // Check for /tools/ segment
  check.urls.forEach(url => {
    if (url.includes('/tools/') && !url.endsWith('/tools')) {
      console.warn(`⚠️ Canonical URL contains /tools/ segment: ${url}`);
    }
  });
};

