'use client';
import { useState, useEffect } from 'react';

/**
 * Official Meteocons 3.0 Animated Weather Icon Mapping (Day & Night Adaptive)
 */
const METEOCONS_BASE = 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill';

export const METEOCONS_DAY = {
  sunny: `${METEOCONS_BASE}/sun-hot.svg`,
  hot: `${METEOCONS_BASE}/sun-hot.svg`,
  clear: `${METEOCONS_BASE}/clear-day.svg`,
  clear_day: `${METEOCONS_BASE}/clear-day.svg`,
  mostly_clear: `${METEOCONS_BASE}/mostly-clear-day.svg`,
  partly_cloudy: `${METEOCONS_BASE}/mostly-clear-day.svg`,
  cloudy: `${METEOCONS_BASE}/cloudy.svg`,
  overcast: `${METEOCONS_BASE}/cloudy.svg`,
  drizzle: `${METEOCONS_BASE}/mostly-clear-day-drizzle.svg`,
  light_rain: `${METEOCONS_BASE}/mostly-clear-day-drizzle.svg`,
  rain: `${METEOCONS_BASE}/partly-cloudy-day-rain.svg`,
  heavy_rain: `${METEOCONS_BASE}/partly-cloudy-day-rain.svg`,
  downpour: `${METEOCONS_BASE}/rain.svg`,
  thunderstorm: `${METEOCONS_BASE}/mostly-clear-day-hail.svg`,
  hail: `${METEOCONS_BASE}/mostly-clear-day-hail.svg`,
  fog: `${METEOCONS_BASE}/mostly-clear-day-fog.svg`,
  fog_day: `${METEOCONS_BASE}/fog-day.svg`,
  mist: `${METEOCONS_BASE}/mist.svg`,
  haze: `${METEOCONS_BASE}/partly-cloudy-day-haze.svg`,
  haze_day: `${METEOCONS_BASE}/haze-day.svg`,
  dust: `${METEOCONS_BASE}/dust-day.svg`,
  smoke: `${METEOCONS_BASE}/partly-cloudy-day-smoke.svg`,
  snow: `${METEOCONS_BASE}/partly-cloudy-day-snow.svg`,
  sleet: `${METEOCONS_BASE}/partly-cloudy-day-sleet.svg`,
};

export const METEOCONS_NIGHT = {
  sunny: `${METEOCONS_BASE}/clear-night.svg`,
  hot: `${METEOCONS_BASE}/clear-night.svg`,
  clear: `${METEOCONS_BASE}/clear-night.svg`,
  clear_night: `${METEOCONS_BASE}/clear-night.svg`,
  mostly_clear: `${METEOCONS_BASE}/partly-cloudy-night.svg`,
  partly_cloudy: `${METEOCONS_BASE}/partly-cloudy-night.svg`,
  cloudy: `${METEOCONS_BASE}/cloudy.svg`,
  overcast: `${METEOCONS_BASE}/cloudy.svg`,
  drizzle: `${METEOCONS_BASE}/partly-cloudy-night-drizzle.svg`,
  light_rain: `${METEOCONS_BASE}/partly-cloudy-night-drizzle.svg`,
  rain: `${METEOCONS_BASE}/partly-cloudy-night-rain.svg`,
  heavy_rain: `${METEOCONS_BASE}/partly-cloudy-night-rain.svg`,
  downpour: `${METEOCONS_BASE}/rain.svg`,
  thunderstorm: `${METEOCONS_BASE}/partly-cloudy-night-hail.svg`,
  hail: `${METEOCONS_BASE}/partly-cloudy-night-hail.svg`,
  fog: `${METEOCONS_BASE}/partly-cloudy-night-fog.svg`,
  fog_night: `${METEOCONS_BASE}/fog-night.svg`,
  mist: `${METEOCONS_BASE}/mist.svg`,
  haze: `${METEOCONS_BASE}/partly-cloudy-night-haze.svg`,
  haze_night: `${METEOCONS_BASE}/haze-night.svg`,
  dust: `${METEOCONS_BASE}/dust-night.svg`,
  smoke: `${METEOCONS_BASE}/partly-cloudy-night-smoke.svg`,
  snow: `${METEOCONS_BASE}/partly-cloudy-night-snow.svg`,
  sleet: `${METEOCONS_BASE}/partly-cloudy-night-sleet.svg`,
};

