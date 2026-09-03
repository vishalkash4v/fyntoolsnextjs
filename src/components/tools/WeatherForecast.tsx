'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  Navigation,
  RefreshCw,
  Shirt,
  Activity,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CopyButton from '@/components/common/CopyButton';
import WeatherHeroCard from '@/components/tools/weather/WeatherHeroCard';
import { formatPlaceLabel, type GeoPlace } from '@/lib/weather/geocode';
import type { WeatherBundle } from '@/lib/weather/fetchWeather';
import type { WeatherCategory } from '@/lib/weather/wmoCodes';
import { getWeatherIconColor } from '@/lib/weather/heroStyles';
import {
  aqiLabel,
  buildWeatherSummary,
  formatTemp,
  getActivityTips,
  getBestOutdoorWindow,
  getWhatToWear,
  uvAdvice,
  windMsToKmh,
} from '@/lib/weather/weatherInsights';
import {
  fetchWeatherAuto,
  fetchWeatherByCoords,
  fetchWeatherByQuery,
  searchWeatherPlaces,
} from '@/lib/weather/clientApi';

const RECENT_KEY = 'fyn-weather-recent';
const UNIT_KEY = 'fyn-weather-unit';

type TempUnit = 'c' | 'f';

function loadRecent(): GeoPlace[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as GeoPlace[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(place: GeoPlace) {
  try {
    const list = loadRecent().filter(
      (p) => p.latitude !== place.latitude || p.longitude !== place.longitude
    );
    list.unshift(place);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* ignore */
  }
}

const WeatherForecast = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [recent, setRecent] = useState<GeoPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<TempUnit>('c');
  const initialLoad = useRef(false);
  const isEditingSearch = useRef(false);
  const searchSeq = useRef(0);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(UNIT_KEY);
    if (saved === 'c' || saved === 'f') setUnit(saved);
    setRecent(loadRecent());
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const el = searchWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDropdownRect({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!showSuggestions || suggestions.length === 0) {
      setDropdownRect(null);
      return;
    }
    updateDropdownPosition();
    const onMove = () => updateDropdownPosition();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [showSuggestions, suggestions.length, updateDropdownPosition]);

  const syncSearchToPlace = useCallback((place: GeoPlace) => {
    isEditingSearch.current = false;
    setShowSuggestions(false);
    setSearchQuery(formatPlaceLabel(place));
    setSuggestions([]);
  }, []);

  const applyBundle = useCallback(
    (bundle: WeatherBundle, quiet = false) => {
      setWeather(bundle);
      syncSearchToPlace(bundle.place);
      saveRecent(bundle.place);
      setRecent(loadRecent());
      setError('');
      if (!quiet) {
        toast({ title: 'Weather updated', description: formatPlaceLabel(bundle.place) });
      }
    },
    [syncSearchToPlace, toast]
  );

  const loadFromApi = useCallback(
    async (loader: () => Promise<WeatherBundle>, quiet = false) => {
      setLoading(true);
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      try {
        const bundle = await loader();
        applyBundle(bundle, quiet);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load weather';
        setError(msg);
        if (!quiet) toast({ title: 'Error', description: msg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    },
    [applyBundle, toast]
  );

  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;
    void loadFromApi(fetchWeatherAuto, true);
  }, [loadFromApi]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q || q === 'Detecting your location…') {
      setError('Enter a city name');
      return;
    }
    isEditingSearch.current = false;
    void loadFromApi(() => fetchWeatherByQuery(q));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    isEditingSearch.current = false;
    setShowSuggestions(false);
    setSearchQuery('Detecting your location…');
    setSuggestions([]);
    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await loadFromApi(
            () => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            true
          );
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Location denied — search your city or we use your IP region.');
        setLocating(false);
        if (weather) syncSearchToPlace(weather.place);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const loadPlace = (place: GeoPlace) => {
    isEditingSearch.current = false;
    setShowSuggestions(false);
    syncSearchToPlace(place);
    void loadFromApi(() =>
      fetchWeatherByCoords(place.latitude, place.longitude)
    );
  };

  // Fast autocomplete — 150ms debounce, stale-request guard
  useEffect(() => {
    if (!isEditingSearch.current) return;
    const q = searchQuery.trim();
    if (q.length < 2 || q === 'Detecting your location…') {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchWeatherPlaces(q);
        if (seq === searchSeq.current) {
          setSuggestions(results.slice(0, 10));
          setShowSuggestions(results.length > 0 && isEditingSearch.current);
        }
      } catch {
        if (seq === searchSeq.current) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 150);

    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleInputChange = (value: string) => {
    isEditingSearch.current = true;
    setSearchQuery(value);
  };

  const getWeatherIcon = (category: WeatherCategory, isLarge = false, onHero = false) => {
    const size = isLarge ? 'h-16 w-16' : 'h-6 w-6';
    const color = getWeatherIconColor(category, onHero);
    switch (category) {
      case 'clear':
        return <Sun className={`${size} ${color}`} />;
      case 'clouds':
        return <Cloud className={`${size} ${color}`} />;
      case 'fog':
        return <CloudFog className={`${size} ${color}`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${size} ${color}`} />;
      case 'snow':
        return <CloudSnow className={`${size} ${color}`} />;
      case 'thunderstorm':
        return <Zap className={`${size} ${color}`} />;
    }
  };

  const windCompass = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const insights = useMemo(() => {
    if (!weather) return null;
    return {
      tips: getActivityTips(weather),
      wear: getWhatToWear(weather),
      outdoor: getBestOutdoorWindow(weather),
      uv: uvAdvice(weather.daily[0]?.uvMax ?? weather.current.uvIndex),
      aqi: weather.airQuality ? aqiLabel(weather.airQuality.usAqi) : null,
      summary: buildWeatherSummary(weather, unit),
    };
  }, [weather, unit]);

  const toggleUnit = (u: TempUnit) => {
    setUnit(u);
    localStorage.setItem(UNIT_KEY, u);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className={showSuggestions && suggestions.length > 0 ? 'relative z-[60]' : 'relative z-10'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Weather Forecast</CardTitle>
          <CardDescription className="text-xs sm:text-sm leading-relaxed">
            Forecasts are served through the <strong>FYN Weather Gateway</strong> on our servers,
            blended with open weather models (Open-Meteo and partners) for accurate, location-exact
            conditions — free, no signup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 overflow-visible">
          {/* Compact search row */}
          <div className="flex items-stretch gap-1.5 sm:gap-2">
            <div ref={searchWrapRef} className="relative min-w-0 flex-1">
              <Input
                placeholder="Search area, village, city…"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (weather && searchQuery === formatPlaceLabel(weather.place)) {
                    isEditingSearch.current = true;
                  }
                  if (suggestions.length > 0 && isEditingSearch.current) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // delay so click on portal item still registers
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="h-9 text-sm pr-8"
                aria-label="Search location"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-autocomplete="list"
              />
              {searching && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground pointer-events-none" />
              )}
            </div>

            <Button
              type="button"
              size="sm"
              className="h-9 px-3 shrink-0"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? '…' : 'Go'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-2.5 shrink-0 gap-1"
              onClick={handleUseLocation}
              disabled={loading || locating}
              title="Use GPS"
              aria-label="My location"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span className="hidden xs:inline sm:inline text-xs">
                {locating ? '…' : 'GPS'}
              </span>
            </Button>

            {weather && (
              <>
                <div
                  className="inline-flex h-9 items-center rounded-md border bg-muted/40 p-0.5 shrink-0"
                  role="group"
                  aria-label="Temperature unit"
                >
                  <button
                    type="button"
                    className={`h-7 min-w-[28px] rounded px-1.5 text-[11px] font-semibold transition-colors ${
                      unit === 'c' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => toggleUnit('c')}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    className={`h-7 min-w-[28px] rounded px-1.5 text-[11px] font-semibold transition-colors ${
                      unit === 'f' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                    onClick={() => toggleUnit('f')}
                  >
                    °F
                  </button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() =>
                    void loadFromApi(() =>
                      fetchWeatherByCoords(weather.place.latitude, weather.place.longitude)
                    )
                  }
                  disabled={loading}
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </>
            )}
          </div>

          {recent.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-muted-foreground shrink-0">Recent</span>
              {recent.map((p) => (
                <button
                  key={`${p.latitude}-${p.longitude}`}
                  type="button"
                  className="h-6 rounded-full border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  onClick={() => loadPlace(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground leading-snug">
            Location search uses Google Places when configured, otherwise open geocoders. Weather
            data is fetched via FYN servers from open multi-model forecasts for accuracy.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {typeof document !== 'undefined' &&
        showSuggestions &&
        suggestions.length > 0 &&
        dropdownRect &&
        createPortal(
          <ul
            role="listbox"
            className="fixed z-[9999] rounded-md border bg-popover text-popover-foreground shadow-2xl max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
          >
            {suggestions.map((s, i) => (
              <li key={`${s.latitude}-${s.longitude}-${i}`} role="option">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent active:bg-accent/80 transition-colors border-b last:border-b-0 border-border/40"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => loadPlace(s)}
                >
                  <span className="font-medium">{s.name}</span>
                  {(s.admin1 || s.country) && (
                    <span className="text-muted-foreground">
                      {` · ${[s.admin1, s.country].filter(Boolean).join(', ')}`}
                    </span>
                  )}
                  {s.source === 'Google Places' && (
                    <span className="ml-1 text-[10px] text-muted-foreground/70">Maps</span>
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}

      {loading && !weather && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Loading weather for your region…</p>
          </CardContent>
        </Card>
      )}

      {weather && insights && (
        <>
          <WeatherHeroCard
            weather={weather}
            unit={unit}
            windCompass={windCompass}
            renderIcon={(isLarge, onHero) =>
              getWeatherIcon(weather.current.category, isLarge, onHero)
            }
          />

          {/* Unique value: health + planning row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Air Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weather.airQuality && insights.aqi ? (
                  <>
                    <div className="text-2xl font-bold">{weather.airQuality.usAqi}</div>
                    <p className={`text-sm font-medium ${insights.aqi.color}`}>{insights.aqi.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insights.aqi.advice}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PM2.5: {weather.airQuality.pm25.toFixed(1)} · PM10: {weather.airQuality.pm10.toFixed(1)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Air quality data unavailable for this area.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  UV Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(weather.daily[0]?.uvMax ?? weather.current.uvIndex).toFixed(1)}
                </div>
                <p className="text-sm font-medium">{insights.uv.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{insights.uv.tip}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Best Time Outdoors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.outdoor ? (
                  <>
                    <div className="text-lg font-bold">{insights.outdoor.hourLabel}</div>
                    <p className="text-xs text-muted-foreground mt-1">{insights.outdoor.reason}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not enough hourly data.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-primary" />
                  What to Wear
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {insights.wear.slice(0, 4).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Activity planner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Planner
              </CardTitle>
              <CardDescription>Smart tips based on rain, heat, UV &amp; air quality — unique to FYN Tools.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.tips.map((tip) => (
                  <div
                    key={tip.title}
                    className={`flex gap-3 p-3 rounded-lg border ${
                      tip.level === 'good'
                        ? 'bg-green-500/5 border-green-500/20'
                        : tip.level === 'ok'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{tip.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{tip.title}</div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tip.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <CopyButton
                  textToCopy={insights.summary}
                  copyText="Copy weather report"
                  successMessage="Weather summary copied!"
                  variant="outline"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rain probability timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rain Probability — Next 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 items-end h-24 overflow-x-auto pb-2">
                {weather.hourly.map((h) => {
                  const pct = h.precipitationProb ?? 0;
                  return (
                    <div key={h.time} className="flex flex-col items-center min-w-[36px] gap-1 shrink-0">
                      <div className="w-full flex items-end justify-center h-16">
                        <div
                          className="w-5 rounded-t bg-blue-500/80 dark:bg-blue-400/80 transition-all"
                          style={{ height: `${Math.max(4, pct)}%` }}
                          title={`${pct}%`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{h.hourLabel.replace(' ', '')}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next 24 Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {weather.hourly.map((h) => (
                  <div
                    key={h.time}
                    className="flex flex-col items-center min-w-[72px] p-3 rounded-lg bg-muted/50 shrink-0"
                  >
                    <span className="text-xs text-muted-foreground mb-1">{h.hourLabel}</span>
                    {getWeatherIcon(h.category)}
                    <span className="font-semibold mt-2 tabular-nums">{formatTemp(h.temperature, unit)}</span>
                    {h.precipitationProb > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">{h.precipitationProb}%</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weather.daily.map((day) => (
                  <div key={day.date} className="text-center p-4 rounded-lg bg-muted/50 border">
                    <div className="font-semibold mb-2 text-sm">{day.dayLabel}</div>
                    <div className="flex justify-center mb-2">{getWeatherIcon(day.category)}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-2 line-clamp-2">
                      {day.description}
                    </div>
                    <div className="font-semibold text-sm tabular-nums">
                      {formatTemp(day.tempMax, unit)} / {formatTemp(day.tempMin, unit)}
                    </div>
                    {day.precipitationProb > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Rain {day.precipitationProb}%
                      </div>
                    )}
                    {day.uvMax > 0 && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        UV {day.uvMax.toFixed(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
            Weather served via the <strong>FYN Weather Gateway</strong> on our servers, using open
            multi-model forecasts (
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">
              Open-Meteo
            </a>
            , CC BY 4.0) for accurate local conditions. Location search prefers Google Places when
            configured.
          </p>
        </>
      )}
    </div>
  );
};

export default WeatherForecast;
