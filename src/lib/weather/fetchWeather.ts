import { type GeoPlace } from '@/lib/weather/geocode';
import { fetchJson } from '@/lib/weather/http';
import { categoryToMain, wmoToCategory, wmoToDescription, type WeatherCategory } from '@/lib/weather/wmoCodes';

export type CurrentWeather = {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  weatherCode: number;
  category: WeatherCategory;
  description: string;
  main: string;
};

export type DailyForecast = {
  date: string;
  dayLabel: string;
  tempMin: number;
  tempMax: number;
  precipitationProb: number;
  weatherCode: number;
  category: WeatherCategory;
  description: string;
  main: string;
  sunrise: string;
  sunset: string;
};

export type HourlyForecast = {
  time: string;
  hourLabel: string;
  temperature: number;
  weatherCode: number;
  category: WeatherCategory;
  description: string;
  main: string;
};

export type WeatherBundle = {
  place: GeoPlace;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  sources: string[];
};

type OpenMeteoForecast = {
  timezone: string;
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    cloud_cover: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
};

const FORECAST_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
].join(',');

const DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
].join(',');

function dayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

function hourLabel(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

function formatSunTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function descToCategory(desc: string): WeatherCategory {
  const d = desc.toLowerCase();
  if (d.includes('thunder')) return 'thunderstorm';
  if (d.includes('snow') || d.includes('blizzard')) return 'snow';
  if (d.includes('rain') || d.includes('shower') || d.includes('drizzle')) return 'rain';
  if (d.includes('fog') || d.includes('mist')) return 'fog';
  if (d.includes('cloud') || d.includes('overcast')) return 'clouds';
  return 'clear';
}

function parseOpenMeteo(data: OpenMeteoForecast, place: GeoPlace): WeatherBundle | null {
  if (!data.current || !data.daily) return null;

  const resolvedPlace =
    place.timezone === 'auto' && data.timezone ? { ...place, timezone: data.timezone } : place;

  const cur = data.current;
  const curCategory = wmoToCategory(cur.weather_code);

  const daily: DailyForecast[] = data.daily.time.map((date, i) => {
    const code = data.daily!.weather_code[i];
    const cat = wmoToCategory(code);
    return {
      date,
      dayLabel: dayLabel(date, i),
      tempMin: data.daily!.temperature_2m_min[i],
      tempMax: data.daily!.temperature_2m_max[i],
      precipitationProb: data.daily!.precipitation_probability_max[i] ?? 0,
      weatherCode: code,
      category: cat,
      description: wmoToDescription(code),
      main: categoryToMain(cat),
      sunrise: formatSunTime(data.daily!.sunrise[i]),
      sunset: formatSunTime(data.daily!.sunset[i]),
    };
  });

  const hourly: HourlyForecast[] = (data.hourly?.time ?? []).slice(0, 24).map((time, i) => {
    const code = data.hourly!.weather_code[i];
    const cat = wmoToCategory(code);
    return {
      time,
      hourLabel: hourLabel(time),
      temperature: data.hourly!.temperature_2m[i],
      weatherCode: code,
      category: cat,
      description: wmoToDescription(code),
      main: categoryToMain(cat),
    };
  });

  return {
    place: resolvedPlace,
    current: {
      time: cur.time,
      temperature: cur.temperature_2m,
      feelsLike: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      windSpeed: cur.wind_speed_10m,
      windDirection: cur.wind_direction_10m,
      pressure: Math.round(cur.surface_pressure),
      cloudCover: cur.cloud_cover,
      weatherCode: cur.weather_code,
      category: curCategory,
      description: wmoToDescription(cur.weather_code),
      main: categoryToMain(curCategory),
    },
    daily,
    hourly,
    sources: ['Open-Meteo (30+ models)', place.source],
  };
}

/** Primary: Open-Meteo best-match forecast (free, open-source data). */
async function fetchOpenMeteo(place: GeoPlace): Promise<WeatherBundle | null> {
  const tz = place.timezone === 'auto' ? 'auto' : encodeURIComponent(place.timezone);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=${FORECAST_PARAMS}&daily=${DAILY_PARAMS}&hourly=temperature_2m,weather_code` +
    `&timezone=${tz}&forecast_days=7&wind_speed_unit=ms&cell_selection=land`;

  const data = await fetchJson<OpenMeteoForecast>(url, { cache: 'no-store' });
  if (!data) return null;
  return parseOpenMeteo(data, place);
}

/** Fallback: wttr.in (WorldWeatherOnline / open data mirror, no key). */
async function fetchWttrIn(place: GeoPlace): Promise<WeatherBundle | null> {
  const q = `${place.latitude},${place.longitude}`;
  type WttrDay = {
    date: string;
    maxtempC: string;
    mintempC: string;
    hourly: { time: string; tempC: string; weatherDesc: { value: string }[] }[];
  };
  type WttrJson = {
    current_condition?: {
      temp_C: string;
      FeelsLikeC: string;
      humidity: string;
      windspeedKmph: string;
      winddir16Point: string;
      pressure: string;
      cloudcover: string;
      weatherDesc: { value: string }[];
    }[];
    weather?: WttrDay[];
  };

  const data = await fetchJson<WttrJson>(
    `https://wttr.in/${encodeURIComponent(q)}?format=j1`,
    { cache: 'no-store' }
  );
  const cur = data?.current_condition?.[0];
  const days = data?.weather ?? [];
  if (!cur || days.length === 0) return null;

  const desc = cur.weatherDesc?.[0]?.value ?? 'Clear';
  const cat = descToCategory(desc);

  const daily: DailyForecast[] = days.slice(0, 7).map((d, i) => {
    const dayDesc = d.hourly?.[4]?.weatherDesc?.[0]?.value ?? desc;
    const dayCat = descToCategory(dayDesc);
    return {
      date: d.date,
      dayLabel: dayLabel(d.date, i),
      tempMin: parseFloat(d.mintempC),
      tempMax: parseFloat(d.maxtempC),
      precipitationProb: 0,
      weatherCode: 0,
      category: dayCat,
      description: dayDesc,
      main: categoryToMain(dayCat),
      sunrise: '—',
      sunset: '—',
    };
  });

  const hourly: HourlyForecast[] = (days[0]?.hourly ?? []).slice(0, 24).map((h) => {
    const hDesc = h.weatherDesc?.[0]?.value ?? desc;
    const hCat = descToCategory(hDesc);
    return {
      time: h.time,
      hourLabel: h.time,
      temperature: parseFloat(h.tempC),
      weatherCode: 0,
      category: hCat,
      description: hDesc,
      main: categoryToMain(hCat),
    };
  });

  const windKmh = parseFloat(cur.windspeedKmph) || 0;

  return {
    place,
    current: {
      time: new Date().toISOString(),
      temperature: parseFloat(cur.temp_C),
      feelsLike: parseFloat(cur.FeelsLikeC),
      humidity: parseInt(cur.humidity, 10) || 0,
      windSpeed: windKmh / 3.6,
      windDirection: 0,
      pressure: parseInt(cur.pressure, 10) || 0,
      cloudCover: parseInt(cur.cloudcover, 10) || 0,
      weatherCode: 0,
      category: cat,
      description: desc,
      main: categoryToMain(cat),
    },
    daily,
    hourly,
    sources: ['wttr.in (fallback)', place.source],
  };
}

/** Multi-provider fetch — Open-Meteo first, wttr.in fallback. No API keys. */
export async function fetchWeatherBundle(place: GeoPlace): Promise<WeatherBundle> {
  const primary = await fetchOpenMeteo(place);
  if (primary) return primary;

  const fallback = await fetchWttrIn(place);
  if (fallback) return fallback;

  throw new Error('Weather services are temporarily unavailable. Please try again shortly.');
}
