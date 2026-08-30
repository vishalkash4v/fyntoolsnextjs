/** Free geocoding — Open-Meteo (primary) + Photon/OSM (fallback) + BigDataCloud reverse. */

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

type BdcReverse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** City name → coordinates via Open-Meteo Geocoding API. */
async function geocodeOpenMeteo(query: string): Promise<GeoPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const data = await fetchJson<OpenMeteoGeoResult>(url);
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

/** Fallback: Photon (Komoot/OSM) — free, no API key. */
async function geocodePhoton(query: string): Promise<GeoPlace[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`;
  const data = await fetchJson<{ features?: PhotonFeature[] }>(url);
  if (!data?.features?.length) return [];

  return data.features
    .filter((f) => f.geometry?.coordinates?.length === 2)
    .map((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties;
      const name = p.name || p.city || query;
      return {
        name,
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

/** Reverse geocode coords → place label via BigDataCloud (free client API). */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoPlace | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const data = await fetchJson<BdcReverse>(url);
  if (!data) return null;

  const name = data.city || data.locality || 'Your location';
  return {
    name,
    admin1: data.principalSubdivision,
    country: data.countryName ?? '',
    countryCode: (data.countryCode ?? '').toUpperCase(),
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    source: 'BigDataCloud',
  };
}

/** Search cities with automatic fallback between free providers. */
export async function searchPlaces(query: string): Promise<GeoPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const primary = await geocodeOpenMeteo(trimmed);
  if (primary.length > 0) return primary;

  const fallback = await geocodePhoton(trimmed);
  return fallback;
}

/** Pick the best match for an exact city query. */
export async function resolvePlace(query: string): Promise<GeoPlace | null> {
  const results = await searchPlaces(query);
  return results[0] ?? null;
}

export function formatPlaceLabel(place: GeoPlace): string {
  const parts = [place.name];
  if (place.admin1) parts.push(place.admin1);
  if (place.country) parts.push(place.country);
  return parts.join(', ');
}
