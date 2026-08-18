import { API_BASE_URL } from '@/lib/seo/site';

/** Client-side blog fetch (browser) — mirrors old React Frontend. */
export function getBlogApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'https://express-two-umber.vercel.app/api'
  );
}

export async function fetchPublicBlogsClient(options?: {
  page?: number;
  limit?: number;
  category?: string;
}) {
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

  const res = await fetch(`${getBlogApiBase()}/blog/public?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch blogs');
  const data = await res.json();
  if (!data.success) throw new Error('Blog list unsuccessful');
  return {
    posts: data.data ?? [],
    pagination: data.pagination ?? null,
  };
}

export async function fetchPublicBlogBySlugClient(slug: string) {
  const res = await fetch(`${getBlogApiBase()}/blog/public/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load blog');
  const data = await res.json();
  if (!data.success || !data.data) return null;
  return data.data;
}

export async function fetchRelatedBlogsClient(slug: string, limit = 3) {
  const res = await fetch(
    `${getBlogApiBase()}/blog/${encodeURIComponent(slug)}/related?limit=${limit}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? (data.data ?? []) : [];
}

export async function fetchBlogCategoriesClient() {
  const res = await fetch(`${getBlogApiBase()}/blog/categories`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.success ? (data.data ?? []) : [];
}
