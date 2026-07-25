/**
 * Canonical URL Audit Utility
 * Scans codebase for canonical URL issues and provides fixes
 */

import { normalizeCanonicalUrl, validateCanonicalUrl, getCanonicalUrlForPath } from './canonicalUrl';

export interface CanonicalUrlIssue {
  file: string;
  line: number;
  issue: string;
  currentUrl: string;
  suggestedUrl: string;
  severity: 'error' | 'warning';
}

/**
 * Common canonical URL issues to check for
 */
export const checkCanonicalUrlIssues = (url: string, path: string): CanonicalUrlIssue[] => {
  const issues: CanonicalUrlIssue[] = [];
  const validation = validateCanonicalUrl(url);
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      issues.push({
        file: '', // Will be filled by caller
        line: 0,
        issue: error,
        currentUrl: url,
        suggestedUrl: validation.normalized || getCanonicalUrlForPath(path),
        severity: 'error'
      });
    });
  }
  
  // Check for /tools/ in path (should be removed)
  if (url.includes('/tools/') && !url.endsWith('/tools')) {
    issues.push({
      file: '',
      line: 0,
      issue: 'Canonical URL contains /tools/ segment (should be removed)',
      currentUrl: url,
      suggestedUrl: url.replace('/tools/', '/'),
      severity: 'warning'
    });
  }
  
  // Check for trailing slash (except root)
  if (url !== 'https://fyntools.com' && url !== 'https://fyntools.com/' && url.endsWith('/')) {
    issues.push({
      file: '',
      line: 0,
      issue: 'Canonical URL has trailing slash (should be removed)',
      currentUrl: url,
      suggestedUrl: url.replace(/\/$/, ''),
      severity: 'warning'
    });
  }
  
  // Check for double slashes
  if (url.includes('//') && !url.includes('://')) {
    issues.push({
      file: '',
      line: 0,
      issue: 'Canonical URL contains double slashes',
      currentUrl: url,
      suggestedUrl: url.replace(/([^:]\/)\/+/g, '$1'),
      severity: 'error'
    });
  }
  
  // Check if relative URL
  if (url.startsWith('/') && !url.startsWith('http')) {
    issues.push({
      file: '',
      line: 0,
      issue: 'Canonical URL is relative (should be absolute)',
      currentUrl: url,
      suggestedUrl: getCanonicalUrlForPath(url),
      severity: 'error'
    });
  }
  
  return issues;
};

/**
 * Get standardized canonical URL format
 * All tool pages should use: https://fyntools.com/{tool-path}
 * No /tools/ segment, no trailing slash
 */
export const getStandardCanonicalFormat = (path: string): string => {
  // Remove /tools/ if present
  let normalized = path.replace(/^\/tools\//, '/');
  
  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  
  // Remove trailing slash (except root)
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return `https://fyntools.com${normalized}`;
};

