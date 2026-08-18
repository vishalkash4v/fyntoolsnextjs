import { API_BASE_URL } from '@/lib/seo/site';

export type ShortUrlResolveResult =
  | { type: 'redirect'; destination: string }
  | { type: 'password' }
  | { type: 'not_found' }
  | { type: 'expired' }
  | { type: 'error'; message: string };

const MAX_ATTEMPTS = 4;

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) throw new Error('Empty response from short URL service');
  return JSON.parse(text) as Record<string, unknown>;
}

function extractDestination(data: Record<string, unknown>): string | null {
  const success = data.success === true;
  const redirect = data.redirect === true;
  const location = typeof data.location === 'string' ? data.location : null;
  const nested = data.data as { originalUrl?: string } | undefined;
  const originalUrl = nested?.originalUrl;

  if (success && redirect && location) return location;
  if (success && originalUrl) return originalUrl;
  return null;
}

export async function resolveShortUrl(code: string): Promise<ShortUrlResolveResult> {
  if (!code?.trim()) {
    return { type: 'error', message: 'Invalid short URL code' };
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${API_BASE_URL}/shorturl/${encodeURIComponent(code)}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status === 404) return { type: 'not_found' };
      if (res.status === 410) return { type: 'expired' };

      if (!res.ok) {
        if (res.status >= 500 && attempt < MAX_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        return { type: 'error', message: 'We could not load this short link. Please try again.' };
      }

      const data = await parseJsonResponse(res);
      const nested = data.data as { hasPassword?: boolean } | undefined;

      if (data.success && data.protected && nested?.hasPassword) {
        return { type: 'password' };
      }

      const destination = extractDestination(data);
      if (destination) return { type: 'redirect', destination };

      return { type: 'error', message: 'Invalid response from the short link service.' };
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) {
        return { type: 'error', message: 'Network error. Check your connection and try again.' };
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  return { type: 'error', message: 'Network error. Check your connection and try again.' };
}
