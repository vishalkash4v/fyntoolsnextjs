/**
 * Comprehensive SEO Audit System
 * Audits entire site for SEO issues:
 * - Canonical consistency
 * - Duplicate titles
 * - Missing meta descriptions
 * - Schema validation
 * - Broken internal links
 */

import { allTools, type Tool } from '@/data/toolsData';
import { getCanonicalUrlForPath } from './canonicalUrl';

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: 'canonical' | 'title' | 'meta' | 'schema' | 'links' | 'content';
  toolId?: string;
  toolName?: string;
  path: string;
  message: string;
  suggestion?: string;
}

export interface SEOAuditResult {
  totalTools: number;
  issues: SEOIssue[];
  errors: number;
  warnings: number;
  info: number;
  score: number; // 0-100
  categories: {
    canonical: { total: number; errors: number; warnings: number };
    title: { total: number; errors: number; warnings: number };
    meta: { total: number; errors: number; warnings: number };
    schema: { total: number; errors: number; warnings: number };
    links: { total: number; errors: number; warnings: number };
    content: { total: number; errors: number; warnings: number };
  };
}

/**
 * Audit canonical URLs across all tools
 */
const auditCanonicalUrls = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  const canonicalMap = new Map<string, string[]>(); // URL -> [toolIds]

  allTools.forEach(tool => {
    const canonicalUrl = getCanonicalUrlForPath(tool.path);

    // Check for duplicates
    if (canonicalMap.has(canonicalUrl)) {
      canonicalMap.get(canonicalUrl)!.push(tool.id);
    } else {
      canonicalMap.set(canonicalUrl, [tool.id]);
    }

    // Check for trailing slash (should be normalized, but verify)
    if (canonicalUrl !== 'https://fyntools.com' && canonicalUrl.endsWith('/')) {
      issues.push({
        type: 'warning',
        category: 'canonical',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Canonical URL has trailing slash',
        suggestion: `Remove trailing slash: ${canonicalUrl.replace(/\/$/, '')}`
      });
    }

    // Check for /tools/ segment
    if (canonicalUrl.includes('/tools/') && !canonicalUrl.endsWith('/tools')) {
      issues.push({
        type: 'warning',
        category: 'canonical',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Canonical URL contains /tools/ segment',
        suggestion: `Remove /tools/: ${canonicalUrl.replace('/tools/', '/')}`
      });
    }

    // Validate URL format
    try {
      new URL(canonicalUrl);
    } catch {
      issues.push({
        type: 'error',
        category: 'canonical',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Invalid canonical URL format',
        suggestion: `Use valid URL format: https://fyntools.com${tool.path}`
      });
    }
  });

  // Check for duplicate canonical URLs
  canonicalMap.forEach((toolIds, url) => {
    if (toolIds.length > 1) {
      issues.push({
        type: 'error',
        category: 'canonical',
        path: url,
        message: `Duplicate canonical URL used by ${toolIds.length} tools: ${toolIds.join(', ')}`,
        suggestion: 'Each tool must have a unique canonical URL'
      });
    }
  });

  return issues;
};

/**
 * Audit page titles for duplicates
 */
const auditTitles = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  const titleMap = new Map<string, string[]>(); // Title -> [toolIds]

  allTools.forEach(tool => {
    // Generate expected title
    const expectedTitle = `${tool.name} - Free Online Tool | FYN Tools Worldwide`;
    
    // Check for duplicates
    if (titleMap.has(expectedTitle)) {
      titleMap.get(expectedTitle)!.push(tool.id);
    } else {
      titleMap.set(expectedTitle, [tool.id]);
    }

    // Check title length
    if (expectedTitle.length > 60) {
      issues.push({
        type: 'warning',
        category: 'title',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: `Title too long (${expectedTitle.length} chars, recommended: 60)`,
        suggestion: `Shorten title to 60 characters or less`
      });
    }

    if (expectedTitle.length < 30) {
      issues.push({
        type: 'warning',
        category: 'title',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: `Title too short (${expectedTitle.length} chars, recommended: 30-60)`,
        suggestion: `Expand title to 30-60 characters`
      });
    }
  });

  // Check for duplicate titles
  titleMap.forEach((toolIds, title) => {
    if (toolIds.length > 1) {
      issues.push({
        type: 'error',
        category: 'title',
        path: title,
        message: `Duplicate title used by ${toolIds.length} tools: ${toolIds.join(', ')}`,
        suggestion: 'Each tool should have a unique title'
      });
    }
  });

  return issues;
};

/**
 * Audit meta descriptions
 */
