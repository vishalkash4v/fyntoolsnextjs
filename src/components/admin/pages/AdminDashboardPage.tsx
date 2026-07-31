'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/seo/site';
import {
  Loader2,
  Eye,
  Activity,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  FileText,
  Heart,
  Wrench,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import { cachedFetch } from '@/utils/adminApi';



interface SimpleAnalytics {
  period: string;
  overview: { totalViews: number; totalUniqueViews: number; changePercent: number };
  topPages: Array<{
    pageType: string;
    pageId: string;
    pagePath: string;
    pageTitle: string;
    totalViews: number;
    totalUniqueViews: number;
  }>;
  dailyStats: Array<{ date: string; views: number; uniqueViews: number }>;
  positiveHighlights: Array<{ id: string; message: string; icon: string }>;
}

const PERIODS = [
  { key: '1d', label: 'Today' },
  { key: '7d', label: 'Weekly' },
  { key: '30d', label: 'Monthly' },
];

const HIGHLIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  'trending-up': TrendingUp,
  award: Award,
  fire: Flame,
  'file-text': FileText,
  heart: Heart,
  wrench: Wrench,
  sparkles: Sparkles,
};

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<SimpleAnalytics | null>(null);
  const [period, setPeriod] = useState('1d');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/fyntoolsadmin/login');
      return;
    }

    setLoading(true);
    try {
      const { data } = await cachedFetch<SimpleAnalytics>(
        `${API_BASE_URL}/analytics/dashboard-simple?period=${period}`,
        token
      );

      if (data) setAnalytics(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [period, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  if (loading && !analytics) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            Analytics overview
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.key)}
              style={
                period === p.key
                  ? {}
                  : { background: 'var(--admin-card)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }
              }
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Positive Highlights */}
      {analytics?.positiveHighlights && analytics.positiveHighlights.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(59, 130, 246, 0.08))',
            border: '1px solid var(--admin-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5" style={{ color: 'var(--admin-success)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
              Positive highlights
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.positiveHighlights.slice(0, 3).map((h) => {
              const Icon = HIGHLIGHT_ICONS[h.icon] || Sparkles;
              return (
                <div
                  key={h.id}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--admin-success)' }} />
                  </div>
                  <p className="text-sm leading-snug" style={{ color: 'var(--admin-text)' }}>
                    {h.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}
              >
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
                  Total Views
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--admin-text)' }}>
                  {formatNumber(analytics.overview.totalViews)}
                </p>
              </div>
            </div>
          </div>
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--admin-success), #16A34A)' }}
              >
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
                  Unique Views
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--admin-text)' }}>
                  {formatNumber(analytics.overview.totalUniqueViews)}
                </p>
              </div>
            </div>
          </div>
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    analytics.overview.changePercent >= 0
                      ? 'linear-gradient(135deg, var(--admin-success), #16A34A)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                }}
              >
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
                  vs Previous
                </p>
                <p
                  className="text-xl font-bold"
                  style={{
                    color:
                      analytics.overview.changePercent >= 0 ? 'var(--admin-success)' : 'var(--admin-danger)',
                  }}
                >
                  {analytics.overview.changePercent >= 0 ? '+' : ''}
                  {analytics.overview.changePercent}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {analytics && analytics.dailyStats.length > 0 && (
        <div
          className="p-6 rounded-xl"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
            Page Views
          </h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.dailyStats.map((d) => ({
                  date: formatDate(d.date),
                  views: d.views,
                  unique: d.uniqueViews,
                }))}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--admin-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--admin-text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--admin-card)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#colorViews)" name="Views" />
                <Line type="monotone" dataKey="unique" stroke="#10b981" strokeWidth={2} name="Unique" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top 5 Pages (tools + blogs) */}
      {analytics && analytics.topPages.length > 0 && (
        <div
          className="p-6 rounded-xl"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
            Top 5 Pages
          </h2>
          <div className="space-y-2">
            {analytics.topPages.map((page, i) => (
              <div
                key={`${page.pageType}-${page.pageId}`}
                className="flex items-center justify-between p-3 rounded-lg gap-4"
                style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate" style={{ color: 'var(--admin-text)' }}>
                      {page.pageTitle || page.pagePath}
                    </span>
                    <span className="text-xs truncate block" style={{ color: 'var(--admin-text-secondary)' }}>
                      {page.pagePath}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: 'var(--admin-bg)',
                      color: 'var(--admin-text-secondary)',
                      border: '1px solid var(--admin-border)',
                    }}
                  >
                    {page.pageType}
                  </span>
                </div>
                <div className="flex gap-4 flex-shrink-0 text-sm">
                  <span style={{ color: 'var(--admin-text)' }}>
                    <strong>{formatNumber(page.totalViews)}</strong> views
                  </span>
                  <span style={{ color: 'var(--admin-success)' }}>
                    <strong>{formatNumber(page.totalUniqueViews)}</strong> unique
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics && analytics.topPages.length === 0 && analytics.dailyStats.length === 0 && (
        <div
          className="p-12 text-center rounded-xl"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <p style={{ color: 'var(--admin-text-secondary)' }}>No analytics data for this period yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
