import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/seo/site';

/**
 * Optional same-origin proxy. Prefer browser → API direct tracking (see utils/analytics.ts).
 * When used, call backend without relying on Origin (backend must allow no-Origin / server hops).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Hint for proxies/CDNs; real browser Origin is not settable from Node.
        'X-Forwarded-Host': 'fyntools.com',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ success: res.ok }));
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ success: false, error: 'Proxy failed' }, { status: 502 });
  }
}
