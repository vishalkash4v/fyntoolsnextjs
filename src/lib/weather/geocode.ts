/** Geocoding — Google Places Autocomplete (env key) first, then Open-Meteo → Photon → Nominatim. */

import { fetchJson } from '@/lib/weather/http';

export type GeoPlace = {
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: string;
};

export type PlaceSearchMeta = {
  provider: 'google' | 'open-meteo' | 'photon' | 'nominatim' | 'none';
  googleKeyPresent: boolean;
  googleStatus?: string;
};

type OpenMeteoGeoResult = {
  results?: {
    name: string;
    admin1?: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }[];
};

type PhotonFeature = {
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
  geometry: { coordinates: [number, number] };
};

type NominatimResult = {
  name?: string;
  display_name?: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

type BdcReverse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
};

type IpWhoResult = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: {
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
  }[];
};

type GoogleAutocompleteResponse = {
  status: string;
  error_message?: string;
  predictions?: {
    description: string;
    place_id: string;
    structured_formatting?: {
      main_text: string;
      secondary_text?: string;
    };
  }[];
};

type GooglePlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    name?: string;
    formatted_address?: string;
    geometry?: { location: { lat: number; lng: number } };
    address_components?: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
  };
};

type GooglePlacesTextResponse = {
  status: string;
  error_message?: string;
  results?: {
    name: string;
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }[];
};

const DEFAULT_PLACE: GeoPlace = {
  name: 'New Delhi',
  admin1: 'Delhi',
  country: 'India',
  countryCode: 'IN',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  source: 'Default',
};

/** Server-only Google key — never expose as NEXT_PUBLIC_*. */
export function getGoogleMapsApiKey(): string | null {
  const key =
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_GEOCODING_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    '';
  return key || null;
}

export function hasGooglePlacesKey(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

function pickComponent(
  components: { long_name: string; short_name: string; types: string[] }[],
  type: string
): string | undefined {
  return components.find((c) => c.types.includes(type))?.long_name;
}

function placeFromGoogleComponents(
  comps: { long_name: string; short_name: string; types: string[] }[],
  formatted: string,
  lat: number,
  lng: number,
  fallbackName?: string,
  source = 'Google Places'
): GeoPlace {
  const name =
    fallbackName ||
    pickComponent(comps, 'locality') ||
    pickComponent(comps, 'sublocality') ||
    pickComponent(comps, 'sublocality_level_1') ||
    pickComponent(comps, 'neighborhood') ||
    pickComponent(comps, 'administrative_area_level_3') ||
    pickComponent(comps, 'administrative_area_level_2') ||
    formatted.split(',')[0]?.trim() ||
    'Location';

  return {
    name,
    admin1: pickComponent(comps, 'administrative_area_level_1'),
    country: pickComponent(comps, 'country') ?? '',
    countryCode: (
      comps.find((c) => c.types.includes('country'))?.short_name ?? ''
    ).toUpperCase(),
    latitude: lat,
    longitude: lng,
    timezone: 'auto',
    source,
  };
}

function placeFromGoogleGeocode(
  r: NonNullable<GoogleGeocodeResponse['results']>[number],
  source: string
): GeoPlace {
  return placeFromGoogleComponents(
    r.address_components,
    r.formatted_address,
    r.geometry.location.lat,
    r.geometry.location.lng,
    undefined,
    source
  );
}

function logGoogleStatus(api: string, status: string, errorMessage?: string) {
  if (status === 'OK' || status === 'ZERO_RESULTS') return;
  console.warn(`[weather/geocode] Google ${api}: ${status}${errorMessage ? ` — ${errorMessage}` : ''}`);
}

/** Places Autocomplete → Place Details (fallback: geocode prediction text). */
async function geocodeGoogleAutocomplete(query: string): Promise<{
  places: GeoPlace[];
  status: string;
}> {
  const key = getGoogleMapsApiKey();
  if (!key) return { places: [], status: 'NO_KEY' };

  const autoUrl =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(query)}` +
    `&types=geocode` +
    `&key=${encodeURIComponent(key)}` +
    `&language=en`;

  const auto = await fetchJson<GoogleAutocompleteResponse>(autoUrl, { cache: 'no-store' });
  if (!auto) return { places: [], status: 'FETCH_FAILED' };

  logGoogleStatus('Autocomplete', auto.status, auto.error_message);
  if (auto.status !== 'OK' || !auto.predictions?.length) {
    // Retry without types filter (establishments + addresses)
    const auto2Url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(query)}` +
      `&key=${encodeURIComponent(key)}` +
      `&language=en`;
    const auto2 = await fetchJson<GoogleAutocompleteResponse>(auto2Url, { cache: 'no-store' });
    if (!auto2 || auto2.status !== 'OK' || !auto2.predictions?.length) {
      return { places: [], status: auto.status };
    }
    return resolveAutocompletePredictions(auto2.predictions, key, query, auto2.status);
  }

  return resolveAutocompletePredictions(auto.predictions, key, query, auto.status);
}

