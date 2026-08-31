'use client';

import React, { useMemo } from 'react';
import type { WeatherCategory } from '@/lib/weather/wmoCodes';
import { getHeroTheme } from '@/lib/weather/heroStyles';

type Props = {
  category: WeatherCategory;
  isDay?: boolean;
};

/** iPhone-style ambient weather animations (CSS-only, lightweight). */
export default function WeatherHeroAnimation({ category, isDay = true }: Props) {
  const theme = getHeroTheme(category, isDay);
  const anim = theme.animation;

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 2.7 + (i % 5) * 3) % 100}%`,
        delay: `${(i * 0.13) % 2}s`,
        duration: `${0.55 + (i % 7) * 0.08}s`,
        opacity: 0.35 + (i % 4) * 0.12,
      })),
    []
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: `${(i * 3.1) % 100}%`,
        delay: `${(i * 0.2) % 4}s`,
        duration: `${2.5 + (i % 6) * 0.5}s`,
        size: 3 + (i % 4),
      })),
    []
  );

  return (
    <div className="weather-anim-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {anim === 'clear' && isDay && (
        <>
          <div className="weather-sun-glow absolute -top-8 -right-8 h-48 w-48 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="weather-sun absolute top-6 right-8 h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.55)]" />
          <div className="weather-sun-rays absolute top-6 right-8 h-20 w-20" />
        </>
      )}
      {anim === 'clear' && !isDay && (
        <>
          <div className="weather-moon absolute top-8 right-10 h-14 w-14 rounded-full bg-slate-200 shadow-[0_0_30px_rgba(226,232,240,0.4)]" />
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="weather-star absolute rounded-full bg-white"
              style={{
                width: 1 + (i % 2),
                height: 1 + (i % 2),
                top: `${8 + ((i * 17) % 55)}%`,
                left: `${5 + ((i * 23) % 85)}%`,
                opacity: 0.4 + (i % 3) * 0.2,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </>
      )}

      {(anim === 'clouds' || anim === 'fog') && (
        <>
          {isDay && (
            <>
              <div className="weather-sun-glow absolute -top-4 -right-4 h-36 w-36 rounded-full bg-amber-300/20 blur-2xl" />
              <div className="weather-sun absolute top-8 right-12 h-14 w-14 rounded-full bg-gradient-to-br from-amber-200/90 to-orange-400/90 shadow-[0_0_40px_rgba(251,191,36,0.4)] opacity-80" />
            </>
          )}
          <div className="weather-cloud weather-cloud-1 absolute top-[12%] -left-[10%] h-16 w-40 opacity-40" />
          <div className="weather-cloud weather-cloud-2 absolute top-[28%] -right-[5%] h-20 w-48 opacity-35" />
          <div className="weather-cloud weather-cloud-3 absolute top-[55%] left-[15%] h-14 w-36 opacity-30" />
        </>
      )}

      {anim === 'fog' && (
        <div className="weather-fog absolute inset-0 bg-gradient-to-t from-white/25 via-white/10 to-transparent" />
      )}

      {(anim === 'rain' || anim === 'drizzle' || anim === 'thunderstorm') &&
        rainDrops.map((d) => (
          <span
            key={d.id}
            className="weather-rain-drop absolute top-0 w-[2px] rounded-full bg-gradient-to-b from-transparent to-white/70"
            style={{
              left: d.left,
              height: anim === 'drizzle' ? 10 : 18,
              opacity: d.opacity,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}

      {anim === 'snow' &&
        snowFlakes.map((f) => (
          <span
            key={f.id}
            className="weather-snowflake absolute rounded-full bg-white/90"
            style={{
              left: f.left,
              width: f.size,
              height: f.size,
              animationDelay: f.delay,
              animationDuration: f.duration,
              top: '-5%',
            }}
          />
        ))}

      {anim === 'thunderstorm' && <div className="weather-lightning absolute inset-0 bg-white/0" />}
    </div>
  );
}