/**
 * WeatherAnimatedIcon
 * Dynamically switches between Day and Night animated Meteocons based on local clock time (e.g. 6pm - 6am = Night)
 */
export default function WeatherAnimatedIcon({
  code = null,
  condition = '',
  rainfall_mm = 0,
  temperature = null,
  isNight = null, // Can force true/false or auto-detect based on local hour
  size = 48,
  className = '',
  style = {},
  label = '',
}) {
  const [hasError, setHasError] = useState(false);
  const [isNightTime, setIsNightTime] = useState(false);

  useEffect(() => {
    if (isNight !== null) {
      setIsNightTime(Boolean(isNight));
    } else {
      const hour = new Date().getHours();
      // Night time: 6:00 PM (18:00) to 5:59 AM (05:59)
      setIsNightTime(hour >= 18 || hour < 6);
    }
  }, [isNight]);

  // 1. Resolve condition key
  let key = 'partly_cloudy';

  if (condition) {
    const c = condition.toLowerCase().replace(/[\s-]/g, '_');
    if (METEOCONS_DAY[c]) {
      key = c;
    } else if (c.includes('storm') || c.includes('typhoon') || c.includes('thunder') || c.includes('kidlat')) {
      key = 'thunderstorm';
    } else if (c.includes('heavy') || c.includes('lakas') || c.includes('downpour')) {
      key = 'heavy_rain';
    } else if (c.includes('rain') || c.includes('ulan') || c.includes('shower')) {
      key = 'rain';
    } else if (c.includes('drizzle') || c.includes('ambon')) {
      key = 'drizzle';
    } else if (c.includes('cloud') || c.includes('ulap') || c.includes('overcast')) {
      key = 'cloudy';
    } else if (c.includes('fog') || c.includes('hamog') || c.includes('mist')) {
      key = 'fog';
    } else if (c.includes('haze')) {
      key = 'haze';
    } else if (c.includes('sun') || c.includes('araw') || c.includes('clear') || c.includes('init')) {
      key = 'sunny';
    }
  } else if (code !== null && code !== undefined) {
    const c = Number(code);
    if (c === 0) key = 'sunny';
    else if (c === 1 || c === 2) key = 'partly_cloudy';
    else if (c === 3) key = 'cloudy';
    else if (c === 45 || c === 48) key = 'fog';
    else if (c >= 51 && c <= 55) key = 'drizzle';
    else if (c >= 61 && c <= 65) key = 'rain';
    else if (c >= 80 && c <= 82) key = 'heavy_rain';
    else if (c >= 95) key = 'thunderstorm';
    else key = 'partly_cloudy';
  } else if (rainfall_mm > 15) {
    key = 'heavy_rain';
  } else if (rainfall_mm > 2) {
    key = 'rain';
  } else if (rainfall_mm > 0) {
    key = 'drizzle';
  } else if (temperature !== null && temperature >= 32) {
    key = 'sunny';
  } else if (temperature !== null && temperature >= 28) {
    key = 'mostly_clear';
  }

  // Pick Day vs Night icon dictionary
  const activeDict = isNightTime ? METEOCONS_NIGHT : METEOCONS_DAY;
  const iconUrl = activeDict[key] || (isNightTime ? METEOCONS_NIGHT.partly_cloudy : METEOCONS_DAY.partly_cloudy);

  if (hasError) {
    const emojiMap = isNightTime
      ? { sunny: '🌙', clear: '🌙', mostly_clear: '🌤️', partly_cloudy: '☁️', drizzle: '🌧️', rain: '🌧️', heavy_rain: '⛈️', thunderstorm: '⛈️', fog: '🌫️' }
      : { sunny: '☀️', clear: '🌤️', mostly_clear: '🌤️', partly_cloudy: '⛅', drizzle: '🌦️', rain: '🌧️', heavy_rain: '⛈️', thunderstorm: '⛈️', fog: '🌫️' };
    return (
      <span style={{ fontSize: size * 0.8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {emojiMap[key] || (isNightTime ? '🌙' : '🌤️')}
      </span>
    );
  }

  return (
    <div
      className={`weather-icon-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        filter: isNightTime
          ? 'drop-shadow(0 2px 10px rgba(96, 165, 250, 0.25))'
          : 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.2))',
        transition: 'all 0.25s ease',
        ...style,
      }}
      title={label || `Weather: ${key.replace('_', ' ')} (${isNightTime ? 'Night' : 'Day'})`}
    >
      <img
        src={iconUrl}
        alt={label || key}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setHasError(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
