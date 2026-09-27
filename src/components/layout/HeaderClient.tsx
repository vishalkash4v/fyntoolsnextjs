'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, Search } from 'lucide-react';

type NavItem = { name: string; href: string };

const HeaderSearch = dynamic(() => import('@/components/layout/HeaderSearch'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-10 md:h-12 rounded-xl border-2 bg-muted/30 animate-pulse flex items-center px-3 text-muted-foreground text-sm gap-2">
      <Search className="h-4 w-4" />
      <span>Search tools…</span>
    </div>
  ),
});

export default function HeaderClient({ navigation }: { navigation: NavItem[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchReady, setSearchReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchReady(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const enableSearch = () => setSearchReady(true);

  return (
    <>
      <div
        className="hidden md:flex flex-1 max-w-md mx-4"
        onFocusCapture={enableSearch}
        onMouseEnter={enableSearch}
      >
        {searchReady ? (
          <HeaderSearch className="w-full" />
        ) : (
          <button
            type="button"
            onClick={enableSearch}
            className="relative w-full h-10 md:h-12 rounded-xl border-2 border-border/80 bg-background text-left px-3 text-sm text-foreground flex items-center gap-2 shadow-sm"
            aria-label="Open tool search"
            aria-keyshortcuts="Control+K"
          >
            <Search className="h-4 w-4 text-primary" />
            <span className="flex-1">Search tools…</span>
            <kbd className="hidden sm:inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Ctrl K</kbd>
          </button>
        )}
      </div>

      <nav className="hidden lg:flex items-center space-x-1" aria-label="Primary">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            prefetch={false}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-primary'}`}
            aria-current={pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)) ? 'page' : undefined}
          >
            {item.name}
          </Link>
        ))}
        <ThemeToggle />
      </nav>

      <div className="flex lg:hidden items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="container mx-auto px-4 pb-4 space-y-2">
            <div onFocusCapture={enableSearch}>
              {searchReady ? (
                <HeaderSearch
                  className="w-full mb-2"
                  onResultClick={() => setIsMenuOpen(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={enableSearch}
                  className="relative w-full h-10 mb-2 rounded-xl border-2 border-border/80 bg-background text-left px-3 text-sm text-foreground flex items-center gap-2 shadow-sm"
                  aria-label="Open tool search"
                  aria-keyshortcuts="Control+K"
                >
                  <Search className="h-4 w-4 text-primary" />
                  <span className="flex-1">Search tools…</span>
                  <kbd className="inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Ctrl K</kbd>
                </button>
              )}
            </div>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button
              className="w-full"
              onClick={() => {
                setIsMenuOpen(false);
                router.push('/tools');
              }}
            >
              Explore Tools
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
