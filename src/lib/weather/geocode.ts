/** Free geocoding — Open-Meteo → Photon/OSM → Nominatim + IP + reverse lookup. */

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

async function geocodeOpenMeteo(query: string): Promise<GeoPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
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
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`;
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
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`;
  const data = await fetchJson<NominatimResult[]>(url, { cache: 'no-store' });
  if (!data?.length) return [];

  return data.map((r) => {
    const addr = r.address;
    const name = addr?.city || addr?.town || addr?.village || r.name || query;
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

export async function searchPlaces(query: string): Promise<GeoPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  for (const fn of [geocodeOpenMeteo, geocodePhoton, geocodeNominatim]) {
    const results = await fn(trimmed);
    if (results.length > 0) return results;
  }
  return [];
}

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
