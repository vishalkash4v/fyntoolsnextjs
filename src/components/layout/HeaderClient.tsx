'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import ToolSearch from '@/components/tools/ToolSearch';
import { allTools } from '@/data/toolsData';

type NavItem = { name: string; href: string };

export default function HeaderClient({ navigation }: { navigation: NavItem[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <ToolSearch tools={allTools} className="w-full" />
      </div>

      <nav className="hidden lg:flex items-center space-x-1" aria-label="Primary">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
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
            <ToolSearch tools={allTools} className="w-full mb-2" />
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
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
