'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Search, CheckCircle2, XCircle, Eye, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';



import { API_BASE_URL } from '@/lib/seo/site';
interface Tool {
  _id: string;
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string;
  path: string;
  href: string;
  url: string;
  features: string;
  isActive: boolean;
  viewCount: number;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

const AdminToolsPage = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [syncStats, setSyncStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTools();
  }, [page, categoryFilter, searchQuery, sortBy, sortOrder]);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${API_BASE_URL}/tools?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/fyntoolsadmin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setTools(data.data.tools || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 0);
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tools/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/fyntoolsadmin/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSyncStats(data.data);
        toast.success(`Sync completed! ${data.data.created} created, ${data.data.updated} updated`);
        fetchTools(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to sync tools');
      }
    } catch (error) {
      console.error('Error syncing tools:', error);
      toast.error('Failed to sync tools');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 admin-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--admin-text)', fontSize: '28px' }}>Tools Management</h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            Manage and sync tools from toolsData.ts file
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="admin-btn admin-btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync
            </>
          )}
        </button>
      </div>

      {syncStats && (
        <div className="admin-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)', fontSize: '22px' }}>Last Sync Results</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Total</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>{syncStats.total}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Created</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--admin-success)' }}>{syncStats.created}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Updated</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--admin-info)' }}>{syncStats.updated}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--admin-text-secondary)' }}>Deactivated</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--admin-warning)' }}>{syncStats.deactivated}</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--admin-text)', fontSize: '22px' }}>All Tools ({total})</h2>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            Tools synced from toolsData.ts file for blog generation
          </p>
        </div>
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--admin-text-secondary)' }} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="admin-input pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="admin-select w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="admin-select w-full sm:w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
                <SelectItem value="name" className="bg-background hover:bg-muted text-foreground">Name</SelectItem>
                <SelectItem value="views" className="bg-background hover:bg-muted text-foreground">Views</SelectItem>
                <SelectItem value="category" className="bg-background hover:bg-muted text-foreground">Category</SelectItem>
                <SelectItem value="created" className="bg-background hover:bg-muted text-foreground">Created</SelectItem>
                <SelectItem value="updated" className="bg-background hover:bg-muted text-foreground">Updated</SelectItem>
              </SelectContent>
            </Select>
            <button
              className="admin-btn admin-btn-secondary w-full sm:w-auto"
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--admin-primary)' }} />
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
              No tools found. Click "Sync" to sync from toolsData.ts
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>ID</th>
                      <th>Status</th>
                      <th>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool) => (
                      <tr key={tool._id}>
                        <td>
                          <div className="font-medium text-sm sm:text-base" style={{ color: 'var(--admin-text)' }}>{tool.name}</div>
                          <div className="text-xs sm:text-sm line-clamp-1" style={{ color: 'var(--admin-text-secondary)' }}>
                            {tool.description}
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge-info text-xs">{tool.category}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" style={{ color: 'var(--admin-text-secondary)' }} />
                            <span className="font-medium text-sm" style={{ color: 'var(--admin-text)' }}>{tool.viewCount || 0}</span>
                          </div>
                        </td>
                        <td>
                          <code className="text-xs px-2 py-1 rounded" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
                            {tool.id}
                          </code>
                        </td>
                        <td>
                          {tool.isActive ? (
                            <span className="admin-badge admin-badge-success text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="admin-badge admin-badge-danger text-xs flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-xs sm:text-sm break-all"
                            style={{ color: 'var(--admin-primary)' }}
                          >
                            {tool.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {tools.map((tool) => (
                  <div
                    key={tool._id}
                    className="p-3 sm:p-4 rounded-xl space-y-2 transition-all"
                    style={{ 
                      border: '1px solid var(--admin-border)',
                      background: 'var(--admin-card)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--admin-card)'}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--admin-text)' }}>{tool.name}</h3>
                        <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--admin-text-secondary)' }}>
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="admin-badge admin-badge-info text-xs">{tool.category}</span>
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                            <Eye className="h-3 w-3" />
                            <span>{tool.viewCount || 0} views</span>
                          </div>
                          {tool.isActive ? (
                            <span className="admin-badge admin-badge-success text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="admin-badge admin-badge-danger text-xs flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <code className="text-xs px-2 py-1 rounded" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)' }}>
                            {tool.id}
                          </code>
                        </div>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-xs break-all"
                          style={{ color: 'var(--admin-primary)' }}
                        >
                          {tool.url}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      className="admin-btn admin-btn-secondary flex-1 sm:flex-none"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Previous
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary flex-1 sm:flex-none"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminToolsPage;
