'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/seo/site';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Eye,
  FileText,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';



interface BlogAnalytics {
  blogId: string;
  title: string;
  slug: string;
  category: string;
  publishDate: string | null;
  totalViews: number;
  totalUniqueViews: number;
  daysActive: number;
  dbViewCount: number;
  previousViews: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  dailyData?: Array<{
    date: string;
    views: number;
    uniqueViews: number;
  }>;
}

interface BlogAnalyticsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  overview: {
    totalBlogViews: number;
    totalUniqueViews: number;
    previousTotalViews: number;
    change: number;
    changePercent: number;
    totalBlogs: number;
    publishedBlogs: number;
    averageViewsPerBlog: number;
  };
  blogAnalytics: BlogAnalytics[];
  categoryStats: Array<{
    category: string;
    views: number;
    uniqueViews: number;
    blogCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueViews: number;
    blogCount: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdminBlogAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<BlogAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBlogAnalytics();
  }, [period]);

  const fetchBlogAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/fyntoolsadmin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/analytics/blog?period=${period}`, {
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
        setAnalytics(data.data);
      } else {
        toast.error('Failed to load blog analytics');
      }
    } catch (error) {
      console.error('Error fetching blog analytics:', error);
      toast.error('Failed to load blog analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogDetails = async (blogId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/analytics/page?pageType=blog&pageId=${blogId}&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.dailyData) {
          // Update the blog in analytics with daily data
          setAnalytics(prev => {
            if (!prev) return null;
            return {
              ...prev,
              blogAnalytics: prev.blogAnalytics.map(blog => 
                blog.blogId === blogId 
                  ? { ...blog, dailyData: data.data.dailyData }
                  : blog
              )
            };
          });
        }
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const selectedBlogData = selectedBlog 
    ? analytics.blogAnalytics.find(b => b.blogId === selectedBlog)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Blog Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Comprehensive analytics for all your blog posts
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background text-foreground border-input">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/fyntoolsadmin/blogs')}
            className="w-full sm:w-auto"
          >
            Manage Blogs
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Blog Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(analytics.overview.totalBlogViews)}
            </div>
            {analytics.overview.changePercent !== 0 && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${
                analytics.overview.changePercent > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.overview.changePercent > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(analytics.overview.changePercent)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : period === '90d' ? 'Last 90 days' : 'Last year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Unique Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(analytics.overview.totalUniqueViews)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Published Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {analytics.overview.publishedBlogs}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {analytics.overview.totalBlogs} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Views/Blog</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(analytics.overview.averageViewsPerBlog)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average per blog
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Views Chart */}
      {analytics.dailyStats.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Blog Views Over Time</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Daily blog views for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full h-[250px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyStats.map(stat => ({
                  date: formatDate(stat.date),
                  views: stat.views,
                  unique: stat.uniqueViews
                }))}>
                  <defs>
                    <linearGradient id="colorBlogViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorBlogViews)"
                    name="Total Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Unique Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Stats */}
      {analytics.categoryStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Views by Category</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Distribution of views across blog categories
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryStats.map(stat => ({
                        name: stat.category,
                        value: stat.views
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Category Performance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Views comparison by category
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryStats.map(stat => ({
                    category: stat.category,
                    views: stat.views,
                    unique: stat.uniqueViews
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="category" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" name="Total Views" />
                    <Bar dataKey="unique" fill="#10b981" name="Unique Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performing Blogs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Top Performing Blogs</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Blogs ranked by views in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {analytics.blogAnalytics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No blog analytics data available
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {analytics.blogAnalytics.map((blog, index) => (
                <div
                  key={blog.blogId}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 cursor-pointer"
                  onClick={() => {
                    setSelectedBlog(selectedBlog === blog.blogId ? null : blog.blogId);
                    if (!blog.dailyData) {
                      fetchBlogDetails(blog.blogId);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {blog.title}
                        </span>
                        {blog.category && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {blog.category}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                          blog.trend === 'up' ? 'bg-green-500/10 text-green-600' : 
                          blog.trend === 'down' ? 'bg-red-500/10 text-red-600' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {blog.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : blog.trend === 'down' ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {blog.changePercent > 0 ? '+' : ''}{blog.changePercent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        /blog/{blog.slug}
                      </p>
                      {blog.publishDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Published: {new Date(blog.publishDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-sm">
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(blog.totalViews)}</div>
                      <div className="text-xs text-muted-foreground">analytics views</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(blog.dbViewCount)}</div>
                      <div className="text-xs text-muted-foreground">DB views</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        blog.change > 0 ? 'text-green-600' : blog.change < 0 ? 'text-red-600' : ''
                      }`}>
                        {blog.change > 0 ? '+' : ''}{formatNumber(blog.change)}
                      </div>
                      <div className="text-xs text-muted-foreground">change</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/blog/${blog.slug}`, '_blank');
                      }}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Blog Chart */}
      {selectedBlogData && selectedBlogData.dailyData && selectedBlogData.dailyData.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{selectedBlogData.title} - Daily Views</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Daily view breakdown for this blog
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedBlogData.dailyData.map(stat => ({
                  date: formatDate(stat.date),
                  views: stat.views,
                  unique: stat.uniqueViews
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Unique Views"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBlogAnalyticsPage;
