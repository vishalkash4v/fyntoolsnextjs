'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Smartphone, Globe, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const decodeBase64 = (str: string): string => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return decodeURIComponent(atob(padded));
  } catch {
    return decodeURIComponent(str);
  }
};

const ALLOWED_WEB_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'instagram.com',
  'www.instagram.com',
  'facebook.com',
  'www.facebook.com',
  'x.com',
  'twitter.com',
  'www.twitter.com',
  'wa.me',
  't.me',
  'telegram.org',
  'linkedin.com',
  'www.linkedin.com',
  'fyntools.com',
  'www.fyntools.com',
];

function isValidWebUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    if (!url.startsWith('http')) return false;
    return ALLOWED_WEB_HOSTS.some(
      (host) => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host)
    );
  } catch {
    return false;
  }
}

export default function DeepLinkRedirectClient() {
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appUrl = searchParams.get('a');
  const webUrl = searchParams.get('w');
  const platform = searchParams.get('p') || 'App';
  const title = searchParams.get('t') || `Open ${platform} Content`;

  useEffect(() => {
    if (!appUrl || !webUrl) {
      setError('Invalid deep link parameters. Missing app or web URL.');
      setRedirecting(false);
      return;
    }

    let decodedAppUrl: string;
    let decodedWebUrl: string;

    try {
      decodedAppUrl = decodeBase64(appUrl);
      decodedWebUrl = decodeBase64(webUrl);
    } catch {
      setError('Invalid URL encoding. Please regenerate the link.');
      setRedirecting(false);
      return;
    }

    if (!isValidWebUrl(decodedWebUrl)) {
      setError('Invalid web URL. Security validation failed.');
      setRedirecting(false);
      return;
    }

    if (!decodedAppUrl.match(/^[a-z][a-z0-9+.-]*:/i)) {
      setError('Invalid app deep link format.');
      setRedirecting(false);
      return;
    }

    let appOpened = false;
    let fallbackExecuted = false;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const startTime = Date.now();

    const fallbackToWeb = () => {
      if (!fallbackExecuted) {
        fallbackExecuted = true;
        setRedirecting(false);
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
          fallbackTimeout = null;
        }
        window.location.href = decodedWebUrl;
      }
    };

    const cancelFallback = () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
      setRedirecting(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && appOpened) cancelFallback();
    };

    const handleBlur = () => {
      if (appOpened) cancelFallback();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !document.hidden) {
        const elapsed = Date.now() - startTime;
        if (elapsed > 300) fallbackToWeb();
      }
    };

    const openApp = () => {
      try {
        appOpened = true;
        if (isIOS) {
          const anchor = document.createElement('a');
          anchor.href = decodedAppUrl;
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.dispatchEvent(
            new MouseEvent('click', { view: window, bubbles: true, cancelable: true })
          );
          setTimeout(() => {
            try {
              const opened = window.open(decodedAppUrl, '_blank');
              opened?.close();
            } catch {
              /* ignore */
            }
          }, 100);
          setTimeout(() => {
            if (anchor.parentNode) document.body.removeChild(anchor);
          }, 2000);
        } else {
          window.location.href = decodedAppUrl;
        }
      } catch (e) {
        console.error('Error opening app:', e);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handlePageShow as EventListener);

    openApp();

    const timeoutDuration = isIOS ? 500 : 800;
    fallbackTimeout = setTimeout(() => {
      const isStillVisible = !document.hidden;
      const hasFocus = document.hasFocus();
      if (isStillVisible && hasFocus) {
        fallbackToWeb();
      } else if (!isStillVisible) {
        cancelFallback();
      } else {
        setTimeout(() => {
          if (!document.hidden && document.hasFocus()) fallbackToWeb();
          else cancelFallback();
        }, 200);
      }
    }, timeoutDuration);

    return () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handlePageShow as EventListener);
    };
  }, [appUrl, webUrl]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Error</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {redirecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Opening in {platform}...</span>
              </>
            ) : (
              <>
                <Globe className="h-5 w-5 text-primary" />
                <span>Redirecting to Web...</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {redirecting
              ? 'Attempting to open in app. If the app is not installed, you will be redirected to the web version.'
              : 'Opening in web browser...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>App Deep Link</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Web Fallback</span>
            </div>
          </div>
          {webUrl && !redirecting && (
            <Button
              onClick={() => {
                try {
                  window.location.href = decodeBase64(webUrl);
                } catch (e) {
                  console.error('Error redirecting:', e);
                }
              }}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Browser
            </Button>
          )}
          <p className="text-xs text-center text-muted-foreground mt-4">
            Link made by{' '}
            <a
              href="https://fyntools.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              fyntools.com
            </a>
          </p>
          <p className="sr-only">{title}</p>
        </CardContent>
      </Card>
    </div>
  );
}
