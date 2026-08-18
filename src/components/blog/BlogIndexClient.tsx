'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PublicBlogPost } from '@/lib/blog/api';
import { resolveBlogImageUrl } from '@/lib/blog/api';
import {
  fetchBlogCategoriesClient,
  fetchPublicBlogsClient,
} from '@/lib/blog/client';

type Props = {
  initialPosts: PublicBlogPost[];
  categories: string[];
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndexClient({ initialPosts, categories: initialCategories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState(initialPosts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);

  // Always refresh from DB in background (keep SSR HTML visible for Google)
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const [blogRes, cats] = await Promise.all([
          fetchPublicBlogsClient({ limit: 50 }),
          fetchBlogCategoriesClient(),
        ]);
        if (cancelled) return;
        if (blogRes.posts?.length) setPosts(blogRes.posts);
        if (cats?.length) setCategories(cats);
      } catch {
        /* keep SSR seed */
      }
    };
    refresh();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterByCategory = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const { posts: fresh } = await fetchPublicBlogsClient({
        limit: 50,
        category: category === 'All' ? undefined : category,
      });
      setPosts(fresh);
    } catch {
      setPosts(
        category === 'All'
          ? initialPosts
          : initialPosts.filter((p) => p.category === category)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="mb-10 flex flex-wrap gap-2 justify-center" aria-label="Blog categories">
        <Button
          variant={selectedCategory === 'All' ? 'default' : 'outline'}
          size="sm"
          onClick={() => filterByCategory('All')}
        >
          All Posts
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByCategory(category)}
          >
            {category}
          </Button>
        ))}
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {posts.map((post) => {
            const imageUrl = resolveBlogImageUrl(post.featuredImage);
            return (
              <article key={post._id}>
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <div className="flex flex-col md:flex-row h-full">
                    {imageUrl && (
                      <div className="md:w-48 md:flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
                          </span>
                          {post.readingTime ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {post.readingTime} min read
                            </span>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/blog/${post.slug}`}>
                            Read Article
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </article>
            );
          })}
        </div>
      ) : (
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No posts found</h2>
            <p className="text-muted-foreground">No blog posts available yet.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
