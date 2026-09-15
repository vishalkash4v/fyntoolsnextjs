'use client';

import { useEffect, useRef } from 'react';
import { trackBlogView } from '@/utils/analytics';

type Props = {
  blogId: string;
  slug: string;
  title: string;
};

export default function BlogViewTracker({ blogId, slug, title }: Props) {
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!blogId || !slug) return;
    const key = `${blogId}:${slug}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackBlogView(blogId, slug, title);
  }, [blogId, slug, title]);

  return null;
}
