'use client';

/**
 * WeatherAnimatedIcon
 * Dynamically renders custom animated SVG weather icons based on WMO code or condition name
 * Conditions supported: 'sunny', 'partly_cloudy', 'cloudy', 'rain', 'heavy_rain', 'thunderstorm', 'fog'
 */
export default function WeatherAnimatedIcon({ code = 0, condition = '', size = 48, label = '' }) {
  // Determine normalized condition
  let cond = condition.toLowerCase();
  
  if (!cond) {
    if (code === 0) cond = 'sunny';
    else if (code === 1 || code === 2) cond = 'partly_cloudy';
    else if (code === 3) cond = 'cloudy';
    else if (code === 45 || code === 48) cond = 'fog';
    else if (code >= 51 && code <= 61) cond = 'rain';
    else if (code >= 62 && code <= 82) cond = 'heavy_rain';
    else if (code >= 95) cond = 'thunderstorm';
    else cond = 'partly_cloudy';
  }

  const s = size;

  switch (cond) {
    case 'sunny':
    case 'clear':
      return (
        <div className="weather-icon-wrap" title={label || 'Sunny / Clear Sky'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <g className="anim-sun-rays">
              <line x1="32" y1="6" x2="32" y2="14" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="32" y1="50" x2="32" y2="58" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="6" y1="32" x2="14" y2="32" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="50" y1="32" x2="58" y2="32" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="13.6" y1="13.6" x2="19.3" y2="19.3" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="44.7" y1="44.7" x2="50.4" y2="50.4" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="13.6" y1="50.4" x2="19.3" y2="44.7" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="44.7" y1="19.3" x2="50.4" y2="13.6" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" className="anim-sun-pulse" />
            <defs>
              <radialGradient id="sunGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      );

    case 'partly_cloudy':
      return (
        <div className="weather-icon-wrap" title={label || 'Partly Cloudy'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <g className="anim-sun-rays" transform="translate(10, -4)">
              <circle cx="28" cy="24" r="10" fill="#f59e0b" />
              <line x1="28" y1="8" x2="28" y2="12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="40" y1="16" x2="44" y2="13" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="28" x2="48" y2="28" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <path
              className="anim-cloud-drift"
              d="M20 48h28a10 10 0 002-19.8 14 14 0 00-26.6-4.2A11 11 0 0020 48z"
              fill="url(#cloudGrad1)"
            />
            <defs>
              <linearGradient id="cloudGrad1" x1="20" y1="20" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'cloudy':
    case 'overcast':
      return (
        <div className="weather-icon-wrap" title={label || 'Cloudy / Overcast'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <path
              className="anim-cloud-back"
              d="M16 40h28a9 9 0 002-17.8 12 12 0 00-22.6-3.8A10 10 0 0016 40z"
              fill="#64748b"
              opacity="0.6"
            />
            <path
              className="anim-cloud-float"
              d="M18 50h32a10 10 0 002-19.8 14 14 0 00-26.6-4.2A11 11 0 0018 50z"
              fill="url(#cloudGrad2)"
            />
            <defs>
              <linearGradient id="cloudGrad2" x1="18" y1="22" x2="52" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'rain':
    case 'drizzle':
    case 'light_rain':
      return (
        <div className="weather-icon-wrap" title={label || 'Light Rain / Drizzle'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <path
              className="anim-cloud-float"
              d="M16 38h32a10 10 0 002-19.8 14 14 0 00-26.6-4.2A11 11 0 0016 38z"
              fill="url(#cloudRainGrad)"
            />
            <g className="anim-raindrops-light">
              <line x1="22" y1="42" x2="20" y2="52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="32" y1="42" x2="30" y2="52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="42" y1="42" x2="40" y2="52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="cloudRainGrad" x1="16" y1="14" x2="50" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'heavy_rain':
    case 'downpour':
      return (
        <div className="weather-icon-wrap" title={label || 'Heavy Rain / Downpour'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <path
              className="anim-cloud-float"
              d="M16 34h32a10 10 0 002-19.8 14 14 0 00-26.6-4.2A11 11 0 0016 34z"
              fill="url(#cloudDarkRain)"
            />
            <g className="anim-raindrops-heavy">
              <line x1="20" y1="38" x2="16" y2="54" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="29" y1="38" x2="25" y2="54" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="38" y1="38" x2="34" y2="54" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="47" y1="38" x2="43" y2="54" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="cloudDarkRain" x1="16" y1="10" x2="50" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'thunderstorm':
    case 'typhoon':
    case 'storm':
      return (
        <div className="weather-icon-wrap" title={label || 'Thunderstorm / Typhoon Advisory'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <path
              className="anim-storm-cloud"
              d="M16 32h32a10 10 0 002-19.8 14 14 0 00-26.6-4.2A11 11 0 0016 32z"
              fill="url(#stormCloudGrad)"
            />
            <polygon
              className="anim-lightning"
              points="34,30 24,44 32,44 26,58 42,40 33,40"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            <g className="anim-raindrops-heavy">
              <line x1="16" y1="38" x2="13" y2="50" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="46" y1="38" x2="43" y2="50" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="stormCloudGrad" x1="16" y1="8" x2="50" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'fog':
    case 'mist':
      return (
        <div className="weather-icon-wrap" title={label || 'Fog / Mist'}>
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
            <line className="anim-fog-1" x1="12" y1="22" x2="52" y2="22" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line className="anim-fog-2" x1="18" y1="32" x2="46" y2="32" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line className="anim-fog-1" x1="14" y1="42" x2="50" y2="42" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line className="anim-fog-2" x1="20" y1="52" x2="44" y2="52" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return <span style={{ fontSize: size * 0.8 }}>🌤️</span>;
  }
}
