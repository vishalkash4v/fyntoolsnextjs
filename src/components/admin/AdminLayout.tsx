'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/seo/site';
import {
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Mail,
  FileText,
  Wrench,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
  Monitor,
  TrendingUp,
  Award,
  Flame,
  Heart,
  Sparkles,
  Users,
  MousePointerClick,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PositiveHighlight {
  id: string;
  type: string;
  message: string;
  icon: string;
}

const HIGHLIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  'trending-up': TrendingUp,
  award: Award,
  fire: Flame,
  'file-text': FileText,
  wrench: Wrench,
  heart: Heart,
  sparkles: Sparkles,
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [highlights, setHighlights] = useState<PositiveHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const fetchHighlights = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      setHighlightsLoading(true);
      const res = await fetch(`${API_BASE_URL}/analytics/highlights?period=7d`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.highlights) {
        setHighlights(data.data.highlights);
      }
    } catch {
      setHighlights([{ id: 'welcome', type: 'welcome', message: 'Your dashboard is ready. Keep creating!', icon: 'sparkles' }]);
    } finally {
      setHighlightsLoading(false);
    }
  };

  // Lazy-load highlights only when user opens the bell dropdown (no fetch on mount)

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    router.push('/fyntoolsadmin/login');
  };

  const [adminUser, setAdminUser] = useState<{ username?: string }>({});

  useEffect(() => {
    try {
      setAdminUser(JSON.parse(localStorage.getItem('adminUser') || '{}'));
    } catch {
      setAdminUser({});
    }
  }, []);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/fyntoolsadmin/dashboard',
    },
    {
      icon: LinkIcon,
      label: 'Short URLs',
      path: '/fyntoolsadmin/shorturls',
    },
    {
      icon: MessageSquare,
      label: 'Tools Reviews',
      path: '/fyntoolsadmin/reviews',
    },
    {
      icon: Mail,
      label: 'Contact Queries',
      path: '/fyntoolsadmin/contacts',
    },
    {
      icon: FileText,
      label: 'Blogs',
      path: '/fyntoolsadmin/blogs',
    },
    {
      icon: BarChart3,
      label: 'Blog Analytics',
      path: '/fyntoolsadmin/blogs/analytics',
    },
    {
      icon: Wrench,
      label: 'Tools Management',
      path: '/fyntoolsadmin/tools',
    },
    {
      icon: MousePointerClick,
      label: 'Ad Performance',
      path: '/fyntoolsadmin/ads',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/fyntoolsadmin/blogs') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-panel min-h-screen" style={{ background: 'var(--admin-bg)' }}>
      {/* Modern Sidebar */}
      <aside
        className={`admin-sidebar fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'var(--admin-sidebar)',
          borderRight: '1px solid var(--admin-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: '1px solid var(--admin-border)' }}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}>
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div>
                  <h1 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>FynTools</h1>
                  <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Admin Panel</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}>
                <span className="text-white font-bold text-sm">F</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors"
              style={{ color: 'var(--admin-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`admin-sidebar-item w-full ${active ? 'active' : ''}`}
                  style={{
                    background: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: active ? 'var(--admin-primary)' : 'var(--admin-text-secondary)'
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" style={{ color: active ? 'var(--admin-primary)' : 'var(--admin-text-secondary)' }} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--admin-border)' }}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--admin-bg)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                    {adminUser.username || 'Admin'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--admin-text-secondary)' }}>Administrator</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="admin-sidebar-item w-full"
              style={{ color: 'var(--admin-danger)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Top Header Bar */}
        <header className="admin-header sticky top-0 z-30 h-16 border-b shadow-sm">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--admin-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--admin-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <Sun className="h-5 w-5" />
                    ) : theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  style={{ 
                    background: 'var(--admin-card)',
                    borderColor: 'var(--admin-border)'
                  }}
                >
                  <DropdownMenuItem 
                    onClick={() => setTheme('light')}
                    style={{ 
                      color: 'var(--admin-text)',
                      background: theme === 'light' ? 'var(--admin-bg)' : 'transparent'
                    }}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme('dark')}
                    style={{ 
                      color: 'var(--admin-text)',
                      background: theme === 'dark' ? 'var(--admin-bg)' : 'transparent'
                    }}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme('system')}
                    style={{ 
                      color: 'var(--admin-text)',
                      background: theme === 'system' ? 'var(--admin-bg)' : 'transparent'
                    }}
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Positive highlights / Notifications */}
              <DropdownMenu open={highlightsOpen} onOpenChange={(open) => { setHighlightsOpen(open); if (open && highlights.length === 0 && !highlightsLoading) fetchHighlights(); }}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="relative p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--admin-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    aria-label="Positive highlights"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80 max-h-[400px] overflow-y-auto rounded-xl"
                  style={{ background: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Positive highlights</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>Real-time insights from your analytics</p>
                  </div>
                  {highlightsLoading ? (
                    <div className="px-3 py-6 text-center text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      Loading...
                    </div>
                  ) : highlights.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      No highlights yet.
                    </div>
                  ) : (
                    highlights.map((h) => {
                      const Icon = HIGHLIGHT_ICONS[h.icon] || Sparkles;
                      return (
                        <div
                          key={h.id}
                          className="px-3 py-2.5 flex gap-3 items-start"
                          style={{ borderBottom: '1px solid var(--admin-border)' }}
                        >
                          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                            <Icon className="h-4 w-4" style={{ color: 'var(--admin-success)' }} />
                          </div>
                          <p className="text-sm leading-snug" style={{ color: 'var(--admin-text)' }}>{h.message}</p>
                        </div>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar */}
              <div 
                className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--admin-primary), #818CF8)' }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                    {adminUser.username || 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - consistent width for symmetry across all admin pages */}
        <main className="p-4 sm:p-6 lg:p-8 w-full">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
