import type { GeoPlace } from '@/lib/weather/geocode';
import type { WeatherBundle } from '@/lib/weather/fetchWeather';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? res.statusText;
    throw new Error(msg);
  }
  return data as T;
}

/** Client → same-origin API (no external keys, no CORS issues). */
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

export async function searchWeatherPlaces(q: string): Promise<GeoPlace[]> {
  const res = await fetch(`/api/weather/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  const data = await parseJson<{ results: GeoPlace[] }>(res);
  return data.results;
}