const auditMetaDescriptions = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];

  allTools.forEach(tool => {
    // Check if description exists
    if (!tool.description || tool.description.trim().length === 0) {
      issues.push({
        type: 'error',
        category: 'meta',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Missing meta description',
        suggestion: 'Add a descriptive meta description (150-160 characters recommended)'
      });
      return;
    }

    // Check description length
    const descLength = tool.description.length;
    if (descLength < 120) {
      issues.push({
        type: 'warning',
        category: 'meta',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: `Meta description too short (${descLength} chars, recommended: 120-160)`,
        suggestion: 'Expand description to 120-160 characters for better SEO'
      });
    }

    if (descLength > 160) {
      issues.push({
        type: 'warning',
        category: 'meta',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: `Meta description too long (${descLength} chars, recommended: 120-160)`,
        suggestion: 'Shorten description to 120-160 characters'
      });
    }

    // Check for keywords in description
    if (tool.keywords) {
      const keywordArray = tool.keywords.split(',').map(k => k.trim());
      const primaryKeyword = keywordArray[0]?.toLowerCase();
      if (primaryKeyword && !tool.description.toLowerCase().includes(primaryKeyword)) {
        issues.push({
          type: 'info',
          category: 'meta',
          toolId: tool.id,
          toolName: tool.name,
          path: tool.path,
          message: `Primary keyword "${primaryKeyword}" not found in description`,
          suggestion: 'Consider including primary keyword in meta description'
        });
      }
    }
  });

  return issues;
};

/**
 * Audit schema markup
 */
const auditSchemaMarkup = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];

  // Note: Schema validation happens at runtime
  // This is a static check for potential issues

  allTools.forEach(tool => {
    // Check if tool has required data for schema
    if (!tool.description) {
      issues.push({
        type: 'warning',
        category: 'schema',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Missing description for schema generation',
        suggestion: 'Add description to enable SoftwareApplication schema'
      });
    }

    // Check if tool has category (useful for schema)
    if (!tool.category) {
      issues.push({
        type: 'info',
        category: 'schema',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Missing category for schema generation',
        suggestion: 'Add category to improve schema markup'
      });
    }
  });

  return issues;
};

/**
 * Audit internal links
 */
const auditInternalLinks = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  const validPaths = new Set(allTools.map(tool => tool.path));
  const validPathsWithSlash = new Set(allTools.map(tool => `${tool.path}/`));

  allTools.forEach(tool => {
    // Check if tool path is valid
    if (!tool.path || tool.path.trim().length === 0) {
      issues.push({
        type: 'error',
        category: 'links',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path || 'unknown',
        message: 'Tool has empty or invalid path',
        suggestion: 'Add a valid path for the tool'
      });
    }

    // Check if path starts with /
    if (tool.path && !tool.path.startsWith('/')) {
      issues.push({
        type: 'error',
        category: 'links',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Tool path does not start with /',
        suggestion: `Use: /${tool.path}`
      });
    }

    // Check href if provided
    if (tool.href && tool.href !== tool.path) {
      issues.push({
        type: 'warning',
        category: 'links',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: `href (${tool.href}) does not match path (${tool.path})`,
        suggestion: `Use consistent href: ${tool.path}`
      });
    }
  });

  return issues;
};

/**
 * Audit content quality
 */
const auditContent = (): SEOIssue[] => {
  const issues: SEOIssue[] = [];

  allTools.forEach(tool => {
    // Check description quality
    if (tool.description) {
      if (tool.description.length < 50) {
        issues.push({
          type: 'warning',
          category: 'content',
          toolId: tool.id,
          toolName: tool.name,
          path: tool.path,
          message: 'Description is very short (less than 50 characters)',
          suggestion: 'Expand description for better SEO'
        });
      }
    }

    // Check keywords
    if (!tool.keywords || tool.keywords.trim().length === 0) {
      issues.push({
        type: 'warning',
        category: 'content',
        toolId: tool.id,
        toolName: tool.name,
        path: tool.path,
        message: 'Missing keywords',
        suggestion: 'Add relevant keywords for better SEO'
      });
    } else {
      const keywordCount = tool.keywords.split(',').length;
      if (keywordCount < 3) {
        issues.push({
          type: 'info',
          category: 'content',
          toolId: tool.id,
          toolName: tool.name,
          path: tool.path,
          message: `Only ${keywordCount} keyword(s) provided (recommended: 3-5)`,
          suggestion: 'Add more keyword variations for better SEO coverage'
        });
      }
    }
  });

  return issues;
};

/**
 * Run comprehensive SEO audit
 */
