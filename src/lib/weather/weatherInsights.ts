import type { WeatherBundle } from '@/lib/weather/fetchWeather';

export type ActivityTip = {
  icon: string;
  title: string;
  detail: string;
  level: 'good' | 'ok' | 'bad';
};

export type OutdoorWindow = {
  hourLabel: string;
  score: number;
  reason: string;
};

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function formatTemp(c: number, unit: 'c' | 'f'): string {
  return unit === 'c' ? `${Math.round(c)}°C` : `${Math.round(cToF(c))}°F`;
}

export function windMsToKmh(ms: number): number {
  return ms * 3.6;
}

export function windMsToMph(ms: number): number {
  return ms * 2.237;
}

export function aqiLabel(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-600', advice: 'Air quality is satisfactory.' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600', advice: 'Acceptable for most people.' };
  if (aqi <= 150) return { label: 'Unhealthy (sensitive)', color: 'text-orange-600', advice: 'Sensitive groups should limit outdoor exertion.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-600', advice: 'Everyone may feel effects — reduce outdoor time.' };
  if (aqi <= 300) return { label: 'Very unhealthy', color: 'text-purple-600', advice: 'Avoid prolonged outdoor activity.' };
  return { label: 'Hazardous', color: 'text-rose-700', advice: 'Stay indoors if possible.' };
}

export function uvAdvice(uv: number): { label: string; tip: string } {
  if (uv <= 2) return { label: 'Low', tip: 'Minimal sun protection needed.' };
  if (uv <= 5) return { label: 'Moderate', tip: 'Wear sunscreen if outside for long periods.' };
  if (uv <= 7) return { label: 'High', tip: 'Seek shade midday; SPF 30+ recommended.' };
  if (uv <= 10) return { label: 'Very high', tip: 'Reduce sun exposure 10am–4pm.' };
  return { label: 'Extreme', tip: 'Avoid direct sun — skin burns quickly.' };
}

export function getWhatToWear(bundle: WeatherBundle): string[] {
  const t = bundle.current.temperature;
  const rain = bundle.daily[0]?.precipitationProb ?? 0;
  const items: string[] = [];

  if (t >= 30) items.push('Light breathable clothing', 'Sunglasses & hat');
  else if (t >= 22) items.push('T-shirt or light top', 'Optional light layer for evening');
  else if (t >= 15) items.push('Long sleeves or light jacket', 'Comfortable trousers');
  else if (t >= 5) items.push('Warm jacket or sweater', 'Closed shoes');
  else items.push('Heavy coat', 'Gloves & warm layers');

  if (rain >= 40) items.push('Carry an umbrella or rain jacket');
  if (bundle.current.windSpeed > 8) items.push('Wind-resistant outer layer');
  if ((bundle.airQuality?.usAqi ?? 0) > 100) items.push('Consider a mask if sensitive to pollution');

  return items;
}

export function getActivityTips(bundle: WeatherBundle): ActivityTip[] {
  const t = bundle.current.temperature;
  const rain = bundle.daily[0]?.precipitationProb ?? 0;
  const uv = bundle.daily[0]?.uvMax ?? bundle.current.uvIndex ?? 0;
  const aqi = bundle.airQuality?.usAqi ?? 0;
  const wind = bundle.current.windSpeed;
  const humidity = bundle.current.humidity;

  const tips: ActivityTip[] = [];

  tips.push({
    icon: '🏃',
    title: 'Outdoor exercise',
    level: rain > 50 || t > 38 || t < -5 || aqi > 150 ? 'bad' : rain > 30 || t > 33 || aqi > 100 ? 'ok' : 'good',
    detail:
      rain > 50
        ? 'Rain likely — indoor workout is better.'
        : t > 38
          ? 'Heat stress risk — exercise early morning or indoors.'
          : aqi > 150
            ? 'Poor air quality — avoid strenuous outdoor activity.'
            : 'Good conditions for a run or walk.',
  });

  tips.push({
    icon: '🚗',
    title: 'Driving & commute',
    level: rain > 70 || bundle.current.category === 'fog' || bundle.current.category === 'thunderstorm' ? 'bad' : rain > 40 ? 'ok' : 'good',
    detail:
      bundle.current.category === 'fog'
        ? 'Fog — use low beams and extra following distance.'
        : rain > 70
          ? 'Heavy rain possible — plan extra travel time.'
          : 'Road conditions look manageable.',
  });

  tips.push({
    icon: '👕',
    title: 'Laundry & drying',
    level: rain > 60 || humidity > 85 ? 'bad' : rain > 35 ? 'ok' : 'good',
    detail:
      rain > 60
        ? 'High rain chance — dry clothes indoors.'
        : humidity > 85
          ? 'Very humid — outdoor drying will be slow.'
          : wind > 4
            ? 'Breezy day — good for line drying.'
            : 'Fair day for outdoor drying.',
  });

  tips.push({
    icon: '☀️',
    title: 'Sun exposure',
    level: uv >= 8 ? 'bad' : uv >= 5 ? 'ok' : 'good',
    detail: uvAdvice(uv).tip,
  });

  return tips;
}

/** Best 2-hour outdoor window from hourly precip + temp comfort. */
export function getBestOutdoorWindow(bundle: WeatherBundle): OutdoorWindow | null {
  const slots = bundle.hourly.slice(0, 18);
  if (slots.length < 3) return null;

  let best = { idx: 0, score: -1 };
  for (let i = 0; i < slots.length - 1; i++) {
    const rain = slots[i].precipitationProb ?? 50;
    const temp = slots[i].temperature;
    const comfort = temp >= 18 && temp <= 28 ? 20 : temp >= 10 && temp <= 32 ? 10 : 0;
    const score = comfort + (100 - rain) + (slots[i + 1].precipitationProb !== undefined ? (100 - slots[i + 1].precipitationProb!) / 2 : 0);
    if (score > best.score) best = { idx: i, score };
  }

  const slot = slots[best.idx];
  const rain = slot.precipitationProb ?? 0;
  return {
    hourLabel: slot.hourLabel,
    score: best.score,
    reason:
      rain < 20
        ? 'Low rain chance and comfortable temps.'
        : rain < 45
          ? 'Reasonable window before rain increases.'
          : 'Best available slot — still some rain risk.',
  };
}

export function buildWeatherSummary(bundle: WeatherBundle, unit: 'c' | 'f'): string {
  const p = bundle.place;
  const loc = [p.name, p.admin1, p.country].filter(Boolean).join(', ');
  const lines = [
    `Weather for ${loc}`,
    `${bundle.current.description} — ${formatTemp(bundle.current.temperature, unit)} (feels ${formatTemp(bundle.current.feelsLike, unit)})`,
    `Humidity ${bundle.current.humidity}% · Wind ${windMsToKmh(bundle.current.windSpeed).toFixed(0)} km/h`,
    `Today: ${formatTemp(bundle.daily[0]?.tempMax ?? bundle.current.temperature, unit)} / ${formatTemp(bundle.daily[0]?.tempMin ?? bundle.current.temperature, unit)}`,
  ];
  if (bundle.airQuality?.usAqi) lines.push(`Air quality (US AQI): ${bundle.airQuality.usAqi}`);
  if (bundle.daily[0]?.uvMax) lines.push(`UV index: ${bundle.daily[0].uvMax.toFixed(1)}`);
  lines.push('— FYN Tools Weather (fyntools.com/weather-forecast)');
  return lines.join('\n');
}
