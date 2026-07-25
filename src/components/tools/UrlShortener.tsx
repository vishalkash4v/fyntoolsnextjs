'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link as LinkIcon, ExternalLink, QrCode, Trash2, History, Loader2, Clock, Download, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import CopyButton from '@/components/common/CopyButton';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'https://express-two-umber.vercel.app/api/shorturl';

interface ShortUrlData {
  originalUrl: string;
  shortCode: string;
  createdAt: number | string;
  clickCount: number;
  expiresAt?: string | null;
  favicon?: string;
}

const STORAGE_KEY = 'fyntools_short_urls';

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlHistory, setUrlHistory] = useState<ShortUrlData[]>([]);
  const [currentFavicon, setCurrentFavicon] = useState<string>('');
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ original: string; short?: string; error?: string }[]>([]);
  
  // QR Code dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrUrl, setSelectedQrUrl] = useState<string>('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Expiration settings
  const [expirationType, setExpirationType] = useState<'none' | 'preset' | 'custom'>('none');
  const [expirationPreset, setExpirationPreset] = useState<string>('1-hour');
  const [customExpirationDate, setCustomExpirationDate] = useState<string>('');
  const [customExpirationTime, setCustomExpirationTime] = useState<string>('');

  // UTM tracking
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  // Load history on mount
  useEffect(() => {
    loadHistory();
    // Load logo as base64 for QR code download
    loadLogoAsBase64();
  }, []);

  // Load logo as base64 for embedding in QR code download
  const loadLogoAsBase64 = async () => {
    try {
      const response = await fetch('/logobeta-64.webp');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to load logo:', error);
      // Fallback: try PNG version
      try {
        const response = await fetch('/logobeta.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to load logo fallback:', err);
      }
    }
  };

  // Fetch favicon for a URL
  const getFavicon = async (url: string): Promise<string> => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname;
      // Use Google's favicon service for reliable results
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (error) {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
    }
  };

  const loadHistory = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ShortUrlData[] = JSON.parse(stored);
        // Only enrich with favicons; keep existing click counts to avoid many network calls
        const dataWithFavicons = await Promise.all(
          data.map(async (item) => {
            const next = { ...item };
            try {
              if (!next.favicon) {
                next.favicon = await getFavicon(next.originalUrl);
              }
            } catch (err) {
              console.error('Failed to load favicon for', next.shortCode, err);
            }
            return next;
          })
        );
        setUrlHistory(dataWithFavicons);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithFavicons));
      }
    } catch (error) {
      console.error('Failed to load URL history:', error);
    }
  };

  const saveToHistory = (data: ShortUrlData) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [data, ...existing.filter((item: ShortUrlData) => item.shortCode !== data.shortCode)];
      // Keep only last 50 URLs
      const limited = updated.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setUrlHistory(limited);
    } catch (error) {
      console.error('Failed to save URL history:', error);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim().length === 0) return false;
    
    // Add protocol if missing (but don't add www - preserve URL exactly as entered)
    let urlToCheck = url.trim();
    if (!urlToCheck.match(/^https?:\/\//i)) {
      urlToCheck = 'https://' + urlToCheck;
    }

    try {
      const urlObj = new URL(urlToCheck);
      // Check for valid domain
      return urlObj.hostname.length > 0 && 
             urlObj.hostname.includes('.') && 
             !urlObj.hostname.startsWith('.') &&
             !urlObj.hostname.endsWith('.');
    } catch {
      return false;
    }
  };

  const isAliasValid = (alias: string): boolean => {
    if (!alias) return true; // Optional field
    // Allow alphanumeric, hyphens, and underscores, 3-20 characters
    return /^[a-zA-Z0-9_-]{3,20}$/.test(alias);
  };

  // Retry utility function with exponential backoff
  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<Response> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        // Server error (5xx), retry
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return response;
      } catch (error) {
        lastError = error as Error;
        // Network error, retry
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw lastError;
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  };

  const checkAliasAvailability = async (alias: string): Promise<boolean> => {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/check/${alias}`);
      const data = await response.json();
      return data.success && data.available === true;
    } catch (error) {
      console.error('Error checking alias:', error);
      return false;
    }
  };

  const calculateExpirationDate = (): string | null => {
    if (expirationType === 'none') {
      return null;
    }
    
    if (expirationType === 'preset') {
      const now = new Date();
      let expirationDate = new Date();
      
      switch (expirationPreset) {
        case '1-minute':
          expirationDate = new Date(now.getTime() + 60 * 1000);
          break;
        case '5-minutes':
          expirationDate = new Date(now.getTime() + 5 * 60 * 1000);
          break;
        case '15-minutes':
          expirationDate = new Date(now.getTime() + 15 * 60 * 1000);
          break;
        case '30-minutes':
          expirationDate = new Date(now.getTime() + 30 * 60 * 1000);
          break;
        case '1-hour':
          expirationDate = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '6-hours':
          expirationDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
          break;
        case '12-hours':
          expirationDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
          break;
        case '1-day':
          expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '1-week':
          expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '1-month':
          expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case '3-months':
          expirationDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          break;
        case '6-months':
          expirationDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
          break;
        case '1-year':
          expirationDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          return null;
      }
      
      return expirationDate.toISOString();
    }
    
    if (expirationType === 'custom') {
      if (!customExpirationDate) {
        return null;
      }
      
      // Combine date and time
      let dateTimeString = customExpirationDate;
      if (customExpirationTime) {
        dateTimeString += `T${customExpirationTime}`;
      } else {
        dateTimeString += 'T23:59:59'; // Default to end of day
      }
      
      const expirationDate = new Date(dateTimeString);
      if (isNaN(expirationDate.getTime())) {
        return null;
      }
      
      return expirationDate.toISOString();
    }
    
    return null;
  };

  const buildUrlWithUtm = (url: string): string => {
    let urlToUse = url.trim();
    if (!urlToUse.match(/^https?:\/\//i)) {
      urlToUse = 'https://' + urlToUse;
    }
    try {
      const u = new URL(urlToUse);
      if (utmEnabled) {
        if (utmSource.trim()) u.searchParams.set('utm_source', utmSource.trim());
        if (utmMedium.trim()) u.searchParams.set('utm_medium', utmMedium.trim());
        if (utmCampaign.trim()) u.searchParams.set('utm_campaign', utmCampaign.trim());
        if (utmTerm.trim()) u.searchParams.set('utm_term', utmTerm.trim());
        if (utmContent.trim()) u.searchParams.set('utm_content', utmContent.trim());
      }
      return u.toString();
    } catch {
      return url;
    }
  };

  const generateShortUrl = async () => {
    // Prevent double-clicking / multiple simultaneous requests
    if (isLoading) {
      return;
    }

    if (!originalUrl || originalUrl.trim().length === 0) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast.error("Please enter a valid URL (e.g., example.com or https://example.com)");
      return;
    }

    // Validate custom alias if provided
    if (customAlias && !isAliasValid(customAlias)) {
      toast.error("Custom alias must be 3-20 characters and contain only letters, numbers, hyphens, and underscores");
      return;
    }

    // Set loading state immediately to prevent double-clicks
    setIsLoading(true);

    try {
      // Check if custom alias is available (do this inside try so we can catch errors)
      if (customAlias) {
        const isAvailable = await checkAliasAvailability(customAlias);
        if (!isAvailable) {
          toast.error("This custom alias is already taken. Please choose another one.");
          setIsLoading(false);
          return;
        }
      }

      // Calculate expiration date
      const expiresAt = calculateExpirationDate();
      if (expirationType === 'custom' && !expiresAt) {
        toast.error("Please enter a valid expiration date and time.");
        setIsLoading(false);
        return;
      }
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        toast.error("Expiration date must be in the future.");
        setIsLoading(false);
        return;
      }

      const finalOriginalUrl = utmEnabled ? buildUrlWithUtm(originalUrl) : originalUrl;

      const response = await fetchWithRetry(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: finalOriginalUrl,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt || undefined,
          password: passwordEnabled && password ? password : undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 403) {
          throw new Error(
            data.error ||
              'You are blocked because you violated our terms and conditions. Short link creation is not available from your network.'
          );
        }
        if (response.status === 429) {
          throw new Error(data.error || 'Too many links created. Please try again later.');
        }
        throw new Error(data.error || 'Failed to create short URL');
      }

      // Use the short URL from backend (but format it for frontend domain)
      const backendShortUrl = data.data.shortUrl;
      // Extract the short code
      const shortCode = data.data.shortCode;
      // Create frontend URL with short code (ensure protocol is included)
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
      const frontendShortUrl = `${origin}/s/${shortCode}`;

      // Fetch favicon for the original URL
      const favicon = await getFavicon(data.data.originalUrl);
      setCurrentFavicon(favicon);
      
      const urlData: ShortUrlData = {
        originalUrl: data.data.originalUrl,
        shortCode: shortCode,
        createdAt: new Date(data.data.createdAt).getTime(),
        clickCount: data.data.clickCount,
        expiresAt: data.data.expiresAt || null,
        favicon: favicon
      };

      saveToHistory(urlData);
      setShortUrl(frontendShortUrl);
      toast.success("Short URL generated successfully!");

      // Reset form fields
      setOriginalUrl('');
      setCustomAlias('');
      setExpirationType('none');
      setExpirationPreset('1-hour');
      setCustomExpirationDate('');
      setCustomExpirationTime('');
      setPasswordEnabled(false);
      setPassword('');

    } catch (error: any) {
      console.error('Error creating short URL:', error);
      toast.error(error.message || "Failed to create short URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openUrl = () => {
    if (shortUrl) {
      window.open(shortUrl, '_blank');
    }
  };

  const createShortUrlForBulk = async (url: string): Promise<{ shortUrl?: string; error?: string }> => {
    const trimmed = url.trim();
    if (!trimmed) {
      return { error: 'Empty line skipped' };
    }
    if (!isValidUrl(trimmed)) {
      return { error: 'Invalid URL' };
    }

    try {
      const expiresAt = calculateExpirationDate();
      if (expirationType === 'custom' && !expiresAt) {
        return { error: 'Invalid custom expiration' };
      }
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        return { error: 'Expiration must be in the future' };
      }

      const finalOriginalUrl = utmEnabled ? buildUrlWithUtm(trimmed) : trimmed;

      const response = await fetchWithRetry(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: finalOriginalUrl,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 403) {
          return {
            error:
              data.error ||
              'You are blocked because you violated our terms and conditions. Short link creation is not available from your network.',
          };
        }
        if (response.status === 400 && data.error) {
          return { error: data.error };
        }
        if (response.status === 429) {
          return { error: data.error || 'Too many links created. Please try again later.' };
        }
        return { error: data.error || 'Failed' };
      }

      const shortCode = data.data.shortCode;
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
      const frontendShortUrl = `${origin}/s/${shortCode}`;

      const favicon = await getFavicon(data.data.originalUrl);
      const urlData: ShortUrlData = {
        originalUrl: data.data.originalUrl,
        shortCode,
        createdAt: new Date(data.data.createdAt).getTime(),
        clickCount: data.data.clickCount,
        expiresAt: data.data.expiresAt || null,
        favicon,
      };
      saveToHistory(urlData);

      return { shortUrl: frontendShortUrl };
    } catch (err: any) {
      console.error('Bulk create error:', err);
      return { error: err && err.message ? String(err.message) : 'Unknown error from server' };
    }
  };

  const bulkShorten = async () => {
    if (isBulkLoading) return;
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast.error('Paste at least one URL');
      return;
    }
    if (lines.length > 20) {
      toast.error('You can shorten up to 20 URLs at once (20 lines max).');
      return;
    }

    setIsBulkLoading(true);
    const results: { original: string; short?: string; error?: string }[] = [];
    for (const line of lines) {
      const res = await createShortUrlForBulk(line);
      results.push({ original: line, ...res });
    }
    setBulkResults(results);
    setIsBulkLoading(false);
    toast.success('Bulk shortening complete');
  };

  const deleteHistoryItem = (shortCode: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this URL from history?"
    );
    if (!confirmed) return;

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const updated = existing.filter(
        (item: ShortUrlData) => item.shortCode !== shortCode
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUrlHistory(updated);
      toast.success("URL deleted from history");
    } catch (error) {
      toast.error("Failed to delete URL");
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all URL history?")) {
      localStorage.removeItem(STORAGE_KEY);
      setUrlHistory([]);
      toast.success("History cleared");
    }
  };

  const exportHistoryCsv = () => {
    if (urlHistory.length === 0) {
      toast.error('No history to export');
      return;
    }
    try {
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
      const header = ['short_url', 'original_url', 'clicks', 'created_at', 'expires_at'];
      const rows = urlHistory.map((item) => {
        const short = `${origin}/s/${item.shortCode}`;
        const createdAt =
          typeof item.createdAt === 'string'
            ? new Date(item.createdAt).toISOString()
            : new Date(item.createdAt).toISOString();
        const expires = item.expiresAt ? new Date(item.expiresAt).toISOString() : '';
        const escape = (value: string) =>
          `"${(value || '').replace(/"/g, '""')}"`;
        return [
          escape(short),
          escape(item.originalUrl),
          String(item.clickCount ?? 0),
          escape(createdAt),
          escape(expires),
        ].join(',');
      });
      const csv = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fyn-url-shortener-history.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('History exported as CSV');
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to export CSV');
    }
  };

  // Open QR code dialog
  const openQrDialog = (url: string) => {
    // Ensure URL has protocol for mobile scanning
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }
    setSelectedQrUrl(fullUrl);
    setQrDialogOpen(true);
  };

  // Download QR code as PNG with logo embedded
  const downloadQrCode = async () => {
    if (!qrCodeRef.current || !selectedQrUrl) {
      toast.error('QR code not available');
      return;
    }
    
    try {
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) {
        toast.error('QR code not found');
        return;
      }

      // Clone SVG to modify it
      const svgClone = svg.cloneNode(true) as SVGElement;
      
      // Replace logo path with base64 if available
      if (logoBase64) {
        const imageElements = svgClone.querySelectorAll('image');
        imageElements.forEach((img) => {
          // Check both href and xlink:href attributes
          const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
          if (href && (href.includes('logobeta') || href.includes('logo'))) {
            img.setAttribute('href', logoBase64);
            img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoBase64);
          }
        });
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size (QR code is 256px + padding)
      canvas.width = 320;
      canvas.height = 320;
      
      // Convert SVG to data URL with base64 encoding to ensure logo is included
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

      img.onload = () => {
        if (ctx) {
          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw SVG image centered
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = `qrcode-${selectedQrUrl.replace(/[^a-z0-9]/gi, '-').substring(0, 50)}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
              toast.success('QR code downloaded successfully!');
            } else {
              toast.error('Failed to generate image');
            }
          }, 'image/png', 1.0);
        }
      };

      img.onerror = () => {
        toast.error('Failed to load QR code image');
      };

      img.src = svgDataUrl;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            URL Shortener
          </CardTitle>
          <CardDescription>
            Create short, shareable links for social media and messaging. URLs are stored in our database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="original-url">Original URL</Label>
            <Input
              id="original-url"
              placeholder="example.com or https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  generateShortUrl();
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can enter URLs with or without https://
            </p>
          </div>

          <div>
            <Label htmlFor="custom-alias">Custom Alias (optional)</Label>
            <Input
              id="custom-alias"
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  generateShortUrl();
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              3-20 characters, letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Password Protection */}
          <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="text-base font-semibold">Password Protection (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Require a password before visitors can open the short link.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  id="password-enabled"
                  type="checkbox"
                  checked={passwordEnabled}
                  onChange={(e) => setPasswordEnabled(e.target.checked)}
                  className="h-4 w-4 border rounded-sm"
                />
                <Label htmlFor="password-enabled" className="text-xs cursor-pointer">
                  Enable
                </Label>
              </div>
            </div>
            {passwordEnabled && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password for this short link"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this password only with people who should be able to open the link.
                </p>
              </div>
            )}
          </div>

          {/* UTM Tracking */}
          <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="text-base font-semibold">UTM Tracking (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Add campaign parameters (utm_source, utm_medium, utm_campaign, etc.) before shortening.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  id="utm-enabled"
                  type="checkbox"
                  checked={utmEnabled}
                  onChange={(e) => setUtmEnabled(e.target.checked)}
                  className="h-4 w-4 border rounded-sm"
                />
                <Label htmlFor="utm-enabled" className="text-xs cursor-pointer">
                  Enable
                </Label>
              </div>
            </div>
            {utmEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="utm-source">UTM Source</Label>
                  <Input
                    id="utm-source"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="e.g. facebook, newsletter"
                  />
                </div>
                <div>
                  <Label htmlFor="utm-medium">UTM Medium</Label>
                  <Input
                    id="utm-medium"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="e.g. social, email"
                  />
                </div>
                <div>
                  <Label htmlFor="utm-campaign">UTM Campaign</Label>
                  <Input
                    id="utm-campaign"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="e.g. summer_sale"
                  />
                </div>
                <div>
                  <Label htmlFor="utm-term">UTM Term (optional)</Label>
                  <Input
                    id="utm-term"
                    value={utmTerm}
                    onChange={(e) => setUtmTerm(e.target.value)}
                    placeholder="Keyword or ad group"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="utm-content">UTM Content (optional)</Label>
                  <Input
                    id="utm-content"
                    value={utmContent}
                    onChange={(e) => setUtmContent(e.target.value)}
                    placeholder="Button, banner, variation A/B"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Expiration Settings */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Expiration Settings</Label>
            </div>
            
            <div className="space-y-2">
              <Select value={expirationType} onValueChange={(value: 'none' | 'preset' | 'custom') => setExpirationType(value)}>
                <SelectTrigger aria-label="Select link expiration period">
                  <SelectValue placeholder="Select expiration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" aria-label="No expiration - URL will never expire">No Expiration</SelectItem>
                  <SelectItem value="preset">Preset Duration</SelectItem>
                  <SelectItem value="custom">Custom Date & Time</SelectItem>
                </SelectContent>
              </Select>

              {expirationType === 'preset' && (
                <Select value={expirationPreset} onValueChange={setExpirationPreset}>
                  <SelectTrigger aria-label="Select expiration duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-minute">1 Minute</SelectItem>
                    <SelectItem value="5-minutes">5 Minutes</SelectItem>
                    <SelectItem value="15-minutes">15 Minutes</SelectItem>
                    <SelectItem value="30-minutes">30 Minutes</SelectItem>
                    <SelectItem value="1-hour">1 Hour</SelectItem>
                    <SelectItem value="6-hours">6 Hours</SelectItem>
                    <SelectItem value="12-hours">12 Hours</SelectItem>
                    <SelectItem value="1-day">1 Day</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="1-year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {expirationType === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="custom-date">Expiration Date</Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={customExpirationDate}
                      onChange={(e) => setCustomExpirationDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-time">Expiration Time (optional)</Label>
                    <Input
                      id="custom-time"
                      type="time"
                      value={customExpirationTime}
                      onChange={(e) => setCustomExpirationTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={generateShortUrl} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Shorten URL"
            )}
          </Button>

          {shortUrl && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <Label>Short URL</Label>
              <div className="flex items-center gap-2 mb-2">
                {currentFavicon && (
                  <img 
                    src={currentFavicon} 
                    alt="Favicon" 
                    className="w-5 h-5 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <Input value={shortUrl} readOnly className="font-mono text-sm flex-1" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <CopyButton
                    textToCopy={shortUrl}
                    successMessage="Short URL copied to clipboard!"
                    variant="outline"
                    size="sm"
                  />
                  <Button variant="outline" size="sm" onClick={openUrl} title="Open">
                    <ExternalLink className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Open</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openQrDialog(shortUrl)} 
                    title="Show QR Code"
                  >
                    <QrCode className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">QR Code</span>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your short URL is ready to share!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk URL Shortener */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Bulk URL Shortener
          </CardTitle>
          <CardDescription>
            Paste up to 20 URLs (one per line) to shorten them in a single click. Uses the same expiration and optional UTM settings as above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bulk-urls">URLs (one per line)</Label>
            <Textarea
              id="bulk-urls"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={4}
              placeholder={`https://example.com/first-long-link\nhttps://example.com/second-long-link`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum 20 lines will be processed at once.
            </p>
          </div>
          <Button
            onClick={bulkShorten}
            className="w-full sm:w-auto"
            disabled={isBulkLoading}
          >
            {isBulkLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Shortening...
              </>
            ) : (
              'Shorten All'
            )}
          </Button>

          {bulkResults.length > 0 && (
            <div className="mt-3 border rounded-lg p-3 space-y-2 max-h-72 overflow-y-auto">
              {bulkResults.map((res, idx) => (
                <div key={`${res.original}-${idx}`} className="text-xs border-b last:border-b-0 pb-2 mb-2 last:pb-0 last:mb-0">
                  <div className="font-medium truncate">Original: <span className="font-normal">{res.original}</span></div>
                  {res.short ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">Short:</span>
                      <a
                        href={res.short}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-primary hover:underline truncate"
                      >
                        {res.short}
                      </a>
                      <CopyButton
                        textToCopy={res.short}
                        successMessage="Short URL copied!"
                        variant="ghost"
                        size="icon"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-red-600 dark:text-red-400">
                      {res.error
                        ? `Error: ${res.error}`
                        : 'Processed. Short URL may still be available in your history.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {urlHistory.length > 0 && (
        <Card>
          <CardHeader className="space-y-3">
            <div className="space-y-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <History className="h-5 w-5 flex-shrink-0" />
                <span className="break-words">URL History & Stats</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground break-words">
                Last {urlHistory.length} links on this device. Click count is returned by the API for each short URL.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistoryCsv}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-xs text-muted-foreground">
              <div>Total links: <span className="font-semibold">{urlHistory.length}</span></div>
              <div>
                Total clicks:{" "}
                <span className="font-semibold">
                  {urlHistory.reduce((sum, item) => sum + (item.clickCount || 0), 0)}
                </span>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {urlHistory.map((item) => {
                const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
                const historyShortUrl = `${origin}/s/${item.shortCode}`;
                const createdAt = typeof item.createdAt === 'string' 
                  ? new Date(item.createdAt).getTime() 
                  : item.createdAt;
                return (
                  <div
                    key={item.shortCode}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.favicon && (
                          <img 
                            src={item.favicon} 
                            alt="Favicon" 
                            className="w-4 h-4 rounded flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <a
                          href={historyShortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-primary hover:underline truncate"
                        >
                          {historyShortUrl}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.originalUrl}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <p>Created: {new Date(createdAt).toLocaleDateString()} • Clicks: {item.clickCount}</p>
                        {item.expiresAt && (
                          <p className="text-orange-600 dark:text-orange-400">
                            Expires: {new Date(item.expiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <CopyButton
                        textToCopy={historyShortUrl}
                        successMessage="Short URL copied to clipboard!"
                        variant="ghost"
                        size="sm"
                      />
                      <CopyButton
                        textToCopy={item.originalUrl}
                        successMessage="Original URL copied to clipboard!"
                        variant="ghost"
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(historyShortUrl, '_blank')}
                        title="Open short link"
                      >
                        <ExternalLink className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Open</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/s/${item.shortCode}/stats`)}
                        title="View analytics"
                      >
                        <BarChart2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Stats</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openQrDialog(historyShortUrl)}
                        title="Show QR Code"
                      >
                        <QrCode className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">QR</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryItem(item.shortCode)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Create short, memorable links from long URLs</li>
            <li>• Custom aliases for clean, branded links</li>
            <li>• Optional UTM tracking for campaigns (source, medium, campaign, etc.)</li>
            <li>• Bulk shortening: paste up to 20 URLs and shorten in one click</li>
            <li>• Flexible expiration: no expiry, presets, or custom date & time</li>
            <li>• Built-in QR codes with logo and image download</li>
            <li>• Local history with favicons and basic click counts</li>
            <li>• No registration or login required</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-violet-200/60 dark:border-violet-900/40 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Rules &amp; terms of use</CardTitle>
          <CardDescription>
            Using this shortener means you agree to the rules below. We enforce them to keep FYN Tools safe and trusted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="rules">
              <AccordionTrigger className="text-sm font-medium">
                Read full rules (spam, abuse, blocking)
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-1">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Do not use short links for phishing, malware, scams, illegal content, or harassment.</li>
                  <li>Do not chain other URL shorteners—paste the real destination URL only.</li>
                  <li>Do not automate bulk creation to evade limits or overload our systems.</li>
                  <li>We may deactivate links, mark them as spam, and block IPs that break these rules.</li>
                  <li>Blocked networks see: &quot;You are blocked because you violated our terms and conditions.&quot;</li>
                  <li>We log creation IP and basic click data for abuse prevention and statistics.</li>
                </ul>
                <p className="text-xs">
                  For questions or appeals, use the contact option on{' '}
                  <Link href="/contact" className="text-primary underline underline-offset-2">
                    our contact page
                  </Link>
                  .
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to open the URL
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div 
              ref={qrCodeRef}
              className="p-4 bg-white rounded-lg"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <QRCodeSVG
                value={selectedQrUrl}
                size={256}
                level="H"
                includeMargin={true}
                imageSettings={logoBase64 ? {
                  src: logoBase64,
                  height: 40,
                  width: 40,
                  excavate: true,
                } : {
                  src: '/logobeta-64.webp',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center break-all px-4">
              {selectedQrUrl}
            </p>
            <Button onClick={downloadQrCode} className="w-full" variant="default">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UrlShortener;
