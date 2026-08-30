import { type GeoPlace } from '@/lib/weather/geocode';
import { categoryToMain, wmoToCategory, wmoToDescription } from '@/lib/weather/wmoCodes';

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
  category: ReturnType<typeof wmoToCategory>;
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
  category: ReturnType<typeof wmoToCategory>;
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
  category: ReturnType<typeof wmoToCategory>;
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
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function hourLabel(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

function formatSunTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Fetch 7-day forecast + current conditions from Open-Meteo (free, no API key). */
export async function fetchWeatherBundle(place: GeoPlace): Promise<WeatherBundle> {
  const tz = place.timezone === 'auto' ? 'auto' : encodeURIComponent(place.timezone);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=${FORECAST_PARAMS}` +
    `&daily=${DAILY_PARAMS}` +
    `&hourly=temperature_2m,weather_code` +
    `&timezone=${tz}&forecast_days=7&wind_speed_unit=ms`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Weather service unavailable. Please try again in a moment.');
  }

  const data = (await res.json()) as OpenMeteoForecast;
  const resolvedPlace =
    place.timezone === 'auto' && data.timezone
      ? { ...place, timezone: data.timezone }
      : place;

  if (!data.current || !data.daily) {
    throw new Error('Incomplete weather data received.');
  }

  const cur = data.current;
  const curCategory = wmoToCategory(cur.weather_code);
  const current: CurrentWeather = {
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
  };

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

  const hourly: HourlyForecast[] = (data.hourly?.time ?? [])
    .slice(0, 24)
    .map((time, i) => {
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
    current,
    daily,
    hourly,
    sources: ['Open-Meteo', place.source],
  };
}
