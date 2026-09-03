import { type GeoPlace } from '@/lib/weather/geocode';
import { fetchJson } from '@/lib/weather/http';
import { categoryToMain, wmoToCategory, wmoToDescription, type WeatherCategory } from '@/lib/weather/wmoCodes';

export type AirQuality = {
  usAqi: number;
  europeanAqi: number;
  pm25: number;
  pm10: number;
};

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
  uvIndex: number;
  precipitation: number;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  dayLabel: string;
  tempMin: number;
  tempMax: number;
  precipitationProb: number;
  precipitationSum: number;
  windGustMax: number;
  uvMax: number;
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
  precipitationProb: number;
  humidity: number;
};

export type WeatherBundle = {
  place: GeoPlace;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  airQuality: AirQuality | null;
  sources: string[];
  fetchedAt: string;
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
    uv_index?: number;
    precipitation?: number;
    is_day?: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    wind_gusts_10m_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability?: number[];
    relative_humidity_2m?: number[];
  };
};

type OpenMeteoAir = {
  current?: {
    us_aqi?: number;
    european_aqi?: number;
    pm2_5?: number;
    pm10?: number;
  };
};

const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
  'uv_index',
  'precipitation',
  'is_day',
].join(',');

const DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_gusts_10m_max',
  'uv_index_max',
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

async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality | null> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=us_aqi,european_aqi,pm2_5,pm10`;
  const data = await fetchJson<OpenMeteoAir>(url, { cache: 'no-store' });
  const c = data?.current;
  if (!c?.us_aqi && !c?.european_aqi) return null;
  return {
    usAqi: Math.round(c.us_aqi ?? c.european_aqi ?? 0),
    europeanAqi: Math.round(c.european_aqi ?? 0),
    pm25: c.pm2_5 ?? 0,
    pm10: c.pm10 ?? 0,
  };
}

function parseOpenMeteo(data: OpenMeteoForecast, place: GeoPlace, airQuality: AirQuality | null): WeatherBundle | null {
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
      precipitationSum: data.daily!.precipitation_sum?.[i] ?? 0,
      windGustMax: data.daily!.wind_gusts_10m_max?.[i] ?? 0,
      uvMax: data.daily!.uv_index_max?.[i] ?? 0,
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
      precipitationProb: data.hourly!.precipitation_probability?.[i] ?? 0,
      humidity: data.hourly!.relative_humidity_2m?.[i] ?? 0,
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
      uvIndex: cur.uv_index ?? 0,
      precipitation: cur.precipitation ?? 0,
      isDay: (cur.is_day ?? 1) === 1,
    },
    daily,
    hourly,
    airQuality,
    sources: ['FYN Weather Gateway', 'Open-Meteo (30+ models)', place.source],
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchOpenMeteo(place: GeoPlace): Promise<WeatherBundle | null> {
  const tz = place.timezone === 'auto' ? 'auto' : encodeURIComponent(place.timezone);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=${CURRENT_PARAMS}&daily=${DAILY_PARAMS}` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,relative_humidity_2m` +
    `&timezone=${tz}&forecast_days=7&wind_speed_unit=ms&precipitation_unit=mm&cell_selection=land`;

  const [data, airQuality] = await Promise.all([
    fetchJson<OpenMeteoForecast>(url, { cache: 'no-store' }),
    fetchAirQuality(place.latitude, place.longitude),
  ]);

  if (!data) return null;
  const bundle = parseOpenMeteo(data, place, airQuality);
  if (bundle && airQuality) {
    bundle.sources.push('Open-Meteo Air Quality');
  }
  return bundle;
}

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
      precipitationSum: 0,
      windGustMax: 0,
      uvMax: 0,
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
      precipitationProb: 0,
      humidity: 0,
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
      uvIndex: 0,
      precipitation: 0,
      isDay: true,
    },
    daily,
    hourly,
    airQuality: null,
    sources: ['FYN Weather Gateway', 'wttr.in (fallback)', place.source],
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchWeatherBundle(place: GeoPlace): Promise<WeatherBundle> {
  const primary = await fetchOpenMeteo(place);
  if (primary) return primary;

  const fallback = await fetchWttrIn(place);
  if (fallback) return fallback;

  throw new Error('Weather services are temporarily unavailable. Please try again shortly.');
}
