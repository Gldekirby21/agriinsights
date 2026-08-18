'use client';
import { useState } from 'react';

/**
 * Official Meteocons 3.0 Animated Weather Icon Mapping
 * High-definition vector animated SVGs with native smooth animations
 */
const METEOCONS_BASE = 'https://cdn.meteocons.com/3.0.0-next.10/svg/fill';

export const METEOCONS = {
  sunny: `${METEOCONS_BASE}/sun-hot.svg`,
  clear: `${METEOCONS_BASE}/mostly-clear-day.svg`,
  mostly_clear: `${METEOCONS_BASE}/mostly-clear-day.svg`,
  partly_cloudy: `${METEOCONS_BASE}/mostly-clear-day.svg`,
  cloudy: `${METEOCONS_BASE}/cloudy.svg`,
  overcast: `${METEOCONS_BASE}/cloudy.svg`,
  drizzle: `${METEOCONS_BASE}/drizzle.svg`,
  light_rain: `${METEOCONS_BASE}/mostly-clear-day-drizzle.svg`,
  rain: `${METEOCONS_BASE}/rain.svg`,
  heavy_rain: `${METEOCONS_BASE}/partly-cloudy-day-rain.svg`,
  downpour: `${METEOCONS_BASE}/rain.svg`,
  thunderstorm: `${METEOCONS_BASE}/hail.svg`,
  hail: `${METEOCONS_BASE}/hail.svg`,
  mist: `${METEOCONS_BASE}/mist.svg`,
  fog: `${METEOCONS_BASE}/fog-day.svg`,
  haze: `${METEOCONS_BASE}/haze-day.svg`,
  dust: `${METEOCONS_BASE}/dust-day.svg`,
  smoke: `${METEOCONS_BASE}/smoke.svg`,
  snow: `${METEOCONS_BASE}/snow.svg`,
  sleet: `${METEOCONS_BASE}/sleet.svg`,
};

/**
 * WeatherAnimatedIcon
 * Dynamically resolves condition or WMO weather code to official Meteocons animated SVG
 */
export default function WeatherAnimatedIcon({
  code = null,
  condition = '',
  rainfall_mm = 0,
  temperature = null,
  size = 48,
  className = '',
  style = {},
  label = '',
}) {
  const [hasError, setHasError] = useState(false);

  // 1. Resolve normalized condition key
  let key = 'partly_cloudy';

  if (condition) {
    const c = condition.toLowerCase().replace(/[\s-]/g, '_');
    if (METEOCONS[c]) {
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

  const iconUrl = METEOCONS[key] || METEOCONS.partly_cloudy;

  if (hasError) {
    // Fallback emoji
    const emojiMap = {
      sunny: '☀️',
      clear: '🌤️',
      mostly_clear: '🌤️',
      partly_cloudy: '⛅',
      cloudy: '☁️',
      drizzle: '🌦️',
      rain: '🌧️',
      heavy_rain: '⛈️',
      thunderstorm: '⛈️',
      fog: '🌫️',
      haze: '🌫️',
    };
    return (
      <span style={{ fontSize: size * 0.8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        {emojiMap[key] || '🌤️'}
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
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
        transition: 'transform 0.25s ease',
        ...style,
      }}
      title={label || `Weather: ${key.replace('_', ' ')}`}
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
