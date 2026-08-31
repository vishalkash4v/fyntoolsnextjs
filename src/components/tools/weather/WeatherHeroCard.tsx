'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, Droplets, Wind, Gauge, Cloud, Sunrise, Sunset } from 'lucide-react';
import { formatPlaceLabel } from '@/lib/weather/geocode';
import type { WeatherBundle } from '@/lib/weather/fetchWeather';
import { getHeroTheme } from '@/lib/weather/heroStyles';
import { formatTemp, windMsToKmh } from '@/lib/weather/weatherInsights';
import WeatherHeroAnimation from '@/components/tools/weather/WeatherHeroAnimation';

type TempUnit = 'c' | 'f';

type Props = {
  weather: WeatherBundle;
  unit: TempUnit;
  windCompass: (deg: number) => string;
  renderIcon: (isLarge?: boolean, onHero?: boolean) => React.ReactNode;
};

/** Hero card — NOT using glass-card; inline gradient guarantees contrast in light mode. */
export default function WeatherHeroCard({ weather, unit, windCompass, renderIcon }: Props) {
  const theme = getHeroTheme(weather.current.category, weather.current.isDay);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-xl min-h-[300px]"
      style={{ background: theme.background }}
    >
      <WeatherHeroAnimation category={weather.current.category} isDay={weather.current.isDay} />

      {/* Dark scrim — ensures white text always readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="relative z-10 p-5 sm:p-6 md:p-8 text-white [&_*]:text-white [&_svg]:text-white">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              <span className="break-words">{formatPlaceLabel(weather.place)}</span>
            </h2>
            <p
              className="text-base sm:text-lg capitalize mt-1 opacity-95"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
            >
              {weather.current.description}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {weather.sources.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-[10px] sm:text-xs border-white/40 bg-black/25 text-white backdrop-blur-sm"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div className="shrink-0 drop-shadow-lg">{renderIcon(true, true)}</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="col-span-2 lg:col-span-1 text-center lg:text-left">
            <div
              className="text-4xl sm:text-5xl font-bold mb-1 tabular-nums"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
            >
              {formatTemp(weather.current.temperature, unit)}
            </div>
            <p className="text-sm sm:text-base opacity-90">
              Feels like {formatTemp(weather.current.feelsLike, unit)}
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>High: {formatTemp(weather.daily[0]?.tempMax ?? weather.current.temperature, unit)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>Low: {formatTemp(weather.daily[0]?.tempMin ?? weather.current.temperature, unit)}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>Humidity: {weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>
                Wind: {windMsToKmh(weather.current.windSpeed).toFixed(0)} km/h{' '}
                {weather.current.windDirection ? windCompass(weather.current.windDirection) : ''}
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>Pressure: {weather.current.pressure} hPa</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-90" />
              <span>Clouds: {weather.current.cloudCover}%</span>
            </div>
          </div>
        </div>

        {weather.daily[0]?.sunrise !== '—' && (
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 mt-6 pt-5 border-t border-white/25 text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span>Sunrise: {weather.daily[0].sunrise}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span>Sunset: {weather.daily[0].sunset}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
