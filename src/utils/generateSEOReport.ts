/**
 * Generate Final SEO Readiness Report
 * Can be called from console or build script
 */

import { runSEOAudit, generateSEOReadinessReport, type SEOAuditResult } from './seoAudit';

/**
 * Generate and save SEO report to file (for build scripts)
 */
export const generateAndSaveSEOReport = async (outputPath: string = 'SEO_READINESS_REPORT.txt'): Promise<void> => {
  const report = generateSEOReadinessReport();
  
  // In Node.js environment (build script)
  if (typeof process !== 'undefined' && process.versions?.node) {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, report, 'utf-8');
    console.log(`✅ SEO report saved to ${outputPath}`);
  } else {
    // In browser environment, log to console
    console.log(report);
  }
};

/**
 * Get SEO audit results as JSON
 */
export const getSEOAuditJSON = (): SEOAuditResult => {
  return runSEOAudit();
};

/**
 * Get SEO score only
 */
export const getSEOScore = (): number => {
  const audit = runSEOAudit();
  return audit.score;
};

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).runSEOAudit = runSEOAudit;
  (window as any).getSEOReport = generateSEOReadinessReport;
  (window as any).getSEOScore = getSEOScore;
}

