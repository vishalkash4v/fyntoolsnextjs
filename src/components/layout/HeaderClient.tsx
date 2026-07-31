'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
            className="relative w-full h-10 md:h-12 rounded-xl border-2 bg-background text-left px-3 text-sm text-muted-foreground flex items-center gap-2"
            aria-label="Open tool search"
          >
            <Search className="h-4 w-4" />
            Search tools…
          </button>
        )}
      </div>

      <nav className="hidden lg:flex items-center space-x-1" aria-label="Primary">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            prefetch={false}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
                  className="relative w-full h-10 mb-2 rounded-xl border-2 bg-background text-left px-3 text-sm text-muted-foreground flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search tools…
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
