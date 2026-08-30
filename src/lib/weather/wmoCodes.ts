/** WMO weather codes used by Open-Meteo — https://open-meteo.com/en/docs */

export type WeatherCategory =
  | 'clear'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export function wmoToCategory(code: number): WeatherCategory {
  if (code === 0) return 'clear';
  if (code <= 3) return 'clouds';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  return 'thunderstorm';
}

export function wmoToDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] ?? 'Unknown';
}

/** Map WMO category to legacy OpenWeather-style main label for UI helpers. */
export function categoryToMain(category: WeatherCategory): string {
  switch (category) {
    case 'clear':
      return 'Clear';
    case 'clouds':
      return 'Clouds';
    case 'fog':
      return 'Fog';
    case 'drizzle':
      return 'Drizzle';
    case 'rain':
      return 'Rain';
    case 'snow':
      return 'Snow';
    case 'thunderstorm':
      return 'Thunderstorm';
  }
}
