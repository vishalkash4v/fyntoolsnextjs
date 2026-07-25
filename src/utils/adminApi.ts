/**
 * Cached fetch for admin API - uses ETag to avoid re-downloading unchanged data
 */

const cache = new Map<string, { etag: string; data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 min in-memory fallback

export async function cachedFetch<T>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<{ data: T; fromCache: boolean }> {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 304 && cached) {
    return { data: cached.data as T, fromCache: true };
  }

  const etag = res.headers.get('ETag');
  const json = await res.json();

  if (res.ok && etag && json?.success && json?.data) {
    cache.set(cacheKey, {
      etag,
      data: json.data,
      timestamp: Date.now(),
    });
    if (cache.size > 20) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) cache.delete(oldest[0]);
    }
  }

  return { data: json.data as T, fromCache: false };
}
