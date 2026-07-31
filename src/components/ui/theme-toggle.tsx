'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const ORDER = ['light', 'dark', 'system'] as const;

/** Lightweight theme cycle — no Radix dropdown on every page. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = (theme as (typeof ORDER)[number]) || 'system';
  const next = () => {
    const i = ORDER.indexOf(current);
    setTheme(ORDER[(i + 1) % ORDER.length]);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={next}
      className="hover:bg-primary/10 transition-all duration-300"
      aria-label={`Theme: ${current}. Click to change.`}
      title={`Theme: ${current}`}
    >
      {!mounted || current === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      ) : current === 'dark' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      ) : (
        <Monitor className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      )}
    </Button>
  );
}
