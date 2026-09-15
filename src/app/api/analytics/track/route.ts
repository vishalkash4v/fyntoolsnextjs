import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, SITE_URL } from '@/lib/seo/site';

/** Same-origin proxy — avoids browser CORS; always send Origin so backend accepts the hop. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Deployed backends that still reject empty Origin accept this site origin.
        Origin: SITE_URL,
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
