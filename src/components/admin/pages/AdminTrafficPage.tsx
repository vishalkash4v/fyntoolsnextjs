'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Globe2,
  Laptop,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Smartphone,
  Tablet,
  Bot,
  Filter,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/seo/site';
import { assertAdminAuthorized, isAdminAuthError } from '@/utils/adminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Overview = { visits: number; uniqueIps: number; uniqueSessions: number };
type ByType = { tool: number; blog: number; shorturl: number; other: number };
type ReferrerRow = { host: string; visits: number; uniqueIps: number };
type PageRow = {
  pagePath: string;
  pageType: string;
  pageTitle?: string;
  visits: number;
  uniqueIps: number;
};
type IpRow = {
  ipAddress: string;
  visits: number;
  lastSeen: string;
  pathCount: number;
  types: string[];
  country?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
};
type CountryRow = { country: string; countryCode?: string | null; visits: number; uniqueIps: number };
type RegionRow = {
  region: string;
  country?: string | null;
  countryCode?: string | null;
  visits: number;
  uniqueIps: number;
};
type DeviceRow = { device: string; visits: number };
type DailyPoint = { date: string; visits: number; uniqueIps: number };

type VisitRow = {
  _id: string;
  pageType: string;
  pageId: string;
  pagePath: string;
  pageTitle?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  referrerHost?: string | null;
  sessionId?: string | null;
  device?: string;
  countryCode?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  createdAt: string;
};

type SummaryData = {
  days: number;
  overview: Overview;
  byType: ByType;
  byDevice: DeviceRow[];
  topReferrers: ReferrerRow[];
  topPages: PageRow[];
  topIps: IpRow[];
  topCountries: CountryRow[];
  topRegions: RegionRow[];
  daily: DailyPoint[];
};

const DAYS_OPTIONS = [1, 7, 14, 30, 90];
const TYPE_OPTIONS = [
  { id: '', label: 'All pages' },
  { id: 'tool', label: 'Tools' },
  { id: 'blog', label: 'Blogs' },
  { id: 'other', label: 'Other' },
  { id: 'shorturl', label: 'Short URLs' },
];

function typeBadgeClass(type: string) {
  switch (type) {
    case 'tool':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300';
    case 'blog':
      return 'bg-violet-500/15 text-violet-700 dark:text-violet-300';
    case 'shorturl':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
    default:
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-300';
  }
}