async function resolveAutocompletePredictions(
  predictions: NonNullable<GoogleAutocompleteResponse['predictions']>,
  key: string,
  query: string,
  status: string
): Promise<{ places: GeoPlace[]; status: string }> {
  const top = predictions.slice(0, 12);
  const detailed = await Promise.all(
    top.map(async (pred) => {
      const detailsUrl =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(pred.place_id)}` +
        `&fields=name,formatted_address,geometry,address_component` +
        `&key=${encodeURIComponent(key)}` +
        `&language=en`;
      const details = await fetchJson<GooglePlaceDetailsResponse>(detailsUrl, { cache: 'no-store' });

      if (details?.result?.geometry?.location) {
        const loc = details.result.geometry.location;
        const comps = details.result.address_components ?? [];
        const name =
          details.result.name ||
          pred.structured_formatting?.main_text ||
          pred.description.split(',')[0];

        if (comps.length) {
          return placeFromGoogleComponents(
            comps,
            details.result.formatted_address || pred.description,
            loc.lat,
            loc.lng,
            name,
            'Google Places'
          );
        }

        const parts = (details.result.formatted_address || pred.description)
          .split(',')
          .map((p) => p.trim());
        return {
          name: name || parts[0] || query,
          admin1: parts.length >= 3 ? parts[parts.length - 2] : undefined,
          country: parts[parts.length - 1] || '',
          countryCode: '',
          latitude: loc.lat,
          longitude: loc.lng,
          timezone: 'auto',
          source: 'Google Places',
        } satisfies GeoPlace;
      }

      // Details failed / restricted — geocode the full prediction text
      const geo = await geocodeGoogle(pred.description);
      if (geo.places[0]) {
        return {
          ...geo.places[0],
          name: pred.structured_formatting?.main_text || geo.places[0].name,
          source: 'Google Places',
        };
      }
      return null;
    })
  );

  return {
    places: detailed.filter((p): p is GeoPlace => p != null),
    status,
  };
}

async function geocodeGoogle(query: string): Promise<{ places: GeoPlace[]; status: string }> {
  const key = getGoogleMapsApiKey();
  if (!key) return { places: [], status: 'NO_KEY' };

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}` +
    `&key=${encodeURIComponent(key)}&language=en`;
  const data = await fetchJson<GoogleGeocodeResponse>(url, { cache: 'no-store' });
  if (!data) return { places: [], status: 'FETCH_FAILED' };

  logGoogleStatus('Geocoding', data.status, data.error_message);
  if (data.status !== 'OK' || !data.results?.length) {
    return { places: [], status: data.status };
  }

  return {
    places: data.results.slice(0, 8).map((r) => placeFromGoogleGeocode(r, 'Google Places')),
    status: data.status,
  };
}

async function geocodeGooglePlacesText(query: string): Promise<{ places: GeoPlace[]; status: string }> {
  const key = getGoogleMapsApiKey();
  if (!key) return { places: [], status: 'NO_KEY' };

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}` +
    `&key=${encodeURIComponent(key)}&language=en`;
  const data = await fetchJson<GooglePlacesTextResponse>(url, { cache: 'no-store' });
  if (!data) return { places: [], status: 'FETCH_FAILED' };

  logGoogleStatus('TextSearch', data.status, data.error_message);
  if ((data.status !== 'OK' && data.status !== 'ZERO_RESULTS') || !data.results?.length) {
    return { places: [], status: data.status };
  }

  return {
    places: data.results.slice(0, 8).map((r) => {
      const parts = r.formatted_address.split(',').map((p) => p.trim());
      return {
        name: r.name || parts[0] || query,
        admin1: parts.length >= 3 ? parts[parts.length - 2] : undefined,
        country: parts[parts.length - 1] || '',
        countryCode: '',
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
        timezone: 'auto',
        source: 'Google Places',
      };
    }),
    status: data.status,
  };
}

async function reverseGeocodeGoogle(lat: number, lon: number): Promise<GeoPlace | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}` +
    `&key=${encodeURIComponent(key)}&language=en`;
  const data = await fetchJson<GoogleGeocodeResponse>(url, { cache: 'no-store' });
  if (!data || data.status !== 'OK' || !data.results?.[0]) {
    if (data) logGoogleStatus('ReverseGeocode', data.status, data.error_message);
    return null;
  }
  return placeFromGoogleGeocode(data.results[0], 'Google Places');
}

async function geocodeOpenMeteo(query: string): Promise<GeoPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const data = await fetchJson<OpenMeteoGeoResult>(url, { cache: 'no-store' });
  if (!data?.results?.length) return [];

  return data.results.map((r) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code.toUpperCase(),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    source: 'Open-Meteo Geocoding',
  }));
}

