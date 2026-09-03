import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/weather/geocode';

export const runtime = 'nodejs';

/** GET /api/weather/search?q= — Google Places (Next.js env) first, else open geocoders */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: [], meta: { provider: 'none', googleKeyPresent: false } });
  }

  const { results, meta } = await searchPlaces(q);
  return NextResponse.json(
    { results: results.slice(0, 10), meta },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
