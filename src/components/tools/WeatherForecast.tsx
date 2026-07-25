'use client';

import React, { useState, useEffect } from 'react';
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
  Zap, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  clouds: {
    all: number;
  };
}

interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
    dt_txt: string;
  }[];
}

const WeatherForecast = () => {
  const [city, setCity] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (apiKey) {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [apiKey]);

  const getWeatherIcon = (weatherMain: string, isLarge: boolean = false) => {
    const size = isLarge ? 'h-16 w-16' : 'h-6 w-6';
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'clouds':
        return <Cloud className={`${size} text-gray-500`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${size} text-blue-500`} />;
      case 'snow':
        return <CloudSnow className={`${size} text-blue-200`} />;
      case 'thunderstorm':
        return <Zap className={`${size} text-purple-500`} />;
      default:
        return <Sun className={`${size} text-yellow-500`} />;
    }
  };

  const getWeatherBackground = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400';
      case 'clouds':
        return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
      case 'rain':
      case 'drizzle':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
      case 'snow':
        return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300';
      case 'thunderstorm':
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-gray-800';
      default:
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    if (!apiKey) {
      setError('Please enter your OpenWeatherMap API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const currentData = await currentResponse.json();
      setCurrentWeather(currentData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
      }

      toast({
        title: "Weather data loaded",
        description: `Showing weather for ${currentData.name}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    if (!apiKey) {
      setError('Please enter your OpenWeatherMap API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error('City not found or API key invalid');
      }
      
      const currentData = await currentResponse.json();
      setCurrentWeather(currentData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
      }

      toast({
        title: "Weather data loaded",
        description: `Showing weather for ${currentData.name}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please check your city name and API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    
    const dailyData: { [key: string]: any } = {};
    
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temps: [item.main.temp],
          weather: item.weather[0],
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
        };
      } else {
        dailyData[date].temps.push(item.main.temp);
      }
    });

    return Object.values(dailyData).slice(0, 5).map((day: any) => ({
      ...day,
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps)
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* API Key Input */}
      {!currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Weather Forecast</CardTitle>
            <CardDescription>
              Enter your free OpenWeatherMap API key to get started. 
              <a 
                href="https://openweathermap.org/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Get your free API key here
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your OpenWeatherMap API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name (e.g., London, New York)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeatherByCity()}
            />
            <Button 
              onClick={fetchWeatherByCity} 
              disabled={loading || !apiKey}
              className="shrink-0"
            >
              {loading ? 'Loading...' : 'Get Weather'}
            </Button>
          </div>
          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Weather */}
      {currentWeather && (
        <Card 
          className={`${getWeatherBackground(currentWeather.weather[0].main)} text-white relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  {currentWeather.name}, {currentWeather.sys.country}
                </h2>
                <p className="text-xl opacity-90 capitalize">
                  {currentWeather.weather[0].description}
                </p>
              </div>
              {getWeatherIcon(currentWeather.weather[0].main, true)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {Math.round(currentWeather.main.temp)}°C
                </div>
                <p className="opacity-80">
                  Feels like {Math.round(currentWeather.main.feels_like)}°C
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  <span>High: {Math.round(currentWeather.main.temp_max)}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  <span>Low: {Math.round(currentWeather.main.temp_min)}°C</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  <span>Humidity: {currentWeather.main.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5" />
                  <span>Wind: {Math.round(currentWeather.wind.speed)} m/s</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  <span>Pressure: {currentWeather.main.pressure} hPa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>Visibility: {(currentWeather.visibility / 1000).toFixed(1)} km</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5" />
                <span>Sunrise: {formatTime(currentWeather.sys.sunrise)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-5 w-5" />
                <span>Sunset: {formatTime(currentWeather.sys.sunset)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5-Day Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="font-semibold mb-2">
                    {index === 0 ? 'Today' : day.day}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.weather.main)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize mb-2">
                    {day.weather.description}
                  </div>
                  <div className="font-semibold">
                    {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherForecast;
