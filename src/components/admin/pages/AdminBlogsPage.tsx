'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Filter, Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import BlogEditor from '@/components/admin/BlogEditor';



import { API_BASE_URL } from '@/lib/seo/site';
interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  scheduledDate?: string;
  viewCount: number;
  createdAt: string;
  featuredImage?: string;
}

interface AdminBlogsPageProps {
  mode?: 'list' | 'create' | 'edit';
}

const AdminBlogsPage = ({ mode: propMode }: AdminBlogsPageProps) => {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const mode = propMode || (id ? 'edit' : 'list');

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => {
    if (mode === 'list') {
      fetchBlogs();
      fetchCategories();
    }
  }, [pagination.page, statusFilter, categoryFilter, search, mode]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(search && { search })
      });

      const response = await fetch(`${API_BASE_URL}/blog?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      setBlogs(data.data || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete blog');

      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated');
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') return 'admin-badge-success';
    if (status === 'draft') return 'admin-badge-warning';
    if (status === 'scheduled') return 'admin-badge-info';
    return 'admin-badge-warning';
  };

  // If in create/edit mode, show editor
  if (mode === 'create' || mode === 'edit') {
    return <BlogEditor blogId={mode === 'edit' ? id : undefined} />;
  }

  return (
    <div className="space-y-6 admin-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--admin-text)', fontSize: '28px' }}>Blog Management</h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Manage and create blog posts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => router.push('/fyntoolsadmin/blogs/ai-generate')}
            size="sm"
            className="admin-btn admin-btn-secondary w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate Blog
          </Button>
          <Button 
            onClick={() => router.push('/fyntoolsadmin/blogs/create')}
            size="sm"
            className="admin-btn admin-btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Blog
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card p-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--admin-text)', fontSize: '18px' }}>
            <Filter className="h-5 w-5" />
            Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input sm:col-span-2"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="admin-select">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="admin-select">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Table */}
      <div className="admin-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)', fontSize: '22px' }}>Blogs ({pagination.total})</h2>
        </div>
        <div>
          {isLoading ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>No blogs found</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Published</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog._id}>
                        <td className="font-medium max-w-xs">
                          <div className="flex items-center gap-2">
                            {blog.featuredImage && (
                              <ImageIcon className="h-4 w-4" style={{ color: 'var(--admin-text-secondary)' }} />
                            )}
                            <span className="truncate" style={{ color: 'var(--admin-text)' }}>{blog.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge admin-badge-info text-xs">{blog.category}</span>
                        </td>
                        <td>
                          <Select
                            value={blog.status}
                            onValueChange={(value) => handleStatusChange(blog._id, value)}
                          >
                            <SelectTrigger className="admin-select w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td style={{ color: 'var(--admin-text)' }}>{blog.viewCount}</td>
                        <td style={{ color: 'var(--admin-text)' }}>
                          {blog.publishDate
                            ? new Date(blog.publishDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="admin-btn admin-btn-secondary p-2"
                              onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="admin-btn admin-btn-secondary p-2"
                              onClick={() => router.push(`/fyntoolsadmin/blogs/edit/${blog._id}`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="admin-btn admin-btn-danger p-2"
                              onClick={() => handleDelete(blog._id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {blogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="p-4 rounded-xl space-y-3 transition-all"
                      style={{ 
                        border: '1px solid var(--admin-border)',
                        background: 'var(--admin-card)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--admin-card)'}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {blog.featuredImage && (
                              <ImageIcon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--admin-text-secondary)' }} />
                            )}
                            <h3 className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--admin-text)' }}>{blog.title}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="admin-badge admin-badge-info text-xs">{blog.category}</span>
                            <span className={`admin-badge text-xs ${getStatusBadge(blog.status)}`}>{blog.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            className="admin-btn admin-btn-secondary p-2 h-8 w-8"
                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="admin-btn admin-btn-secondary p-2 h-8 w-8"
                            onClick={() => router.push(`/fyntoolsadmin/blogs/edit/${blog._id}`)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger p-2 h-8 w-8"
                            onClick={() => handleDelete(blog._id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                        <div>
                          <span className="font-medium">Views:</span> {blog.viewCount}
                        </div>
                        <div>
                          <span className="font-medium">Published:</span>{' '}
                          {blog.publishDate
                            ? new Date(blog.publishDate).toLocaleDateString()
                            : '-'}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Select
                        value={blog.status}
                        onValueChange={(value) => handleStatusChange(blog._id, value)}
                      >
                        <SelectTrigger className="admin-select w-full text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </>
            )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--admin-border)' }}>
              <button
                className="admin-btn admin-btn-secondary w-full sm:w-auto"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                style={{ opacity: pagination.page === 1 ? 0.5 : 1, cursor: pagination.page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="admin-btn admin-btn-secondary w-full sm:w-auto"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                style={{ opacity: pagination.page === pagination.pages ? 0.5 : 1, cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogsPage;
