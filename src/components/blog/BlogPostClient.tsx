'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackBlogView } from '@/utils/analytics';
import type { PublicBlogPost, RelatedBlogPost } from '@/lib/blog/api';
import {
  fetchPublicBlogBySlugClient,
  fetchRelatedBlogsClient,
} from '@/lib/blog/client';
import BlogPostView from '@/components/blog/BlogPostView';

type Props = {
  slug: string;
  /** Optional SSR seed — client always refetches fresh from DB */
  initialPost?: PublicBlogPost | null;
};

export default function BlogPostClient({ slug, initialPost = null }: Props) {
  const [post, setPost] = useState<PublicBlogPost | null>(initialPost);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlogPost[]>([]);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [blogData, related] = await Promise.all([
          fetchPublicBlogBySlugClient(slug),
          fetchRelatedBlogsClient(slug, 3),
        ]);

        if (cancelled) return;

        if (!blogData) {
          setError('Blog not found');
          setPost(null);
          return;
        }

        setPost(blogData);
        setRelatedBlogs(related);
        trackBlogView(blogData._id, blogData.slug, blogData.title);
      } catch {
        if (cancelled) return;
        setError('Failed to load blog post');
        setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <h1 className="text-2xl font-semibold mb-2">Blog post unavailable</h1>
        <p className="text-muted-foreground mb-6">
          {error === 'Blog not found'
            ? 'This post is missing or was removed. Browse other articles on our blog.'
            : 'Something went wrong loading this post. Try again later.'}
        </p>
        <Button asChild>
          <Link href="/blog">Back to blog</Link>
        </Button>
      </div>
    );
  }

  return <BlogPostView post={post} relatedBlogs={relatedBlogs} />;
}
