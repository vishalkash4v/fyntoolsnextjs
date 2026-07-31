'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/seo/site';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  Trash2,
  ExternalLink,
  ShieldBan,
  BarChart3,
  Ban,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CopyButton from '@/components/common/CopyButton';



interface ShortUrl {
  _id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  customAlias?: string;
  isActive: boolean;
  isSpam?: boolean;
  ipAddress?: string | null;
}

interface DashboardStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  recentUrls: number;
  spamUrls?: number;
  blockedIps?: number;
}

interface BlockedIpRow {
  _id: string;
  ip: string;
  reason?: string;
  createdAt: string;
}

interface AnalyticsPayload {
  shortUrl: ShortUrl & { expiresAt?: string | null };
  recentClicks: Array<{
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    createdAt: string;
  }>;
}

const AdminShortUrlsPage = () => {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUrls, setTotalUrls] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blockedRows, setBlockedRows] = useState<BlockedIpRow[]>([]);
  const [blockIpInput, setBlockIpInput] = useState('');
  const [spamDialog, setSpamDialog] = useState<{ open: boolean; row: ShortUrl | null }>({ open: false, row: null });
  const [spamAlsoBlockIp, setSpamAlsoBlockIp] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPayload | null>(null);
  const router = useRouter();

  const itemsPerPage = 20;

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token || ''}` };
  };

  const fetchBlocked = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/blocked-ips?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) setBlockedRows(data.data.items || []);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/shorturls?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/fyntoolsadmin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUrls(data.data.urls || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalUrls(data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast.error('Failed to load short URLs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchBlocked();
  }, [fetchStats, fetchBlocked]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this short URL permanently?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Short URL deleted');
        fetchUrls();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete short URL');
    }
  };

  const openAnalytics = async (id: string) => {
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    setAnalyticsData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/${id}/analytics`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (data.success) setAnalyticsData(data.data);
      else toast.error(data.error || 'Failed to load analytics');
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const submitSpam = async () => {
    const row = spamDialog.row;
    if (!row) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/${row._id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSpam: true,
          blockCreatorIp: spamAlsoBlockIp && row.ipAddress && row.ipAddress !== 'unknown',
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(spamAlsoBlockIp ? 'Marked spam and IP blocked (if available)' : 'Marked spam and deactivated');
        setSpamDialog({ open: false, row: null });
        fetchUrls();
        fetchStats();
        fetchBlocked();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  const restoreUrl = async (row: ShortUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/${row._id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSpam: false, isActive: true }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Link restored');
        fetchUrls();
        fetchStats();
      } else toast.error(data.error || 'Failed');
    } catch {
      toast.error('Request failed');
    }
  };

  const blockIpManual = async (ipOverride?: string) => {
    const ip = (ipOverride ?? blockIpInput).trim();
    if (!ip) {
      toast.error('Enter an IP address');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/blocked-ips`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason: 'Manually blocked from admin panel' }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('IP blocked');
        if (!ipOverride) setBlockIpInput('');
        fetchBlocked();
        fetchStats();
      } else toast.error(data.error || 'Failed');
    } catch {
      toast.error('Request failed');
    }
  };

  const unblockIp = async (ip: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shorturls/blocked-ips/remove`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('IP unblocked');
        fetchBlocked();
        fetchStats();
      } else toast.error(data.error || 'Failed');
    } catch {
      toast.error('Request failed');
    }
  };

  const blockIpFromRow = async (ip: string | null | undefined) => {
    if (!ip || ip === 'unknown') {
      toast.error('No IP recorded for this link');
      return;
    }
    await blockIpManual(ip);
  };

  const shortUrl = (code: string) => `${window.location.origin}/s/${code}`;

  return (
    <div className="space-y-6 admin-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--admin-text)', fontSize: '28px' }}>
          Short URLs &amp; abuse control
        </h1>
        <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
          Flag spam, block IPs, and inspect click analytics.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total links', value: stats.totalUrls, icon: Activity },
            { label: 'Total clicks', value: stats.totalClicks, icon: BarChart3 },
            { label: 'Flagged spam', value: stats.spamUrls ?? 0, icon: ShieldBan },
            { label: 'Blocked IPs', value: stats.blockedIps ?? 0, icon: Ban },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="admin-card p-4 flex items-center gap-3"
              style={{ border: '1px solid var(--admin-border)' }}
            >
              <div className="p-2 rounded-lg" style={{ background: 'var(--admin-bg)' }}>
                <Icon className="h-5 w-5" style={{ color: 'var(--admin-primary)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                  {label}
                </p>
                <p className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>
                  {value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
            Blocked IP addresses
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            Blocked users see: “You are blocked because you violated our terms and conditions” when creating new links.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="e.g. 203.0.113.42"
            value={blockIpInput}
            onChange={(e) => setBlockIpInput(e.target.value)}
            className="admin-input flex-1"
          />
          <Button type="button" className="admin-btn admin-btn-primary shrink-0" onClick={() => blockIpManual()}>
            <Ban className="h-4 w-4 mr-2" />
            Block IP
          </Button>
        </div>
        {blockedRows.length === 0 ? (
          <p className="text-sm py-2" style={{ color: 'var(--admin-text-secondary)' }}>
            No IPs blocked yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {blockedRows.map((b) => (
              <div
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg text-sm"
                style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}
              >
                <div>
                  <span className="font-mono font-medium" style={{ color: 'var(--admin-text)' }}>
                    {b.ip}
                  </span>
                  {b.reason && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                      {b.reason}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => unblockIp(b.ip)}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card p-6">
        <div className="relative flex-1 mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by short code or original URL..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-input pl-10 w-full"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--admin-text)', fontSize: '22px' }}>
            All short URLs
          </h2>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            Page {currentPage} of {totalPages} — {totalUrls.toLocaleString()} total
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--admin-primary)' }} />
          </div>
        ) : urls.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            No short URLs found
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {urls.map((url) => (
              <div
                key={url._id}
                className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl"
                style={{
                  border: '1px solid var(--admin-border)',
                  background: 'var(--admin-card)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <a
                      href={shortUrl(url.shortCode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs sm:text-sm hover:underline break-all"
                      style={{ color: 'var(--admin-primary)' }}
                    >
                      {shortUrl(url.shortCode)}
                    </a>
                    {url.customAlias && <span className="admin-badge admin-badge-info text-xs">Custom</span>}
                    {url.isSpam && <span className="admin-badge admin-badge-danger text-xs">Spam</span>}
                    {!url.isActive && <span className="admin-badge admin-badge-danger text-xs">Inactive</span>}
                  </div>
                  <p className="text-xs break-all mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
                    {url.originalUrl}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                    <span>{url.clickCount} clicks</span>
                    <span>{new Date(url.createdAt).toLocaleString()}</span>
                    {url.ipAddress && url.ipAddress !== 'unknown' && (
                      <span className="font-mono">IP: {url.ipAddress}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => openAnalytics(url._id)}
                  >
                    <BarChart3 className="h-4 w-4 sm:mr-1" />
                    Analytics
                  </Button>
                  {!url.isSpam ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setSpamAlsoBlockIp(!!(url.ipAddress && url.ipAddress !== 'unknown'));
                        setSpamDialog({ open: true, row: url });
                      }}
                    >
                      <ShieldBan className="h-4 w-4 sm:mr-1" />
                      Mark spam
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => restoreUrl(url)}
                    >
                      <RotateCcw className="h-4 w-4 sm:mr-1" />
                      Restore
                    </Button>
                  )}
                  {url.ipAddress && url.ipAddress !== 'unknown' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => blockIpFromRow(url.ipAddress)}
                    >
                      <Ban className="h-4 w-4 sm:mr-1" />
                      Block IP
                    </Button>
                  )}
                  <CopyButton
                    textToCopy={shortUrl(url.shortCode)}
                    successMessage="Copied!"
                    variant="outline"
                    size="sm"
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary p-2"
                    onClick={() => window.open(shortUrl(url.shortCode), '_blank')}
                    title="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger p-2"
                    onClick={() => handleDelete(url._id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4"
            style={{ borderTop: '1px solid var(--admin-border)' }}
          >
            <button
              type="button"
              className="admin-btn admin-btn-secondary w-full sm:w-auto"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-secondary w-full sm:w-auto"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Dialog open={spamDialog.open} onOpenChange={(o) => !o && setSpamDialog({ open: false, row: null })}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--admin-text)' }}>Mark as spam?</DialogTitle>
            <DialogDescription style={{ color: 'var(--admin-text-secondary)' }}>
              This deactivates the short link so it no longer redirects. Optionally block the creator IP from making
              new links.
            </DialogDescription>
          </DialogHeader>
          {spamDialog.row && (
            <div className="space-y-4 py-2">
              <p className="text-xs font-mono break-all p-2 rounded-md" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
                {shortUrl(spamDialog.row.shortCode)}
              </p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="block-ip"
                  checked={spamAlsoBlockIp}
                  onCheckedChange={(v) => setSpamAlsoBlockIp(v === true)}
                  disabled={!spamDialog.row.ipAddress || spamDialog.row.ipAddress === 'unknown'}
                />
                <Label htmlFor="block-ip" className="text-sm leading-snug cursor-pointer" style={{ color: 'var(--admin-text)' }}>
                  Also block creator IP
                  {(!spamDialog.row.ipAddress || spamDialog.row.ipAddress === 'unknown') && (
                    <span className="block text-xs text-muted-foreground mt-1">No IP stored for this link.</span>
                  )}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSpamDialog({ open: false, row: null })}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-500 text-white" onClick={submitSpam}>
              Confirm spam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
          style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--admin-text)' }}>Click analytics</DialogTitle>
            <DialogDescription style={{ color: 'var(--admin-text-secondary)' }}>
              Recent requests (up to 100) for this short link.
            </DialogDescription>
          </DialogHeader>
          {analyticsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--admin-primary)' }} />
            </div>
          ) : analyticsData ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg space-y-1" style={{ background: 'var(--admin-bg)' }}>
                <p style={{ color: 'var(--admin-text-secondary)' }}>Short code</p>
                <p className="font-mono font-medium" style={{ color: 'var(--admin-text)' }}>
                  {analyticsData.shortUrl.shortCode}
                </p>
                <p style={{ color: 'var(--admin-text-secondary)' }} className="pt-2">
                  Total clicks (counter)
                </p>
                <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>
                  {analyticsData.shortUrl.clickCount}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                  Recent events
                </p>
                {analyticsData.recentClicks.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                    No click events logged yet.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {analyticsData.recentClicks.map((c, i) => (
                      <li
                        key={`${c.createdAt}-${i}`}
                        className="p-2 rounded-md text-xs border"
                        style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}
                      >
                        <div className="font-mono">{c.ipAddress || '—'}</div>
                        <div className="text-muted-foreground mt-1 truncate" title={c.userAgent}>
                          {c.userAgent || 'No user-agent'}
                        </div>
                        <div className="text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShortUrlsPage;
