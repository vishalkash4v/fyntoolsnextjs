/** Theme-safe hero styling — saturated gradients readable in light & dark mode. */

import type { WeatherCategory } from '@/lib/weather/wmoCodes';

export type HeroStyles = {
  gradient: string;
  overlay: string;
  text: string;
  badge: string;
  border: string;
  iconClass: string;
};

export function getWeatherHeroStyles(category: WeatherCategory): HeroStyles {
  const base = {
    overlay: 'bg-black/35',
    text: 'text-white drop-shadow-sm',
    badge: 'bg-white/25 text-white border-white/30 backdrop-blur-sm',
    border: 'border-white/20',
    iconClass: 'text-white drop-shadow-md',
  };

  switch (category) {
    case 'clear':
      return { ...base, gradient: 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700' };
    case 'clouds':
      return { ...base, gradient: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900' };
    case 'fog':
      return { ...base, gradient: 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800' };
    case 'rain':
    case 'drizzle':
      return { ...base, gradient: 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900' };
    case 'snow':
      return { ...base, gradient: 'bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900' };
    case 'thunderstorm':
      return { ...base, gradient: 'bg-gradient-to-br from-violet-800 via-purple-900 to-slate-950' };
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
      return 'text-slate-400';
    case 'rain':
    case 'drizzle':
      return 'text-blue-500';
    case 'snow':
      return 'text-sky-400';
    case 'thunderstorm':
      return 'text-violet-500';
  }
}
