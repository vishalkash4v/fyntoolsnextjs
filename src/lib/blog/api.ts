import { API_BASE_URL } from '@/lib/seo/site';
import { blogPosts as fallbackPosts } from '@/data/blogsData';
import { fixExternalLinks } from '@/lib/content/fixExternalLinks';

export interface PublicBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishDate: string;
  updatedAt?: string;
  readingTime?: number;
  viewCount?: number;
  author?: { name?: string; email?: string };
  keywords?: string[] | string;
  focusKeyword?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface RelatedBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishDate: string;
  readingTime?: number;
}

const BLOG_REVALIDATE = 60;

export function resolveBlogImageUrl(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${API_BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

/** Normalize API keywords (string or array) for metadata/schema. */
export function normalizeBlogKeywords(
  keywords?: string[] | string,
  tags?: string[]
): string[] | undefined {
  if (Array.isArray(keywords) && keywords.length) return keywords;
  if (typeof keywords === 'string' && keywords.trim()) {
    return keywords.split(',').map((k) => k.trim()).filter(Boolean);
  }
  if (tags?.length) return tags;
  return undefined;
}

function mapFallbackPost(p: (typeof fallbackPosts)[number]): PublicBlogPost {
  return {
    _id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.description,
    content: fixExternalLinks(p.content),
    category: p.category,
    tags: p.tags,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    publishDate: p.publishDate,
    featuredImage: p.imageUrl,
    author: { name: p.author },
    keywords: p.keywords,
    faqs: p.faqs?.map((f) => ({
      question: f.question,
      answer: fixExternalLinks(f.answer),
    })),
  };
}

function sanitizeBlogPost(post: PublicBlogPost): PublicBlogPost {
  return {
    ...post,
    content: fixExternalLinks(post.content),
    excerpt: fixExternalLinks(post.excerpt),
    faqs: post.faqs?.map((f) => ({
      question: f.question,
      answer: fixExternalLinks(f.answer),
    })),
  };
}

export async function fetchPublicBlogs(options?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{
  posts: PublicBlogPost[];
  pagination: { page: number; limit: number; total: number; pages: number } | null;
}> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 50;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });
  if (options?.category && options.category !== 'All') {
    params.set('category', options.category);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/blog/public?${params}`, {
      next: { revalidate: BLOG_REVALIDATE },
    });
    if (!res.ok) throw new Error(`Blog list ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Blog list unsuccessful');
    return {
      posts: (data.data ?? []).map(sanitizeBlogPost),
      pagination: data.pagination ?? null,
    };
  } catch {
    const fallback = fallbackPosts.map(mapFallbackPost);
    return {
      posts: fallback,
      pagination: { page: 1, limit: fallback.length, total: fallback.length, pages: 1 },
    };
  }
}

export async function fetchPublicBlogBySlug(slug: string): Promise<PublicBlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/public/${encodeURIComponent(slug)}`, {
      next: { revalidate: BLOG_REVALIDATE },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Blog post ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data) return null;
    return sanitizeBlogPost(data.data);
  } catch {
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    return fallback ? mapFallbackPost(fallback) : null;
  }
}

export async function fetchBlogCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? (data.data ?? []) : [];
  } catch {
    return [...new Set(fallbackPosts.map((p) => p.category))];
  }
}

export async function fetchRelatedBlogs(slug: string, limit = 3): Promise<RelatedBlogPost[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blog/${encodeURIComponent(slug)}/related?limit=${limit}`,
      { next: { revalidate: BLOG_REVALIDATE } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? (data.data ?? []) : [];
  } catch {
    return [];
  }
}

export async function fetchAllBlogSlugs(): Promise<Array<{ slug: string; publishDate: string }>> {
  const { posts } = await fetchPublicBlogs({ limit: 200 });
  return posts.map((p) => ({
    slug: p.slug,
    publishDate: p.publishDate,
  }));
}
