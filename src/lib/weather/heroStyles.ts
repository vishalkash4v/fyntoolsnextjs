/** Hero background — inline CSS so glass-card / theme cannot override. */

import type { WeatherCategory } from '@/lib/weather/wmoCodes';

export type HeroTheme = {
  background: string;
  accent: string;
  animation: WeatherCategory;
};

export function getHeroTheme(category: WeatherCategory, isDay = true): HeroTheme {
  switch (category) {
    case 'clear':
      return {
        background: isDay
          ? 'linear-gradient(160deg, #b45309 0%, #c2410c 35%, #9f1239 70%, #7c2d12 100%)'
          : 'linear-gradient(160deg, #1e3a5f 0%, #312e81 40%, #1e1b4b 100%)',
        accent: '#fbbf24',
        animation: 'clear',
      };
    case 'clouds':
      return {
        background: 'linear-gradient(160deg, #64748b 0%, #475569 40%, #1e293b 75%, #0f172a 100%)',
        accent: '#94a3b8',
        animation: 'clouds',
      };
    case 'fog':
      return {
        background: 'linear-gradient(160deg, #78716c 0%, #57534e 50%, #292524 100%)',
        accent: '#d6d3d1',
        animation: 'fog',
      };
    case 'rain':
    case 'drizzle':
      return {
        background: 'linear-gradient(160deg, #1d4ed8 0%, #1e3a8a 45%, #172554 100%)',
        accent: '#60a5fa',
        animation: 'rain',
      };
    case 'snow':
      return {
        background: 'linear-gradient(160deg, #0369a1 0%, #1e40af 50%, #1e3a8a 100%)',
        accent: '#e0f2fe',
        animation: 'snow',
      };
    case 'thunderstorm':
      return {
        background: 'linear-gradient(160deg, #4c1d95 0%, #312e81 40%, #0f0f14 100%)',
        accent: '#a78bfa',
        animation: 'thunderstorm',
      };
  }
}

export function getWeatherIconColor(category: WeatherCategory, onHero = false): string {
  if (onHero) return 'text-white';
  switch (category) {
    case 'clear':
      return 'text-amber-500';
    case 'clouds':
      return 'text-slate-500';
    case 'fog':
      return 'text-stone-400';
    case 'rain':
    case 'drizzle':
      return 'text-blue-500';
    case 'snow':
      return 'text-sky-400';
    case 'thunderstorm':
      return 'text-violet-500';
  }
}
