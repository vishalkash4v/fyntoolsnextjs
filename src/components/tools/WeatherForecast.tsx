'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const syncSearchToPlace = useCallback((place: GeoPlace) => {
    isEditingSearch.current = false;
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
    syncSearchToPlace(place);
    void loadFromApi(() =>
      fetchWeatherByCoords(place.latitude, place.longitude)
    );
  };

  // Fast autocomplete — 120ms debounce, stale-request guard
  useEffect(() => {
    if (!isEditingSearch.current) return;
    const q = searchQuery.trim();
    if (q.length < 2 || q === 'Detecting your location…') {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchWeatherPlaces(q);
        if (seq === searchSeq.current) setSuggestions(results.slice(0, 6));
      } catch {
        if (seq === searchSeq.current) setSuggestions([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 120);

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex flex-wrap items-center gap-2">
            Free Weather Forecast
            <Badge variant="secondary" className="font-normal text-xs">
              No signup · No ads · Open data
            </Badge>
          </CardTitle>
          <CardDescription>
            Accurate 7-day forecast with air quality, UV index &amp; activity tips — powered by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Open-Meteo
            </a>{' '}
            (30+ models). Alternative to AccuWeather &amp; Weather.com — 100% free.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search — mobile-first responsive */}
          <div className="space-y-3">
            <div ref={searchWrapRef} className="relative w-full">
              <Input
                placeholder="Search city, town, or district…"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') setSuggestions([]);
                }}
                onFocus={() => {
                  if (weather && searchQuery === formatPlaceLabel(weather.place)) {
                    isEditingSearch.current = true;
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setSuggestions([]), 180);
                }}
                className="w-full h-11 sm:h-10 text-base sm:text-sm pr-10"
                aria-label="Search location"
                aria-expanded={suggestions.length > 0}
                aria-autocomplete="list"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
              )}
              {suggestions.length > 0 && isEditingSearch.current && (
                <ul
                  role="listbox"
                  className="absolute z-[100] left-0 right-0 top-[calc(100%+4px)] rounded-lg border bg-popover text-popover-foreground shadow-xl max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain"
                >
                  {suggestions.map((s, i) => (
                    <li key={`${s.latitude}-${s.longitude}-${i}`} role="option">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm sm:text-base hover:bg-accent active:bg-accent/80 transition-colors border-b last:border-b-0 border-border/50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => loadPlace(s)}
                      >
                        {formatPlaceLabel(s)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto h-11 sm:h-10">
                {loading ? 'Loading…' : 'Search'}
              </Button>
              <Button
                variant="outline"
                onClick={handleUseLocation}
                disabled={loading || locating}
                className="w-full sm:w-auto h-11 sm:h-10 gap-2"
              >
                <Navigation className="h-4 w-4 shrink-0" />
                <span className="truncate">{locating ? 'GPS…' : 'My Location'}</span>
              </Button>
              {weather && (
                <>
                  <Tabs value={unit} onValueChange={(v) => toggleUnit(v as TempUnit)} className="col-span-2 sm:col-span-1">
                    <TabsList className="h-11 sm:h-10 w-full sm:w-auto grid grid-cols-2">
                      <TabsTrigger value="c" className="text-sm">
                        °C
                      </TabsTrigger>
                      <TabsTrigger value="f" className="text-sm">
                        °F
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    variant="outline"
                    size="icon"
                    className="col-span-2 sm:col-span-1 h-11 sm:h-10 w-full sm:w-10"
                    onClick={() =>
                      void loadFromApi(() =>
                        fetchWeatherByCoords(weather.place.latitude, weather.place.longitude)
                      )
                    }
                    disabled={loading}
                    aria-label="Refresh weather"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="sm:hidden ml-2">Refresh</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
              {recent.map((p) => (
                <Button
                  key={`${p.latitude}-${p.longitude}`}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => loadPlace(p)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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

          <p className="text-xs text-center text-muted-foreground">
            Open-source weather by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">
              Open-Meteo.com
            </a>{' '}
            (CC BY 4.0) · Geocoding: OpenStreetMap · No API key required
          </p>
        </>
      )}
    </div>
  );
};

export default WeatherForecast;