function deviceIcon(device?: string) {
  switch (device) {
    case 'mobile':
      return Smartphone;
    case 'tablet':
      return Tablet;
    case 'bot':
      return Bot;
    case 'desktop':
      return Laptop;
    default:
      return Globe2;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

function uaShort(ua?: string | null) {
  if (!ua) return '—';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return 'Chrome';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
  if (/bot|crawl|spider/i.test(ua)) return 'Bot';
  return ua.slice(0, 28) + (ua.length > 28 ? '…' : '');
}

export default function AdminTrafficPage() {
  const router = useRouter();
  const [days, setDays] = useState(7);
  const [pageType, setPageType] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [referrerFilter, setReferrerFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/fyntoolsadmin/login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const queryBase = useMemo(() => {
    const p = new URLSearchParams();
    p.set('days', String(days));
    if (pageType) p.set('pageType', pageType);
    if (ipFilter) p.set('ip', ipFilter);
    if (referrerFilter) p.set('referrerHost', referrerFilter);
    if (countryFilter) p.set('country', countryFilter);
    if (regionFilter) p.set('region', regionFilter);
    if (search) p.set('q', search);
    return p;
  }, [days, pageType, ipFilter, referrerFilter, countryFilter, regionFilter, search]);

  const fetchSummary = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/traffic/summary?${queryBase}`, {
        headers,
      });
      assertAdminAuthorized(res);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load summary');
      setSummary(json.data);
    } catch (e) {
      console.error(e);
      if (isAdminAuthError(e)) {
        router.push('/fyntoolsadmin/login');
        return;
      }
      toast.error('Failed to load traffic summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, queryBase, router]);

  const fetchVisits = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;
    setListLoading(true);
    try {
      const p = new URLSearchParams(queryBase);
      p.set('page', String(page));
      p.set('limit', '50');
      const res = await fetch(`${API_BASE_URL}/analytics/traffic/visits?${p}`, { headers });
      assertAdminAuthorized(res);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load visits');
      setVisits(json.data.visits || []);
      setPages(json.data.pagination?.pages || 1);
      setTotal(json.data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
      if (isAdminAuthError(e)) {
        router.push('/fyntoolsadmin/login');
        return;
      }
      toast.error('Failed to load visit log');
      setVisits([]);
    } finally {
      setListLoading(false);
    }
  }, [authHeaders, queryBase, page, router]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    void fetchVisits();
  }, [fetchVisits]);

  const clearFilters = () => {
    setPageType('');
    setIpFilter('');
    setReferrerFilter('');
    setCountryFilter('');
    setRegionFilter('');
    setSearch('');
    setSearchDraft('');
    setPage(1);
  };

  const applyIp = (ip: string) => {
    setIpFilter(ip);
    setPage(1);
  };

  const applyReferrer = (host: string) => {
    setReferrerFilter(host);
    setPage(1);
  };

  const applyCountry = (country: string) => {
    setCountryFilter(country);
    setRegionFilter('');
    setPage(1);
  };

  const applyRegion = (region: string, country?: string | null) => {
    setRegionFilter(region);
    if (country) setCountryFilter(country);
    setPage(1);
  };

  const ov = summary?.overview;
  const byType = summary?.byType;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Traffic & IP visits
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            See who is visiting — by country/region, IP, referrer, and page type (tools, blogs, other).
            Logs keep 90 days.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void fetchSummary();
              void fetchVisits();
            }}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-3 flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-wrap gap-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDays(d);
                setPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium border ${
                days === d ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              {d === 1 ? 'Today' : `${d}d`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.id || 'all'}
              type="button"
              onClick={() => {
                setPageType(t.id);
                setPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium border ${
                pageType === t.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-1.5 flex-1 min-w-[200px]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchDraft.trim());
            setPage(1);
          }}
        >
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search path, IP, country, referrer…"
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" variant="secondary">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
        {(ipFilter || referrerFilter || search || pageType || countryFilter || regionFilter) && (
          <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {(ipFilter || referrerFilter || countryFilter || regionFilter) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {ipFilter && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/40">
              IP: <code className="font-mono">{ipFilter}</code>
              <button type="button" className="opacity-70 hover:opacity-100" onClick={() => setIpFilter('')}>
                ×
              </button>
            </span>
          )}
          {referrerFilter && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/40">
              From: <strong>{referrerFilter}</strong>
              <button
                type="button"
                className="opacity-70 hover:opacity-100"
                onClick={() => setReferrerFilter('')}
              >
                ×
              </button>
            </span>
          )}
          {countryFilter && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/40">
              Country: <strong>{countryFilter}</strong>
              <button type="button" className="opacity-70 hover:opacity-100" onClick={() => setCountryFilter('')}>
                ×
              </button>
            </span>
          )}
          {regionFilter && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 bg-muted/40">
              Region: <strong>{regionFilter}</strong>
              <button type="button" className="opacity-70 hover:opacity-100" onClick={() => setRegionFilter('')}>
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* KPI cards */}
      {loading && !summary ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Visits" value={ov?.visits ?? 0} icon={Eye} />
            <Kpi label="Unique IPs" value={ov?.uniqueIps ?? 0} icon={MapPin} />
            <Kpi label="Sessions" value={ov?.uniqueSessions ?? 0} icon={Globe2} />
            <Kpi
              label="Tools / Blogs / Other"
              value={`${byType?.tool ?? 0} / ${byType?.blog ?? 0} / ${byType?.other ?? 0}`}
              icon={Laptop}
              raw
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">Visits over time (IST)</h2>
            <div className="h-56">
              {(summary?.daily?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  No visit data yet for this range. Browse the public site to generate traffic.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      name="Visits"
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueIps"
                      stroke="#64748b"
                      fill="#64748b"
                      fillOpacity={0.08}
                      name="Unique IPs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Geography */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="Countries (where traffic runs most)" subtitle="Click a country to filter">
              {(summary?.topCountries?.length || 0) === 0 ? (
                <Empty hint="Country data appears as new visits are logged" />
              ) : (
                <ul className="space-y-1.5">
                  {summary!.topCountries.map((c) => {
                    const pct =
                      ov?.visits && ov.visits > 0 ? Math.round((c.visits / ov.visits) * 100) : 0;
                    return (
                      <li key={`${c.countryCode || c.country}`}>
                        <button
                          type="button"
                          onClick={() => applyCountry(c.country)}
                          className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">
                              {c.countryCode ? `${c.countryCode} · ` : ''}
                              {c.country}
                            </span>
                            <span className="tabular-nums text-muted-foreground shrink-0">
                              {c.visits} ({pct}%) · {c.uniqueIps} IP
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="Regions / states" subtitle="Click a region to drill down">
              {(summary?.topRegions?.length || 0) === 0 ? (
                <Empty hint="Region data appears with geo-resolved visits" />
              ) : (
                <ul className="space-y-1.5">
                  {summary!.topRegions.map((r) => (
                    <li key={`${r.country}-${r.region}`}>
                      <button
                        type="button"
                        onClick={() => applyRegion(r.region, r.country)}
                        className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.region}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {r.country || '—'}
                          </div>
                        </div>
                        <span className="tabular-nums text-muted-foreground shrink-0">
                          {r.visits} · {r.uniqueIps} IP
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Source + pages + IPs */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Panel title="Where traffic comes from" subtitle="Top referrer hosts — click to filter">
              {(summary?.topReferrers?.length || 0) === 0 ? (
                <Empty hint="Direct / empty referrer visits only" />
              ) : (
                <ul className="space-y-1.5">
                  {summary!.topReferrers.map((r) => (
                    <li key={r.host}>
                      <button
                        type="button"
                        onClick={() => applyReferrer(r.host)}
                        className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                      >
                        <span className="truncate font-medium">{r.host}</span>
                        <span className="tabular-nums text-muted-foreground shrink-0">
                          {r.visits} · {r.uniqueIps} IP
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Where they land" subtitle="Top pages — tools, blogs, other">
              {(summary?.topPages?.length || 0) === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-1.5">
                  {summary!.topPages.map((p) => (
                    <li
                      key={`${p.pageType}:${p.pagePath}`}
                      className="flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${typeBadgeClass(p.pageType)}`}>
                            {p.pageType}
                          </span>
                          <span className="truncate font-medium">{p.pageTitle || p.pagePath}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate font-mono">{p.pagePath}</div>
                      </div>
                      <span className="tabular-nums text-muted-foreground shrink-0">{p.visits}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Top IP addresses" subtitle="Click an IP to see all their visits">
              {(summary?.topIps?.length || 0) === 0 ? (
                <Empty />
              ) : (
                <ul className="space-y-1.5">
                  {summary!.topIps.map((row) => (
                    <li key={row.ipAddress}>
                      <button
                        type="button"
                        onClick={() => applyIp(row.ipAddress)}
                        className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                      >
                        <div className="min-w-0">
                          <code className="font-mono text-xs">{row.ipAddress}</code>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {[row.city, row.region, row.country].filter(Boolean).join(', ') ||
                              row.types?.join(', ')}
                            {` · ${row.pathCount} pages`}
                          </div>
                        </div>
                        <span className="tabular-nums text-muted-foreground shrink-0">{row.visits}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Device mix */}
          {(summary?.byDevice?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary!.byDevice.map((d) => {
                const Icon = deviceIcon(d.device);
                return (
                  <span
                    key={d.device}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {d.device}: <strong className="tabular-nums">{d.visits}</strong>
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Visit log */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
          <div>
            <h2 className="text-sm font-semibold">Live visit log</h2>
            <p className="text-[11px] text-muted-foreground">{total.toLocaleString()} matching visits</p>
          </div>
          {listLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Time (IST)</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Page</th>
                <th className="px-3 py-2 font-medium">Came from</th>
                <th className="px-3 py-2 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                    No visits in this filter. Open tools/blogs on the live site to start collecting IPs.
                  </td>
                </tr>
              ) : (
                visits.map((v) => {
                  const Icon = deviceIcon(v.device);
                  const loc = [v.city, v.region, v.country].filter(Boolean).join(', ');
                  return (
                    <tr key={v._id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                        {formatTime(v.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                        {v.ipAddress && v.ipAddress !== 'unknown' ? (
                          <button
                            type="button"
                            className="font-mono text-xs text-primary hover:underline"
                            onClick={() => applyIp(v.ipAddress!)}
                          >
                            {v.ipAddress}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-[160px]">
                        {loc || v.countryCode ? (
                          <button
                            type="button"
                            className="text-xs text-left hover:underline truncate block w-full"
                            onClick={() =>
                              v.country ? applyCountry(v.country) : undefined
                            }
                            title={loc}
                          >
                            {v.countryCode ? `${v.countryCode} · ` : ''}
                            {loc || '—'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${typeBadgeClass(v.pageType)}`}>
                          {v.pageType}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-[220px]">
                        <div className="truncate font-medium text-xs">{v.pageTitle || v.pagePath}</div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">{v.pagePath}</div>
                      </td>
                      <td className="px-3 py-2 max-w-[160px]">
                        {v.referrerHost ? (
                          <button
                            type="button"
                            className="text-xs text-left hover:underline truncate block w-full"
                            onClick={() => applyReferrer(v.referrerHost!)}
                            title={v.referrer || v.referrerHost}
                          >
                            {v.referrerHost}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Direct / none</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={v.userAgent || ''}>
                          <Icon className="h-3.5 w-3.5" />
                          {uaShort(v.userAgent)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page} / {pages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ExternalLink className="ml-1 h-3.5 w-3.5 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  raw,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  raw?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs mb-1">
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="text-2xl font-semibold tabular-nums tracking-tight">
        {raw ? value : Number(value).toLocaleString()}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 min-h-[220px]">
      <h2 className="text-sm font-semibold">{title}</h2>
      {subtitle && <p className="text-[11px] text-muted-foreground mb-3">{subtitle}</p>}
      <div className="max-h-72 overflow-y-auto">{children}</div>
    </div>
  );
}

function Empty({ hint }: { hint?: string }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{hint || 'No data yet'}</p>;
}