async function geocodePhoton(query: string): Promise<GeoPlace[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`;
  const data = await fetchJson<{ features?: PhotonFeature[] }>(url, { cache: 'no-store' });
  if (!data?.features?.length) return [];

  return data.features
    .filter((f) => f.geometry?.coordinates?.length === 2)
    .map((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties;
      return {
        name: p.name || p.city || query,
        admin1: p.state,
        country: p.country ?? '',
        countryCode: (p.countrycode ?? '').toUpperCase(),
        latitude: lat,
        longitude: lon,
        timezone: 'auto',
        source: 'Photon (OpenStreetMap)',
      };
    });
}

async function geocodeNominatim(query: string): Promise<GeoPlace[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=10&addressdetails=1&dedupe=1`;
  const data = await fetchJson<NominatimResult[]>(url, { cache: 'no-store' });
  if (!data?.length) return [];

  return data.map((r) => {
    const addr = r.address;
    const name =
      addr?.neighbourhood ||
      addr?.suburb ||
      addr?.hamlet ||
      addr?.village ||
      addr?.town ||
      addr?.city ||
      addr?.county ||
      r.name ||
      query;
    return {
      name,
      admin1: addr?.state,
      country: addr?.country ?? '',
      countryCode: (addr?.country_code ?? '').toUpperCase(),
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      timezone: 'auto',
      source: 'Nominatim (OpenStreetMap)',
    };
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoPlace | null> {
  const google = await reverseGeocodeGoogle(lat, lon);
  if (google) return google;

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const data = await fetchJson<BdcReverse>(url, { cache: 'no-store' });
  if (!data) return null;

  return {
    name: data.city || data.locality || 'Your location',
    admin1: data.principalSubdivision,
    country: data.countryName ?? '',
    countryCode: (data.countryCode ?? '').toUpperCase(),
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    source: 'BigDataCloud',
  };
}

/** IP → city/coords via ipwho.is (free, no API key). */
export async function geolocateByIp(ip: string | null): Promise<GeoPlace> {
  const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
  if (isLocal) return DEFAULT_PLACE;

  const data = await fetchJson<IpWhoResult>(`https://ipwho.is/${ip}`, { cache: 'no-store' });
  if (data?.success && data.latitude != null && data.longitude != null) {
    const refined = await reverseGeocode(data.latitude, data.longitude);
    if (refined) return refined;

    return {
      name: data.city || 'Your area',
      admin1: data.region,
      country: data.country ?? '',
      countryCode: (data.country_code ?? '').toUpperCase(),
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: 'auto',
      source: 'ipwho.is',
    };
  }

  return DEFAULT_PLACE;
}

function dedupePlaces(places: GeoPlace[]): GeoPlace[] {
  const seen = new Set<string>();
  const out: GeoPlace[] = [];
  for (const p of places) {
    const key = `${p.name.toLowerCase()}|${p.latitude.toFixed(3)}|${p.longitude.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/**
 * Search places — Google Autocomplete/Geocode/Text (if env key) first,
 * then free Open-Meteo / OSM fallbacks.
 */
export async function searchPlaces(query: string): Promise<{
  results: GeoPlace[];
  meta: PlaceSearchMeta;
}> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {
      results: [],
      meta: { provider: 'none', googleKeyPresent: hasGooglePlacesKey() },
    };
  }

  const googleKeyPresent = hasGooglePlacesKey();

  if (googleKeyPresent) {
    // Autocomplete first (best as-you-type for local areas), then fill gaps.
    const [auto, geo, text] = await Promise.all([
      geocodeGoogleAutocomplete(trimmed),
      geocodeGoogle(trimmed),
      geocodeGooglePlacesText(trimmed),
    ]);

    const merged = dedupePlaces([...auto.places, ...geo.places, ...text.places]);
    const googleStatus = [auto.status, geo.status, text.status].find(
      (s) => s && s !== 'OK' && s !== 'ZERO_RESULTS' && s !== 'NO_KEY'
    );

    if (merged.length > 0) {
      console.info(`[weather/search] "${trimmed}" → Google Places (${merged.length} hits)`);
      return {
        results: merged.slice(0, 12),
        meta: {
          provider: 'google',
          googleKeyPresent: true,
          googleStatus: googleStatus || 'OK',
        },
      };
    }

    console.warn(
      `[weather/search] Google returned empty for "${trimmed}" (statuses: auto=${auto.status}, geo=${geo.status}, text=${text.status}) — falling back`
    );
  } else {
    console.warn(
      '[weather/search] No GOOGLE_PLACES_API_KEY / GOOGLE_MAPS_API_KEY in Next.js env — using open geocoders. Put the key in fyntoolsnextjs/.env.local (not Backend/.env).'
    );
  }

  const open = await geocodeOpenMeteo(trimmed);
  if (open.length > 0) {
    console.info(`[weather/search] "${trimmed}" → Open-Meteo (${open.length} hits)`);
    return {
      results: open.slice(0, 10),
      meta: { provider: 'open-meteo', googleKeyPresent, googleStatus: 'fallback' },
    };
  }

  const photon = await geocodePhoton(trimmed);
  if (photon.length > 0) {
    console.info(`[weather/search] "${trimmed}" → Photon (${photon.length} hits)`);
    return {
      results: photon.slice(0, 10),
      meta: { provider: 'photon', googleKeyPresent, googleStatus: 'fallback' },
    };
  }

  const nominatim = await geocodeNominatim(trimmed);
  if (nominatim.length > 0) {
    console.info(`[weather/search] "${trimmed}" → Nominatim (${nominatim.length} hits)`);
    return {
      results: nominatim.slice(0, 10),
      meta: { provider: 'nominatim', googleKeyPresent, googleStatus: 'fallback' },
    };
  }

  return {
    results: [],
    meta: { provider: 'none', googleKeyPresent },
  };
}

export async function resolvePlace(query: string): Promise<GeoPlace | null> {
  const { results } = await searchPlaces(query);
  return results[0] ?? null;
}

export function formatPlaceLabel(place: GeoPlace): string {
  const parts = [place.name];
  if (place.admin1) parts.push(place.admin1);
  if (place.country) parts.push(place.country);
  return parts.join(', ');
}

export function placeFromCoords(lat: number, lon: number, label = 'Your location'): GeoPlace {
  return {
    name: label,
    country: '',
    countryCode: '',
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    source: 'GPS',
  };
}
