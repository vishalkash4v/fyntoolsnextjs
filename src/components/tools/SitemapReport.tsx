'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Info, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface UrlResult {
  url: string;
  originalUrl: string;
  statusCode: number;
  statusText: string;
  redirectChain: string[];
  finalUrl: string;
  responseTime: number;
  ttfb: number;
  isBlocked: boolean;
  hasNoindex: boolean;
  canonicalUrl?: string;
  isSoft404: boolean;
  error?: string;
  priority?: number;
  changefreq?: string;
  lastmod?: string;
}

interface SitemapAnalysis {
  totalUrls: number;
  uniqueUrls: number;
  validUrls: number;
  redirectedUrls: number;
  brokenUrls: number;
  blockedUrls: number;
  corsBlockedUrls: number;
  averageResponseTime: number;
  slowPages: number;
  healthScore: number;
  results: UrlResult[];
}

interface SitemapReportProps {
  analysis: SitemapAnalysis;
}

const SitemapReport: React.FC<SitemapReportProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVerdict = (score: number): { text: string; color: string } => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 70) return { text: 'Good', color: 'text-yellow-600' };
    if (score >= 50) return { text: 'Needs Improvement', color: 'text-orange-600' };
    return { text: 'Poor', color: 'text-red-600' };
  };

  const calculateScores = () => {
    const total = analysis.totalUrls;
    const validPercent = (analysis.validUrls / total) * 100;
    const redirectPercent = (analysis.redirectedUrls / total) * 100;
    const brokenPercent = (analysis.brokenUrls / total) * 100;
    const blockedPercent = (analysis.blockedUrls / total) * 100;

    const crawlabilityScore = Math.max(0, 100 - (brokenPercent * 2) - (blockedPercent * 2));
    const redirectHygieneScore = Math.max(0, 100 - (redirectPercent * 1.5));
    const indexingQualityScore = Math.max(0, 100 - (blockedPercent * 3) - (analysis.results.filter(r => r.hasNoindex).length / total * 100 * 2));
    const technicalValidityScore = validPercent;

    return {
      crawlabilityScore: Math.round(crawlabilityScore),
      redirectHygieneScore: Math.round(redirectHygieneScore),
      indexingQualityScore: Math.round(indexingQualityScore),
      technicalValidityScore: Math.round(technicalValidityScore),
    };
  };

  const scores = calculateScores();

  const criticalIssues = [
    ...analysis.results.filter(r => r.statusCode === 404 || r.statusCode >= 500).slice(0, 10).map(r => ({
      type: 'Broken URL',
      url: r.url,
      message: `Returns ${r.statusCode} ${r.statusText}`,
    })),
    ...analysis.results.filter(r => r.isBlocked).slice(0, 5).map(r => ({
      type: 'Blocked by robots.txt',
      url: r.url,
      message: 'URL is blocked by robots.txt',
    })),
    ...analysis.results.filter(r => r.error).slice(0, 5).map(r => ({
      type: 'Connection Error',
      url: r.url,
      message: r.error || 'Unknown error',
    })),
  ];

  const warnings = [
    ...analysis.results.filter(r => [301, 302, 307, 308].includes(r.statusCode) && r.redirectChain.length > 3).slice(0, 10).map(r => ({
      type: 'Excessive Redirects',
      url: r.url,
      message: `${r.redirectChain.length} redirects in chain`,
    })),
    ...analysis.results.filter(r => r.hasNoindex).slice(0, 10).map(r => ({
      type: 'Noindex in Sitemap',
      url: r.url,
      message: 'Page has noindex meta tag but is in sitemap',
    })),
    ...analysis.results.filter(r => r.isSoft404).slice(0, 10).map(r => ({
      type: 'Soft 404',
      url: r.url,
      message: 'Page returns 200 but appears to be an error page',
    })),
    ...analysis.results.filter(r => r.canonicalUrl && r.canonicalUrl !== r.url).slice(0, 10).map(r => ({
      type: 'Canonical Mismatch',
      url: r.url,
      message: `Canonical points to: ${r.canonicalUrl}`,
    })),
  ];

  const recommendations = [
    analysis.brokenUrls > 0 && {
      type: 'Remove Broken URLs',
      message: `Remove ${analysis.brokenUrls} broken URLs (404/5xx) from sitemap`,
      priority: 'High',
    },
    analysis.blockedUrls > 0 && {
      type: 'Fix robots.txt',
      message: `${analysis.blockedUrls} URLs are blocked by robots.txt. Update robots.txt or remove from sitemap`,
      priority: 'High',
    },
    analysis.redirectedUrls > 0 && {
      type: 'Fix Redirects',
      message: `Update ${analysis.redirectedUrls} redirects to point directly to final URLs`,
      priority: 'Medium',
    },
    analysis.results.filter(r => r.hasNoindex).length > 0 && {
      type: 'Remove Noindex Pages',
      message: `Remove ${analysis.results.filter(r => r.hasNoindex).length} pages with noindex from sitemap`,
      priority: 'Medium',
    },
    analysis.slowPages > 0 && {
      type: 'Optimize Slow Pages',
      message: `${analysis.slowPages} pages take more than 3 seconds to load. Optimize performance`,
      priority: 'Low',
    },
  ].filter(Boolean);

  const copyReport = () => {
    const reportText = generateTextReport();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Report copied',
      description: 'Sitemap report copied to clipboard',
    });
  };

  const generateTextReport = (): string => {
    const verdict = getVerdict(analysis.healthScore);
    return `
XML Sitemap Quality Report
===========================

Overall Health Score: ${analysis.healthScore}/100
Verdict: ${verdict.text}

Core Metrics:
- Total URLs: ${analysis.totalUrls}
- Unique URLs: ${analysis.uniqueUrls}
- Valid URLs (200): ${analysis.validUrls} (${((analysis.validUrls / analysis.totalUrls) * 100).toFixed(1)}%)
- Redirected URLs: ${analysis.redirectedUrls} (${((analysis.redirectedUrls / analysis.totalUrls) * 100).toFixed(1)}%)
- Broken URLs: ${analysis.brokenUrls} (${((analysis.brokenUrls / analysis.totalUrls) * 100).toFixed(1)}%)
- Blocked URLs: ${analysis.blockedUrls} (${((analysis.blockedUrls / analysis.totalUrls) * 100).toFixed(1)}%)
- Average Response Time: ${Math.round(analysis.averageResponseTime)}ms
- Slow Pages (>3s): ${analysis.slowPages}

Score Breakdown:
- Crawlability Score: ${scores.crawlabilityScore}/100
- Redirect Hygiene Score: ${scores.redirectHygieneScore}/100
- Indexing Quality Score: ${scores.indexingQualityScore}/100
- Technical Validity Score: ${scores.technicalValidityScore}/100

Critical Issues: ${criticalIssues.length}
Warnings: ${warnings.length}
Recommendations: ${recommendations.length}

Generated by FYN Tools Sitemap Tester
    `.trim();
  };

  const exportReport = (format: 'json' | 'text') => {
    const data = {
      overallScore: analysis.healthScore,
      verdict: getVerdict(analysis.healthScore).text,
      metrics: {
        totalUrls: analysis.totalUrls,
        uniqueUrls: analysis.uniqueUrls,
        validUrls: analysis.validUrls,
        redirectedUrls: analysis.redirectedUrls,
        brokenUrls: analysis.brokenUrls,
        blockedUrls: analysis.blockedUrls,
        averageResponseTime: analysis.averageResponseTime,
        slowPages: analysis.slowPages,
      },
      scores: scores,
      criticalIssues,
      warnings,
      recommendations,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap-report.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const text = generateTextReport();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap-report.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: 'Report exported',
      description: `Report exported as ${format.toUpperCase()}`,
    });
  };

  const verdict = getVerdict(analysis.healthScore);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Sitemap Quality Report</CardTitle>
              <CardDescription>Comprehensive analysis of your sitemap</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyReport}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('text')}>
                <Download className="h-4 w-4 mr-2" />
                Export TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(analysis.healthScore)}`}>
              {analysis.healthScore}
            </div>
            <div className={`text-2xl font-semibold ${verdict.color}`}>
              {verdict.text}
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {analysis.healthScore >= 90
                ? 'Your sitemap is in excellent condition. All URLs are accessible and properly configured.'
                : analysis.healthScore >= 70
                ? 'Your sitemap is in good condition with minor issues that should be addressed.'
                : analysis.healthScore >= 50
                ? 'Your sitemap needs improvement. Several issues are impacting indexing and crawlability.'
                : 'Your sitemap has significant issues that are blocking proper indexing. Immediate action is required.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Crawlability Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(scores.crawlabilityScore)}`}>
                {scores.crawlabilityScore}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Redirect Hygiene</div>
              <div className={`text-3xl font-bold ${getScoreColor(scores.redirectHygieneScore)}`}>
                {scores.redirectHygieneScore}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Indexing Quality</div>
              <div className={`text-3xl font-bold ${getScoreColor(scores.indexingQualityScore)}`}>
                {scores.indexingQualityScore}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Technical Validity</div>
              <div className={`text-3xl font-bold ${getScoreColor(scores.technicalValidityScore)}`}>
                {scores.technicalValidityScore}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Sitemap Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Valid URLs (200)</div>
              <div className="text-2xl font-bold text-green-600">
                {((analysis.validUrls / analysis.totalUrls) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Redirected URLs</div>
              <div className="text-2xl font-bold text-yellow-600">
                {((analysis.redirectedUrls / analysis.totalUrls) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Broken URLs</div>
              <div className="text-2xl font-bold text-red-600">
                {((analysis.brokenUrls / analysis.totalUrls) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Blocked URLs</div>
              <div className="text-2xl font-bold text-orange-600">
                {((analysis.blockedUrls / analysis.totalUrls) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <div className="text-2xl font-bold">
                {Math.round(analysis.averageResponseTime)}ms
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Redirect Depth</div>
              <div className="text-2xl font-bold">
                {analysis.results.filter(r => r.redirectChain.length > 1).length > 0
                  ? (analysis.results
                      .filter(r => r.redirectChain.length > 1)
                      .reduce((sum, r) => sum + r.redirectChain.length, 0) /
                      analysis.results.filter(r => r.redirectChain.length > 1).length).toFixed(1)
                  : '0'}
              </div>
            </div>
            <div>
                <div className="text-sm text-muted-foreground">Slow Pages (&gt;3s)</div>
              <div className="text-2xl font-bold text-orange-600">
                {analysis.slowPages}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Unique URLs</div>
              <div className="text-2xl font-bold">
                {analysis.uniqueUrls}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passed Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Passed Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Valid XML structure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Sitemap schema compliance</span>
            </div>
            {analysis.results.every(r => r.url.startsWith('https://')) && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>HTTPS usage</span>
              </div>
            )}
            {analysis.results.every(r => r.redirectChain.length <= 5) && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No redirect loops detected</span>
              </div>
            )}
            {analysis.totalUrls <= 50000 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Proper sitemap size (&lt;50,000 URLs)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Critical Issues ({criticalIssues.length})
            </CardTitle>
            <CardDescription>Issues that are blocking indexing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalIssues.slice(0, 10).map((issue, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">{issue.type}</div>
                    <div className="text-sm mt-1 break-all">{issue.url}</div>
                    <div className="text-sm mt-1">{issue.message}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Warnings ({warnings.length})
            </CardTitle>
            <CardDescription>SEO-impacting issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warnings.slice(0, 10).map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">{warning.type}</div>
                    <div className="text-sm mt-1 break-all">{warning.url}</div>
                    <div className="text-sm mt-1">{warning.message}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recommendations ({recommendations.length})
            </CardTitle>
            <CardDescription>Best practices and optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec: any, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rec.type}</span>
                      <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{rec.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SitemapReport;
