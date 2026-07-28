'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hourglass } from 'lucide-react';

export default function RedirectHelperClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appUrl = searchParams.get('a');
  const webUrl = searchParams.get('w');

  useEffect(() => {
    if (!appUrl || !webUrl) {
      router.replace('/');
      return;
    }

    window.location.href = appUrl;

    const fallbackTimeout = setTimeout(() => {
      window.location.href = webUrl;
    }, 2500);

    const handleVisibilityChange = () => {
      if (document.hidden) clearTimeout(fallbackTimeout);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(fallbackTimeout);
    };
  }, [appUrl, webUrl, router]);

  if (!webUrl) return null;

  return (
    <div className="container py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
            <Hourglass className="h-8 w-8" />
          </div>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>
            We&apos;re attempting to open the content in its native app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If the app doesn&apos;t open automatically, you&apos;ll be redirected to the web version.
          </p>
          <Button asChild variant="outline">
            <a href={webUrl}>Click here if you are not redirected</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
