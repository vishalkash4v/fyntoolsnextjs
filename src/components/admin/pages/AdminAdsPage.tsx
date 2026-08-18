'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2, MousePointerClick, Users, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';
import { assertAdminAuthorized, isAdminAuthError } from '@/utils/adminAuth';
import { Button } from '@/components/ui/button';

type DailyPoint = { date: string; clicks: number };
type TopPath = { path: string; clicks: number };
type ClickRow = {
  _id: string;
  campaignId: string;
  sourcePath: string;
  placement: string;
  ipAddress: string;
  userAgent?: string | null;
  createdAt: string;
  destinationUrl: string;
};

type StatsData = {
  campaignId: string;
  days: number;
  totalClicks: number;
  uniqueIps: number;
  daily: DailyPoint[];
  topPaths: TopPath[];
  recent: ClickRow[];
};

const DAYS_OPTIONS = [7, 14, 30, 90];

export default function AdminAdsPage() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/fyntoolsadmin/login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchStats = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/ads/admin/stats?campaignId=namezivo&days=${days}`,
        { headers }
      );
      assertAdminAuthorized(res);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load stats');
      }
      setStats(json.data);
    } catch (e) {
      console.error(e);
      if (isAdminAuthError(e)) {
        router.push('/fyntoolsadmin/login');
        return;
      }
      toast.error('Failed to load Namezivo ad stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, days]);

  const fetchClicks = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
    setListLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/ads/admin/clicks?campaignId=namezivo&page=${page}&limit=50`,
        { headers }
      );
      assertAdminAuthorized(res);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load clicks');
      }
      setClicks(json.data.items || []);
      setPages(json.data.pages || 1);
      setTotal(json.data.total || 0);
    } catch (e) {
      console.error(e);
      if (isAdminAuthError(e)) {
        router.push('/fyntoolsadmin/login');
        return;
      }
      toast.error('Failed to load click log');
    } finally {
      setListLoading(false);
    }
  }, [authHeaders, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchClicks();
  }, [fetchClicks]);

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatDay = (d: string) => {
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
            Namezivo Ad Performance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            Sponsored banner clicks · IP · date/time · daily trend
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: days === d ? 'rgba(79, 70, 229, 0.15)' : 'var(--admin-bg)',
                color: days === d ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                border: '1px solid var(--admin-border)',
              }}
            >
              {d}d
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchClicks();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <MousePointerClick className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                Total clicks ({days}d)
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
                {stats?.totalClicks ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                Unique IPs ({days}d)
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
                {stats?.uniqueIps ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
          Daily click performance
        </h2>
        <div className="h-72 w-full">
          {(stats?.daily?.length ?? 0) === 0 ? (
            <div
              className="h-full flex items-center justify-center text-sm"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              No clicks in this period yet. Clicks appear after users tap the Namezivo banner.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats!.daily}>
                <defs>
                  <linearGradient id="adClicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickFormatter={formatDay} fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip
                  labelFormatter={(v) => formatDay(String(v))}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--admin-border)',
                    background: 'var(--admin-card)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#4F46E5"
                  fill="url(#adClicksFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {(stats?.topPaths?.length ?? 0) > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--admin-text)' }}>
            Top source pages
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--admin-text-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                  <th className="text-left py-2 font-medium">Path</th>
                  <th className="text-right py-2 font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {stats!.topPaths.map((p) => (
                  <tr key={p.path} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td className="py-2 font-mono text-xs" style={{ color: 'var(--admin-text)' }}>
                      {p.path}
                    </td>
                    <td className="py-2 text-right" style={{ color: 'var(--admin-text)' }}>
                      {p.clicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
            Click log ({total})
          </h2>
          {listLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ color: 'var(--admin-text-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left py-2 pr-3 font-medium">Date & time</th>
                <th className="text-left py-2 pr-3 font-medium">IP address</th>
                <th className="text-left py-2 pr-3 font-medium">Source</th>
                <th className="text-left py-2 font-medium">Placement</th>
              </tr>
            </thead>
            <tbody>
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center" style={{ color: 'var(--admin-text-secondary)' }}>
                    No clicks recorded yet.
                  </td>
                </tr>
              ) : (
                clicks.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td className="py-2.5 pr-3 whitespace-nowrap" style={{ color: 'var(--admin-text)' }}>
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: 'var(--admin-text)' }}>
                      {c.ipAddress || 'unknown'}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs max-w-[200px] truncate" style={{ color: 'var(--admin-text)' }}>
                      {c.sourcePath}
                    </td>
                    <td className="py-2.5 text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                      {c.placement}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
              Page {page} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
