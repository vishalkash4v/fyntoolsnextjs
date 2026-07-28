'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart2, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';

const API = `${API_BASE_URL}/shorturl`;

interface ClickEvent {
  createdAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
}

interface StatsResponse {
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
  expiresAt?: string | null;
  isActive: boolean;
  hasPassword?: boolean;
  recentClicks?: ClickEvent[];
}

export default function ShortUrlStatsClient({ code }: { code: string }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!code) {
        setError('Invalid short URL code');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/${code}/stats`, { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 404) setError('Short URL not found. It may have been deleted.');
          else if (res.status === 410) setError('Short URL has expired.');
          else setError('Analytics are temporarily unavailable for this link.');
          setIsLoading(false);
          return;
        }
        const json = await res.json();
        if (json?.success && json.data) setStats(json.data as StatsResponse);
        else setError('Invalid analytics response from server.');
      } catch {
        setError('Network error while loading analytics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [code]);

  const recent = stats?.recentClicks || [];
  const daily = useMemo(() => {
    const map = new Map<string, number>();
    recent.forEach((ev) => {
      const key = new Date(ev.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [recent]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Analytics Error
            </CardTitle>
            <CardDescription>{error || 'Unable to load analytics for this URL.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/url-shortener">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to URL Shortener
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxDaily = daily.reduce((m, [, c]) => Math.max(m, c), 0) || 1;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          Short URL Stats
        </h1>
        <Button variant="outline" asChild>
          <Link href="/url-shortener">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">/{stats.shortCode}</CardTitle>
          <CardDescription className="break-all">{stats.originalUrl}</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Clicks</p>
            <p className="text-2xl font-bold">{stats.clickCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(stats.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{stats.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </CardContent>
      </Card>

      {daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clicks by day (recent)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {daily.map(([day, count]) => (
              <div key={day} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-muted-foreground">{day}</span>
                <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(count / maxDaily) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
