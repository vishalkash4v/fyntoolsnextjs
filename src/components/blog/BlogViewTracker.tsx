'use client';

import { useEffect } from 'react';
import { trackBlogView } from '@/utils/analytics';

type Props = {
  blogId: string;
  slug: string;
  title: string;
};

export default function BlogViewTracker({ blogId, slug, title }: Props) {
  useEffect(() => {
    if (!blogId || !slug) return;
    trackBlogView(blogId, slug, title);
  }, [blogId, slug, title]);

  return null;
}
