import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/weather/geocode';

export const runtime = 'nodejs';

/** GET /api/weather/search?q=mumbai — free multi-provider city autocomplete */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchPlaces(q);
  return NextResponse.json(
    { results: results.slice(0, 8) },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  );
}
