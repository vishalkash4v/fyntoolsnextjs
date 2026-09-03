import type { GeoPlace } from '@/lib/weather/geocode';
import type { WeatherBundle } from '@/lib/weather/fetchWeather';

const searchCache = new Map<
  string,
  { at: number; results: GeoPlace[]; meta?: WeatherSearchMeta }
>();
const CACHE_TTL = 2 * 60 * 1000;

let searchAbort: AbortController | null = null;

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? res.statusText;
    throw new Error(msg);
  }
  return data as T;
}

export async function fetchWeatherAuto(): Promise<WeatherBundle> {
  const res = await fetch('/api/weather?auto=1', { cache: 'no-store' });
  return parseJson(res);
}

export async function fetchWeatherByQuery(q: string): Promise<WeatherBundle> {
  const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  return parseJson(res);
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherBundle> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { cache: 'no-store' });
  return parseJson(res);
}

export type WeatherSearchMeta = {
  provider: string;
  googleKeyPresent: boolean;
  googleStatus?: string;
};

export type WeatherSearchResponse = {
  results: GeoPlace[];
  meta?: WeatherSearchMeta;
};

export async function searchWeatherPlaces(
  q: string
): Promise<{ results: GeoPlace[]; meta?: WeatherSearchMeta }> {
  const key = q.trim().toLowerCase();
  if (key.length < 2) return { results: [] };

  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return { results: hit.results, meta: hit.meta };
  }

  searchAbort?.abort();
  searchAbort = new AbortController();

  try {
    const res = await fetch(`/api/weather/search?q=${encodeURIComponent(key)}`, {
      cache: 'no-store',
      signal: searchAbort.signal,
    });
    const data = await parseJson<WeatherSearchResponse>(res);
    if (typeof window !== 'undefined' && data.meta) {
      console.info('[weather search]', q, data.meta, `${data.results.length} results`);
    }
    searchCache.set(key, { at: Date.now(), results: data.results, meta: data.meta });
    return { results: data.results, meta: data.meta };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return { results: [] };
    throw e;
  }
}

export function prefetchSearch(q: string): void {
  if (q.trim().length >= 2) void searchWeatherPlaces(q).catch(() => {});
}
