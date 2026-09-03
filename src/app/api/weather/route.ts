import { NextRequest, NextResponse } from 'next/server';
import {
  geolocateByIp,
  placeFromCoords,
  resolvePlace,
  reverseGeocode,
} from '@/lib/weather/geocode';
import { fetchWeatherBundle } from '@/lib/weather/fetchWeather';
import { clientIp } from '@/lib/weather/http';

export const runtime = 'nodejs';

/**
 * GET /api/weather
 *   ?auto=1           — detect location from IP, return forecast
 *   ?q=London         — search city + forecast
 *   ?lat=..&lon=..    — coords + forecast
 *
 * Location search: Google Places/Geocoding when GOOGLE_PLACES_API_KEY (or MAPS/GEOCODING) is set;
 * otherwise Open-Meteo + OSM. Forecast always via FYN Weather Gateway + open models.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const auto = sp.get('auto');
    const q = sp.get('q')?.trim();
    const latStr = sp.get('lat');
    const lonStr = sp.get('lon');

    let place = null;

    if (auto === '1') {
      place = await geolocateByIp(clientIp(req));
    } else if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }
      place =
        (await reverseGeocode(lat, lon)) ?? placeFromCoords(lat, lon);
    } else if (q) {
      place = await resolvePlace(q);
      if (!place) {
        return NextResponse.json(
          { error: `No location found for "${q}". Try adding country or state.` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Provide ?auto=1, ?q=city, or ?lat=&lon=' },
        { status: 400 }
      );
    }

    const bundle = await fetchWeatherBundle(place);

    return NextResponse.json(bundle, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Weather fetch failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
