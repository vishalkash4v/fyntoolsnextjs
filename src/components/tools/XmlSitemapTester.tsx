'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Link, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Copy,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';
import SitemapReport from './SitemapReport';

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

const XmlSitemapTester: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<'upload' | 'url' | 'paste'>('url');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<SitemapAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport, setShowReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/xml' && file.type !== 'application/xml' && !file.name.endsWith('.xml')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an XML file.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setXmlContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const parseSitemap = async (xmlText: string, baseUrl?: string): Promise<string[]> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML structure: ' + parseError.textContent);
    }

    const urls: string[] = [];
    const root = xmlDoc.documentElement;

    // Check if it's a sitemapindex
    if (root.tagName === 'sitemapindex' || root.getElementsByTagName('sitemap').length > 0) {
      const sitemapElements = root.getElementsByTagName('sitemap');
      const sitemapUrls: string[] = [];
      
      for (let i = 0; i < sitemapElements.length; i++) {
        const loc = sitemapElements[i].getElementsByTagName('loc')[0];
        if (loc && loc.textContent) {
          sitemapUrls.push(loc.textContent.trim());
        }
      }

      // Recursively fetch nested sitemaps
      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await fetch(sitemapUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, text/xml, */*',
            },
          });
          
          if (response.ok) {
            const nestedXml = await response.text();
            const nestedUrls = await parseSitemap(nestedXml, sitemapUrl);
            urls.push(...nestedUrls);
          }
        } catch (err) {
          console.error(`Error fetching nested sitemap ${sitemapUrl}:`, err);
        }
      }
    } else {
      // Regular sitemap
      const urlElements = root.getElementsByTagName('url');
      for (let i = 0; i < urlElements.length; i++) {
        const loc = urlElements[i].getElementsByTagName('loc')[0];
        if (loc && loc.textContent) {
          urls.push(loc.textContent.trim());
        }
      }
    }

    // Normalize and deduplicate URLs
    const normalizedUrls = urls.map(url => {
      try {
        const urlObj = new URL(url);
        urlObj.hash = ''; // Remove fragments
        urlObj.searchParams.sort(); // Normalize query params
        return urlObj.toString();
      } catch {
        return url;
      }
    });

    const uniqueUrls = Array.from(new Set(normalizedUrls));
    return uniqueUrls;
  };

  const checkRobotsTxt = async (url: string): Promise<boolean> => {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      // Check if same origin to avoid CORS
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const isSameOrigin = urlObj.origin === currentOrigin;

      if (!isSameOrigin) {
        // Can't check robots.txt for cross-origin - assume allowed
        return true;
      }

      const response = await fetch(robotsUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) return true; // Assume allowed if robots.txt not found

      const robotsText = await response.text();
      const sitemapUrl = urlObj.pathname + urlObj.search;
      
      // Simple robots.txt parsing
      const lines = robotsText.split('\n');
      let inUserAgent = false;
      let isAllowed = true;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('User-agent:')) {
          const ua = trimmed.substring(11).trim();
          inUserAgent = ua === '*' || ua.includes('Googlebot');
        } else if (trimmed.startsWith('Disallow:') && inUserAgent) {
          const disallowPath = trimmed.substring(9).trim();
          if (disallowPath && sitemapUrl.startsWith(disallowPath)) {
            isAllowed = false;
          }
        } else if (trimmed.startsWith('Allow:') && inUserAgent) {
          const allowPath = trimmed.substring(6).trim();
          if (allowPath && sitemapUrl.startsWith(allowPath)) {
            isAllowed = true;
          }
        } else if (trimmed.startsWith('User-agent:') && !trimmed.substring(11).trim().includes('*')) {
          inUserAgent = false; // Reset for specific user agents
        }
      }

      return isAllowed;
    } catch {
      return true; // Assume allowed if can't check (likely CORS)
    }
  };

  const detectSoft404 = (html: string, statusCode: number): boolean => {
    if (statusCode !== 200) return false;

    const soft404Indicators = [
      /page not found/i,
      /404/i,
      /not found/i,
      /error 404/i,
      /page doesn't exist/i,
      /nothing found/i,
      /no results found/i,
    ];

    return soft404Indicators.some(pattern => pattern.test(html));
  };

  const checkCanonical = (html: string): string | undefined => {
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    return canonicalMatch ? canonicalMatch[1] : undefined;
  };

  const checkNoindex = (html: string): boolean => {
    return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
           /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
  };

  const crawlUrl = async (
    url: string,
    maxRedirects: number = 10,
    timeout: number = 10000
  ): Promise<UrlResult> => {
    const startTime = performance.now();
    const redirectChain: string[] = [url];
    let currentUrl = url;
    let statusCode = 0;
    let statusText = '';
    let finalUrl = url;
    let ttfb = 0;
    let html = '';
    let error: string | undefined;
    let isCorsBlocked = false;

    try {
      // Check if URL is from same origin (to avoid CORS issues)
      let urlObj: URL;
      try {
        urlObj = new URL(url);
      } catch {
        error = 'Invalid URL format';
        return createUrlResult(url, 0, '', redirectChain, url, 0, 0, false, false, undefined, false, error);
      }

      // Always try to fetch - let browser handle CORS
      // Don't pre-emptively block - some servers allow CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      let redirectCount = 0;

      // Try to fetch - browser will block if CORS doesn't allow
      while (redirectCount < maxRedirects) {
        try {
          const corsResponse = await fetch(currentUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            redirect: 'manual',
            signal: controller.signal,
            credentials: 'omit', // Don't send cookies
          });

          const ttfbTime = performance.now() - startTime;
          if (ttfb === 0) ttfb = ttfbTime;

          statusCode = corsResponse.status;
          statusText = corsResponse.statusText;

          // Handle redirects
          if ([301, 302, 307, 308].includes(statusCode)) {
            const location = corsResponse.headers.get('Location');
            if (location) {
              redirectChain.push(location);
              try {
                const redirectUrl = new URL(location, currentUrl);
                currentUrl = redirectUrl.toString();
              } catch {
                currentUrl = new URL(location, currentUrl).toString();
              }
              redirectCount++;
              continue;
            }
          }

          // Get response body for 200 status
          if (statusCode === 200) {
            html = await corsResponse.text();
          }

          finalUrl = currentUrl;
          break;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            error = 'Request timeout';
            break;
          }
          // CORS errors are TypeError with "Failed to fetch" or network errors
          // Also check for NetworkError which Firefox uses
          const isCorsError = err.name === 'TypeError' && (
            err.message.includes('Failed to fetch') || 
            err.message.includes('CORS') || 
            err.message.includes('network') ||
            err.message.includes('Load failed') ||
            err.message.includes('NetworkError') ||
            err.message.includes('Network request failed')
          ) || err.name === 'NetworkError';

          if (isCorsError) {
            isCorsBlocked = true;
            error = 'CORS blocked - browser security prevents cross-origin requests';
            statusCode = 0;
            break;
          }
          error = err.message || 'Connection error';
          break;
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (redirectCount >= maxRedirects) {
        error = 'Excessive redirect depth';
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && (err.message.includes('Failed to fetch') || err.message.includes('CORS'))) {
        isCorsBlocked = true;
        error = 'CORS blocked - cannot access cross-origin URL';
      } else {
        error = err.message || 'Connection error';
      }
    }

    const responseTime = performance.now() - startTime;

    // Additional checks - only if we got HTML content and not CORS blocked
    let isBlocked = false;
    let hasNoindex = false;
    let canonicalUrl: string | undefined;
    let isSoft404 = false;

    // Only perform additional checks if we successfully fetched the page
    if (!isCorsBlocked && html && statusCode === 200) {
      try {
        // checkRobotsTxt returns true if allowed (not blocked), false if blocked
        const isAllowed = await checkRobotsTxt(url);
        isBlocked = !isAllowed; // Invert: if not allowed, then it's blocked
        hasNoindex = checkNoindex(html);
        canonicalUrl = checkCanonical(html);
        isSoft404 = detectSoft404(html, statusCode);
      } catch (checkError) {
        // If we can't check (e.g., CORS on robots.txt), assume not blocked
        isBlocked = false;
      }
    }
    // For CORS-blocked URLs or non-200 responses, we can't check robots.txt
    // So we assume not blocked (can't determine)

    return {
      url,
      originalUrl: url,
      statusCode: isCorsBlocked ? 0 : statusCode,
      statusText: isCorsBlocked ? 'CORS Blocked' : statusText,
      redirectChain,
      finalUrl,
      responseTime,
      ttfb,
      isBlocked,
      hasNoindex,
      canonicalUrl,
      isSoft404,
      error,
    };
  };

  const createUrlResult = (
    url: string,
    statusCode: number,
    statusText: string,
    redirectChain: string[],
    finalUrl: string,
    responseTime: number,
    ttfb: number,
    isBlocked: boolean,
    hasNoindex: boolean,
    canonicalUrl: string | undefined,
    isSoft404: boolean,
    error?: string
  ): UrlResult => {
    return {
      url,
      originalUrl: url,
      statusCode,
      statusText,
      redirectChain,
      finalUrl,
      responseTime,
      ttfb,
      isBlocked,
      hasNoindex,
      canonicalUrl,
      isSoft404,
      error,
    };
  };

  const analyzeSitemap = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setAnalysis(null);

    try {
      let xmlText = '';

      // Get XML content based on input method
      if (inputMethod === 'url') {
        if (!sitemapUrl.trim()) {
          throw new Error('Please enter a sitemap URL');
        }
        
        // Normalize URL - add https:// if no protocol
        let normalizedUrl = sitemapUrl.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        
        try {
          const response = await fetch(normalizedUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/xml, text/xml, */*',
            },
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
          }
          xmlText = await response.text();
        } catch (err: any) {
          // If CORS blocks, provide helpful error
          if (err.name === 'TypeError' && (err.message.includes('Failed to fetch') || err.message.includes('CORS') || err.message.includes('network'))) {
            throw new Error(`CORS blocked: Cannot fetch sitemap from ${normalizedUrl}. Browser security prevents cross-origin requests. Solution: Use this tool on the same domain (e.g., test fyntools.com sitemap on fyntools.com), or paste the XML content directly.`);
          }
          throw err;
        }
      } else if (inputMethod === 'paste') {
        if (!xmlContent.trim()) {
          throw new Error('Please paste sitemap XML content');
        }
        xmlText = xmlContent;
      } else if (inputMethod === 'upload' && uploadedFile) {
        xmlText = xmlContent;
      } else {
        throw new Error('Please provide sitemap content');
      }

      // Parse sitemap
      setProgress(10);
      const urls = await parseSitemap(xmlText, sitemapUrl || undefined);
      
      if (urls.length === 0) {
        throw new Error('No URLs found in sitemap');
      }

      if (urls.length > 50000) {
        toast({
          title: 'Warning',
          description: `Sitemap contains ${urls.length} URLs. Only the first 50,000 will be analyzed.`,
          variant: 'default',
        });
      }

      const urlsToAnalyze = urls.slice(0, 50000);
      const results: UrlResult[] = [];
      const concurrency = 5; // Limit concurrent requests
      let processed = 0;

      // Crawl URLs with concurrency control
      for (let i = 0; i < urlsToAnalyze.length; i += concurrency) {
        const batch = urlsToAnalyze.slice(i, i + concurrency);
        const batchResults = await Promise.all(
          batch.map(url => crawlUrl(url))
        );
        results.push(...batchResults);
        processed += batch.length;
        setProgress(20 + (processed / urlsToAnalyze.length) * 70);
      }

      // Calculate statistics
      const uniqueFinalUrls = new Set(results.map(r => r.finalUrl));
      const corsBlockedUrls = results.filter(r => r.error?.includes('CORS')).length;
      const validUrls = results.filter(r => r.statusCode === 200 && !r.isSoft404 && !r.error?.includes('CORS')).length;
      const redirectedUrls = results.filter(r => [301, 302, 307, 308].includes(r.statusCode)).length;
      const brokenUrls = results.filter(r => (r.statusCode >= 400 || (r.error && !r.error.includes('CORS')))).length;
      const blockedUrls = results.filter(r => r.isBlocked).length;
      const responseTimes = results.filter(r => r.statusCode === 200 && !r.error?.includes('CORS')).map(r => r.responseTime);
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;
      const slowPages = results.filter(r => r.statusCode === 200 && r.responseTime > 3000 && !r.error?.includes('CORS')).length;

      // Calculate health score
      const healthScore = calculateHealthScore(results, urlsToAnalyze.length);

      setProgress(100);
      setAnalysis({
        totalUrls: urlsToAnalyze.length,
        uniqueUrls: uniqueFinalUrls.size,
        validUrls,
        redirectedUrls,
        brokenUrls,
        blockedUrls,
        corsBlockedUrls,
        averageResponseTime,
        slowPages,
        healthScore,
        results,
      });

      toast({
        title: 'Analysis complete',
        description: `Analyzed ${urlsToAnalyze.length} URLs. Health score: ${healthScore}/100`,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
      toast({
        title: 'Analysis failed',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateHealthScore = (results: UrlResult[], totalUrls: number): number => {
    if (totalUrls === 0) return 0;

    let score = 100;

    // Deduct for broken URLs (404, 5xx)
    const brokenCount = results.filter(r => r.statusCode >= 400 || r.error).length;
    score -= (brokenCount / totalUrls) * 40;

    // Deduct for redirects (less severe)
    const redirectCount = results.filter(r => [301, 302, 307, 308].includes(r.statusCode)).length;
    score -= (redirectCount / totalUrls) * 20;

    // Deduct for blocked URLs
    const blockedCount = results.filter(r => r.isBlocked).length;
    score -= (blockedCount / totalUrls) * 20;

    // Deduct for noindex in sitemap
    const noindexCount = results.filter(r => r.hasNoindex).length;
    score -= (noindexCount / totalUrls) * 10;

    // Deduct for soft 404s
    const soft404Count = results.filter(r => r.isSoft404).length;
    score -= (soft404Count / totalUrls) * 10;

    return Math.max(0, Math.round(score));
  };

  const getStatusBadge = (result: UrlResult) => {
    if (result.error) {
      if (result.error.includes('CORS')) {
        return <Badge variant="secondary" className="bg-yellow-500">CORS Blocked</Badge>;
      }
      return <Badge variant="destructive">Error</Badge>;
    }
    if (result.statusCode === 0 && result.error?.includes('CORS')) {
      return <Badge variant="secondary" className="bg-yellow-500">CORS Blocked</Badge>;
    }
    if (result.statusCode === 200) {
      if (result.isSoft404) {
        return <Badge variant="secondary">Soft 404</Badge>;
      }
      if (result.hasNoindex) {
        return <Badge variant="secondary">Noindex</Badge>;
      }
      return <Badge className="bg-green-500">200 OK</Badge>;
    }
    if ([301, 302, 307, 308].includes(result.statusCode)) {
      return <Badge variant="default">{result.statusCode} Redirect</Badge>;
    }
    if (result.statusCode === 404) {
      return <Badge variant="destructive">404 Not Found</Badge>;
    }
    if (result.statusCode >= 500) {
      return <Badge variant="destructive">{result.statusCode} Server Error</Badge>;
    }
    if (result.statusCode === 0) {
      return <Badge variant="secondary">Unknown</Badge>;
    }
    return <Badge variant="secondary">{result.statusCode}</Badge>;
  };

  const filteredResults = analysis?.results.filter(result => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'valid' && result.statusCode !== 200) return false;
      if (filterStatus === 'redirect' && ![301, 302, 307, 308].includes(result.statusCode)) return false;
      if (filterStatus === 'broken' && result.statusCode < 400 && !result.error) return false;
      if (filterStatus === 'blocked' && !result.isBlocked) return false;
    }
    if (searchQuery) {
      return result.url.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }) || [];

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'status') {
      return a.statusCode - b.statusCode;
    }
    if (sortBy === 'speed') {
      return b.responseTime - a.responseTime;
    }
    if (sortBy === 'url') {
      return a.url.localeCompare(b.url);
    }
    return 0;
  });

  const exportResults = (format: 'csv' | 'json') => {
    if (!analysis) return;

    const data = sortedResults.map(result => ({
      URL: result.url,
      'Status Code': result.statusCode,
      'Final URL': result.finalUrl,
      'Response Time (ms)': Math.round(result.responseTime),
      'TTFB (ms)': Math.round(result.ttfb),
      'Redirect Chain': result.redirectChain.join(' → '),
      'Blocked': result.isBlocked ? 'Yes' : 'No',
      'Noindex': result.hasNoindex ? 'Yes' : 'No',
      'Canonical': result.canonicalUrl || '',
      'Soft 404': result.isSoft404 ? 'Yes' : 'No',
      'Error': result.error || '',
    }));

    if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap-analysis.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${String(row[h as keyof typeof row] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap-analysis.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: 'Export successful',
      description: `Results exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>XML Sitemap Tester & Validator</CardTitle>
          <CardDescription>
            Upload, paste, or enter a sitemap URL to analyze and validate your sitemap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">
                <Link className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="paste">
                <FileText className="h-4 w-4 mr-2" />
                Paste XML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sitemap-url">Sitemap URL</Label>
                <Input
                  id="sitemap-url"
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload XML File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                {uploadedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xml-content">Paste Sitemap XML</Label>
                <Textarea
                  id="xml-content"
                  placeholder="Paste your sitemap XML content here..."
                  value={xmlContent}
                  onChange={(e) => setXmlContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Browser CORS Limitation:</strong> Due to browser security (CORS policy), this tool can only fully 
              crawl URLs from the <strong>exact same origin</strong> (same protocol, domain, and port). 
              <strong>Testing from localhost:</strong> If you're on localhost:8080, URLs from fyntools.com will be CORS blocked. 
              <strong>Solution:</strong> For full analysis of fyntools.com sitemap, use this tool on 
              <strong> https://fyntools.com/xml-sitemap-tester</strong>. The tool will still parse and validate XML structure 
              for any sitemap, but URL crawling requires same-origin access.
            </AlertDescription>
          </Alert>

          <Button
            onClick={analyzeSitemap}
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Analyze Sitemap
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dashboard */}
      {analysis && (
        <>
          {analysis.corsBlockedUrls > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{analysis.corsBlockedUrls} URLs are CORS blocked</strong> - These URLs are from a different 
                domain and cannot be tested due to browser security restrictions. Only {analysis.totalUrls - analysis.corsBlockedUrls} 
                URLs were successfully analyzed. For full analysis, test sitemaps from the same domain.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.totalUrls.toLocaleString()}</div>
                {analysis.corsBlockedUrls > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.corsBlockedUrls} CORS blocked
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valid URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analysis.validUrls.toLocaleString()}</div>
                {analysis.totalUrls - analysis.corsBlockedUrls > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {((analysis.validUrls / (analysis.totalUrls - analysis.corsBlockedUrls)) * 100).toFixed(1)}% of testable
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.healthScore}/100</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {analysis.totalUrls - analysis.corsBlockedUrls} testable URLs
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analysis.averageResponseTime)}ms</div>
                {analysis.validUrls > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.slowPages} slow pages
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report */}
          {showReport && analysis && <SitemapReport analysis={analysis} />}

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>URL Analysis Results</CardTitle>
                  <CardDescription>
                    {filteredResults.length} of {analysis.results.length} URLs shown
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportResults('csv')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportResults('json')}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    variant={showReport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowReport(!showReport)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {showReport ? 'Hide' : 'Show'} Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search URLs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="valid">Valid (200)</option>
                    <option value="redirect">Redirects</option>
                    <option value="broken">Broken (4xx/5xx)</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="status">Sort by Status</option>
                    <option value="speed">Sort by Speed</option>
                    <option value="url">Sort by URL</option>
                  </select>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">URL</th>
                        <th className="px-4 py-2 text-left">Response Time</th>
                        <th className="px-4 py-2 text-left">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((result, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            {getStatusBadge(result)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="max-w-md truncate" title={result.url}>
                              {result.url}
                            </div>
                            {result.redirectChain.length > 1 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                → {result.finalUrl}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {Math.round(result.responseTime)}ms
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {result.error && result.error.includes('CORS') ? (
                                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                  CORS Blocked
                                </Badge>
                              ) : (
                                <>
                                  {result.isBlocked && (
                                    <Badge variant="secondary" className="text-xs">Blocked by robots.txt</Badge>
                                  )}
                                  {result.hasNoindex && (
                                    <Badge variant="secondary" className="text-xs">Noindex</Badge>
                                  )}
                                  {result.isSoft404 && (
                                    <Badge variant="secondary" className="text-xs">Soft 404</Badge>
                                  )}
                                  {result.error && !result.error.includes('CORS') && (
                                    <Badge variant="destructive" className="text-xs">{result.error}</Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default XmlSitemapTester;
