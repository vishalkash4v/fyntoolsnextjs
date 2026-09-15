'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackToolView, trackPageView } from '@/utils/analytics';
import { allTools } from '@/data/toolsData';
import { TOOL_SLUGS } from '@/lib/tools/tool-slugs.generated';

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.replace(/\/$/, '') || '/';
}

const toolByPath = new Map<string, { id: string; path: string; name: string }>();

for (const tool of allTools) {
  if (tool.path) {
    toolByPath.set(normalizePath(tool.path), {
      id: tool.id,
      path: normalizePath(tool.path),
      name: tool.name,
    });
  }
}

for (const slug of TOOL_SLUGS) {
  const path = normalizePath(`/${slug}`);
  if (!toolByPath.has(path)) {
    const fromList = allTools.find((t) => t.id === slug);
    toolByPath.set(path, {
      id: slug,
      path,
      name: fromList?.name ?? slug.replace(/-/g, ' '),
    });
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const path = normalizePath(pathname || '');
    if (!path || path.startsWith('/fyntoolsadmin')) return;
    if (path.startsWith('/blog')) return; // BlogViewTracker handles blogs
    if (path.startsWith('/s/')) return;
    if (lastTracked.current === path) return;

    const tool = toolByPath.get(path);
    if (tool) {
      lastTracked.current = path;
      trackToolView(tool.id, tool.path, tool.name);
      return;
    }

    // Still count important non-tool pages so dashboard isn't empty
    if (path === '/' || path.startsWith('/category') || path === '/contact' || path === '/about') {
      lastTracked.current = path;
      trackPageView({
        pageType: 'other',
        pageId: path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-'),
        pagePath: path,
        pageTitle: typeof document !== 'undefined' ? document.title : path,
      });
    }
  }, [pathname]);

  return null;
}
