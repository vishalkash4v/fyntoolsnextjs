import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/seo/site';

/** Same-origin proxy — avoids cross-origin analytics failures in production. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({ success: res.ok }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, error: 'Proxy failed' }, { status: 502 });
  }
}
