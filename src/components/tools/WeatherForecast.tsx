'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sunrise,
  Sunset,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  type GeoPlace,
  formatPlaceLabel,
  resolvePlace,
  reverseGeocode,
  searchPlaces,
} from '@/lib/weather/geocode';
import { fetchWeatherBundle, type WeatherBundle } from '@/lib/weather/fetchWeather';
import type { WeatherCategory } from '@/lib/weather/wmoCodes';

const WeatherForecast = () => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<GeoPlace[]>([]);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const loadWeather = useCallback(
    async (place: GeoPlace) => {
      setLoading(true);
      setError('');
      setSuggestions([]);

      try {
        const bundle = await fetchWeatherBundle(place);
        setWeather(bundle);
        toast({
          title: 'Weather loaded',
          description: formatPlaceLabel(bundle.place),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch weather';
        setError(msg);
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleSearch = async (query?: string) => {
    const q = (query ?? city).trim();
    if (!q) {
      setError('Enter a city name');
      return;
    }
    const place = await resolvePlace(q);
    if (!place) {
      setError(`No location found for "${q}". Try a nearby major city.`);
      return;
    }
    await loadWeather(place);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const place =
            (await reverseGeocode(latitude, longitude)) ?? {
              name: 'Your location',
              country: '',
              countryCode: '',
              latitude,
              longitude,
              timezone: 'auto',
              source: 'GPS',
            };
          await loadWeather(place);
        } catch {
          setError('Could not load weather for your location.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Location access denied. Search for your city instead.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000 }
    );
  };

  // Debounced city suggestions
  useEffect(() => {
    if (city.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const results = await searchPlaces(city);
      setSuggestions(results.slice(0, 5));
    }, 350);
    return () => clearTimeout(t);
  }, [city]);

  const getWeatherIcon = (category: WeatherCategory, isLarge = false) => {
    const size = isLarge ? 'h-16 w-16' : 'h-6 w-6';
    switch (category) {
      case 'clear':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'clouds':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'fog':
        return <CloudFog className={`${size} text-gray-400`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${size} text-blue-500`} />;
      case 'snow':
        return <CloudSnow className={`${size} text-blue-200`} />;
      case 'thunderstorm':
        return <Zap className={`${size} text-purple-500`} />;
    }
  };

  const getWeatherBackground = (category: WeatherCategory) => {
    switch (category) {
      case 'clear':
        return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400';
      case 'clouds':
        return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
      case 'fog':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
      case 'rain':
      case 'drizzle':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
      case 'snow':
        return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300';
      case 'thunderstorm':
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-gray-800';
    }
  };

  const windCompass = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Weather Forecast</CardTitle>
          <CardDescription>
            Free worldwide forecasts — no API key. Powered by{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open-Meteo
            </a>{' '}
            (30+ weather models) with OpenStreetMap geocoding fallback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search city (e.g. Mumbai, London, Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md text-sm max-h-48 overflow-auto">
                  {suggestions.map((s, i) => (
                    <li key={`${s.latitude}-${s.longitude}-${i}`}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                        onClick={() => {
                          setCity(formatPlaceLabel(s));
                          loadWeather(s);
                        }}
                      >
                        {formatPlaceLabel(s)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button onClick={() => handleSearch()} disabled={loading} className="shrink-0">
              {loading ? 'Loading…' : 'Get Weather'}
            </Button>
            <Button
              variant="outline"
              onClick={handleUseLocation}
              disabled={loading || locating}
              className="shrink-0 gap-2"
            >
              <Navigation className="h-4 w-4" />
              {locating ? 'Locating…' : 'My Location'}
            </Button>
            {weather && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => loadWeather(weather.place)}
                disabled={loading}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Weather */}
      {weather && (
        <>
          <Card
            className={`${getWeatherBackground(weather.current.category)} text-white relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <CardContent className="relative pt-6">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <MapPin className="h-6 w-6 shrink-0" />
                    {formatPlaceLabel(weather.place)}
                  </h2>
                  <p className="text-lg opacity-90 capitalize mt-1">{weather.current.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {weather.sources.map((s) => (
                      <Badge key={s} variant="secondary" className="bg-white/20 text-white border-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                {getWeatherIcon(weather.current.category, true)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold mb-2">
                    {Math.round(weather.current.temperature)}°C
                  </div>
                  <p className="opacity-80">Feels like {Math.round(weather.current.feelsLike)}°C</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    <span>
                      High: {Math.round(weather.daily[0]?.tempMax ?? weather.current.temperature)}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    <span>
                      Low: {Math.round(weather.daily[0]?.tempMin ?? weather.current.temperature)}°C
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    <span>Humidity: {weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    <span>
                      Wind: {weather.current.windSpeed.toFixed(1)} m/s{' '}
                      {windCompass(weather.current.windDirection)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    <span>Pressure: {weather.current.pressure} hPa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    <span>Cloud cover: {weather.current.cloudCover}%</span>
                  </div>
                </div>
              </div>

              {weather.daily[0] && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-5 w-5" />
                    <span>Sunrise: {weather.daily[0].sunrise}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="h-5 w-5" />
                    <span>Sunset: {weather.daily[0].sunset}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hourly */}
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
                    <span className="font-semibold mt-2">{Math.round(h.temperature)}°</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weather.daily.map((day) => (
                  <div key={day.date} className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="font-semibold mb-2 text-sm">{day.dayLabel}</div>
                    <div className="flex justify-center mb-2">{getWeatherIcon(day.category)}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-2 line-clamp-2">
                      {day.description}
                    </div>
                    <div className="font-semibold text-sm">
                      {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
                    </div>
                    {day.precipitationProb > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        💧 {day.precipitationProb}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            Weather data by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">
              Open-Meteo.com
            </a>{' '}
            (CC BY 4.0). Geocoding via Open-Meteo &amp; OpenStreetMap/Photon.
          </p>
        </>
      )}
    </div>
  );
};

export default WeatherForecast;