export const runSEOAudit = (): SEOAuditResult => {
  const issues: SEOIssue[] = [];

  // Run all audits
  issues.push(...auditCanonicalUrls());
  issues.push(...auditTitles());
  issues.push(...auditMetaDescriptions());
  issues.push(...auditSchemaMarkup());
  issues.push(...auditInternalLinks());
  issues.push(...auditContent());

  // Categorize issues
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const info = issues.filter(i => i.type === 'info');

  // Calculate score (100 - errors*2 - warnings*1 - info*0.5)
  const score = Math.max(0, Math.min(100, 100 - (errors.length * 2) - (warnings.length * 1) - (info.length * 0.5)));

  // Count by category
  const categories = {
    canonical: {
      total: issues.filter(i => i.category === 'canonical').length,
      errors: errors.filter(i => i.category === 'canonical').length,
      warnings: warnings.filter(i => i.category === 'canonical').length
    },
    title: {
      total: issues.filter(i => i.category === 'title').length,
      errors: errors.filter(i => i.category === 'title').length,
      warnings: warnings.filter(i => i.category === 'title').length
    },
    meta: {
      total: issues.filter(i => i.category === 'meta').length,
      errors: errors.filter(i => i.category === 'meta').length,
      warnings: warnings.filter(i => i.category === 'meta').length
    },
    schema: {
      total: issues.filter(i => i.category === 'schema').length,
      errors: errors.filter(i => i.category === 'schema').length,
      warnings: warnings.filter(i => i.category === 'schema').length
    },
    links: {
      total: issues.filter(i => i.category === 'links').length,
      errors: errors.filter(i => i.category === 'links').length,
      warnings: warnings.filter(i => i.category === 'links').length
    },
    content: {
      total: issues.filter(i => i.category === 'content').length,
      errors: errors.filter(i => i.category === 'content').length,
      warnings: warnings.filter(i => i.category === 'content').length
    }
  };

  return {
    totalTools: allTools.length,
    issues,
    errors: errors.length,
    warnings: warnings.length,
    info: info.length,
    score: Math.round(score * 10) / 10,
    categories
  };
};

/**
 * Generate SEO readiness report
 */
export const generateSEOReadinessReport = (): string => {
  const audit = runSEOAudit();
  
  let report = '='.repeat(80) + '\n';
  report += 'SEO READINESS REPORT\n';
  report += '='.repeat(80) + '\n\n';
  
  report += `Audit Date: ${new Date().toISOString().split('T')[0]}\n`;
  report += `Total Tools Audited: ${audit.totalTools}\n`;
  report += `SEO Score: ${audit.score}/100\n\n`;
  
  report += 'SUMMARY\n';
  report += '-'.repeat(80) + '\n';
  report += `Errors: ${audit.errors}\n`;
  report += `Warnings: ${audit.warnings}\n`;
  report += `Info: ${audit.info}\n`;
  report += `Total Issues: ${audit.issues.length}\n\n`;
  
  report += 'ISSUES BY CATEGORY\n';
  report += '-'.repeat(80) + '\n';
  Object.entries(audit.categories).forEach(([category, stats]) => {
    if (stats.total > 0) {
      report += `${category.toUpperCase()}: ${stats.total} issues (${stats.errors} errors, ${stats.warnings} warnings)\n`;
    }
  });
  report += '\n';
  
  // Group issues by type
  if (audit.errors > 0) {
    report += 'ERRORS (Must Fix)\n';
    report += '-'.repeat(80) + '\n';
    audit.issues.filter(i => i.type === 'error').forEach(issue => {
      report += `[${issue.category.toUpperCase()}] ${issue.toolName || 'General'}: ${issue.message}\n`;
      if (issue.suggestion) {
        report += `  → ${issue.suggestion}\n`;
      }
      report += `  Path: ${issue.path}\n\n`;
    });
  }
  
  if (audit.warnings > 0) {
    report += 'WARNINGS (Should Fix)\n';
    report += '-'.repeat(80) + '\n';
    audit.issues.filter(i => i.type === 'warning').slice(0, 20).forEach(issue => {
      report += `[${issue.category.toUpperCase()}] ${issue.toolName || 'General'}: ${issue.message}\n`;
      if (issue.suggestion) {
        report += `  → ${issue.suggestion}\n`;
      }
      report += `  Path: ${issue.path}\n\n`;
    });
    if (audit.warnings > 20) {
      report += `... and ${audit.warnings - 20} more warnings\n\n`;
    }
  }
  
  report += 'RECOMMENDATIONS\n';
  report += '-'.repeat(80) + '\n';
  
  if (audit.score >= 90) {
    report += '✅ Excellent SEO readiness! Your site is well-optimized.\n';
    report += '   Continue monitoring and maintain current standards.\n';
  } else if (audit.score >= 75) {
    report += '⚠️ Good SEO readiness with room for improvement.\n';
    report += '   Focus on fixing errors and addressing warnings.\n';
  } else if (audit.score >= 60) {
    report += '⚠️ Moderate SEO readiness. Several issues need attention.\n';
    report += '   Prioritize fixing errors first, then warnings.\n';
  } else {
    report += '❌ Low SEO readiness. Significant issues detected.\n';
    report += '   Immediate action required to fix errors.\n';
  }
  
  report += '\n' + '='.repeat(80) + '\n';
  
  return report;
};

/**
 * Print SEO audit report to console
 */
export const printSEOAuditReport = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(generateSEOReadinessReport());
  }
};

