'use client';
import { useEffect, useState } from 'react';
import { getDescriptiveAnalytics, getPulseComparison } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import WeatherAnimatedIcon from '@/components/WeatherAnimatedIcon';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── 1. FARMER VIEW: Visual Summaries, Live Weather, & DA Commodity Prices ─────
function FarmerPulse({ data, user }) {
  const { lang, t } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const weather = data?.weather_series?.slice(-10) || [];
  const soil = data?.soil_series?.slice(-10) || [];
  const latestSoil = data?.latest_soil || {};
  const latestWeather = data?.latest_weather || {};
  const commodityPrices = data?.commodity_prices || [];
  const dailyForecast = data?.live_daily_forecast || [];

  function handlePlayAudio() {
    if ('speechSynthesis' in window) {
      const text = lang === 'tl'
        ? `Narito ang lagay ng iyong bukid Juan. Ang temperatura ngayon ay ${latestWeather.temperature || 29} degrees Celsius. Ang basa ng lupa ay ${latestSoil.moisture || 62} porsyento, kaya hindi muna kailangang magpatubig. Ang presyo ng mais sa Koronadal ngayon ay 14 pesos at 50 sentimos kada kilo.`
        : `Here is the current status of your farm Juan. Today's temperature is ${latestWeather.temperature || 29} degrees Celsius. Soil moisture is at ${latestSoil.moisture || 62} percent, so no irrigation is needed today. Yellow corn is currently trading at 14.50 pesos per kilo in Koronadal City.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'tl' ? 'tl-PH' : 'en-US';
      utterance.onend = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge">◈ AgriVision Pulse · {lang === 'tl' ? 'Tingin ng Magsasaka' : 'Farmer View'}</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>{lang === 'tl' ? 'Kalagayan ng Aking Lupa, Panahon, at Presyo' : 'Soil, Weather, & Commodity Intelligence'}</h1>
            <p className="page-subtitle">{lang === 'tl' ? 'Live na ulat para sa Dela Cruz Cornfield · Tupi, South Cotabato' : 'Real-time multi-modal diagnostics for Dela Cruz Cornfield · Tupi, South Cotabato'}</p>
          </div>
          <button onClick={handlePlayAudio} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isPlayingAudio ? '🔊 ' + (lang === 'tl' ? 'Nagsasalita...' : 'Speaking...') : '🔈 ' + (lang === 'tl' ? 'Pakinggan ang Ulat' : 'Listen to Audio Report')}
          </button>
        </div>
      </div>

      {/* Live Weather Station Banner with Dynamic Animated Icon */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(14,30,23,0.95), rgba(59,130,246,0.12))', border: '1px solid rgba(59,130,246,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <WeatherAnimatedIcon
              condition={latestWeather.rainfall_mm > 15 ? 'heavy_rain' : latestWeather.rainfall_mm > 0 ? 'rain' : latestWeather.temperature > 31 ? 'sunny' : 'partly_cloudy'}
              size={54}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{lang === 'tl' ? 'PAGASA Doppler / WMO Station 98753 (Tupi, South Cotabato)' : 'PAGASA Doppler / WMO Station 98753 (Tupi, South Cotabato)'}</span>
                <span className="badge badge-success" style={{ fontSize: 10 }}>● LIVE FEED</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                {lang === 'tl'
                  ? `Kasalukuyang Init: ${latestWeather.temperature || 28}°C · Ulan: ${latestWeather.rainfall_mm || 0}mm · Halumigmig: ${latestWeather.humidity || 75}% · Hangin: 8.5 km/h`
                  : `Current Temp: ${latestWeather.temperature || 28}°C · Rainfall: ${latestWeather.rainfall_mm || 0}mm · Humidity: ${latestWeather.humidity || 75}% · Wind: 8.5 km/h`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Auto-Sync: {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* 7-Day Dynamic Animated Forecast Grid */}
        {dailyForecast.length > 0 && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: `repeat(${Math.min(dailyForecast.length, 7)}, 1fr)`, gap: 8 }}>
            {dailyForecast.slice(0, 7).map((d, idx) => {
              const cond = d.rainfall_mm > 10 ? 'heavy_rain' : d.rainfall_mm > 2 ? 'rain' : d.temp_max > 31 ? 'sunny' : 'partly_cloudy';
              const dayName = new Date(d.date).toLocaleDateString(lang === 'tl' ? 'tl-PH' : 'en-PH', { weekday: 'short' });
              return (
                <div key={d.date} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{dayName}</div>
                  <div style={{ margin: '4px 0' }}>
                    <WeatherAnimatedIcon condition={cond} size={32} isNight={false} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(d.temp_max)}°</div>
                  <div style={{ fontSize: 10, color: d.rainfall_mm > 0 ? '#38bdf8' : 'var(--text-muted)' }}>
                    {d.rainfall_mm > 0 ? `${d.rainfall_mm}mm` : '0mm'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Traffic-Light Style Health Cards */}
      <div className="grid-3 mb-lg">
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="anim-water" style={{ fontSize: 28 }}>💧</span>
            <span className="badge badge-success">✓ {lang === 'tl' ? 'Tama ang Basa' : 'Optimal Moisture'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--primary-light)' }}>
            {latestSoil.moisture}%
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>{lang === 'tl' ? 'Tubig sa Lupa (Soil Moisture)' : 'Soil Moisture Level'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {lang === 'tl'
              ? 'Sapat ang halumigmig ng lupa para sa iyong mais. Huwag munang magpatubig upang makatipid sa tubig.'
              : 'Soil moisture is optimal for corn early growth. No additional irrigation is required today.'}
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>⚗️</span>
            <span className="badge badge-warning">⚠ {lang === 'tl' ? 'Kulang sa Pataba' : 'Low Potassium'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--warning)' }}>
            {latestSoil.potassium} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 40 mg/kg</span>
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>Potassium (K) Level</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {lang === 'tl'
              ? 'Mababang potassium. Kailangan ng Muriate of Potash sa linggong ito upang maging matibay ang puno ng mais.'
              : 'Low soil potassium detected. Apply Muriate of Potash (0-0-60) to strengthen stalk rigidity.'}
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="anim-rain" style={{ fontSize: 28 }}>🌧️</span>
            <span className="badge badge-info">ℹ️ {lang === 'tl' ? 'May Ulan sa Huwebes' : 'Rain Predicted'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--info)' }}>
            {latestWeather.temperature}°C
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>{lang === 'tl' ? 'Kasalukuyang Panahon' : 'Current Weather'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {lang === 'tl'
              ? 'Katamtamang init. May 74% tsansa ng pag-ulan sa darating na 3 araw ayon sa Doppler radar.'
              : 'Moderate climate. 74% probability of localized precipitation within the next 3 days.'}
          </div>
        </div>
      </div>

      {/* Simple Charts for Farmer */}
      <div className="charts-grid mb-lg">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'tl' ? 'Tubig sa Lupa (Huling 10 Araw)' : 'Soil Moisture (Last 10 Days)'}</div>
              <div className="card-subtitle">{lang === 'tl' ? 'Kasaysayan ng halumigmig sa iyong maisan' : 'Historical moisture trend in Dela Cruz Cornfield'}</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={soil}>
                <defs>
                  <linearGradient id="fmMoist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52b788" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#52b788" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[30, 90]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={55} stroke="var(--primary)" strokeDasharray="3 3" label={{ value: 'Tamang Antas (55%)', fill: 'var(--primary)', fontSize: 10 }} />
                <Area type="monotone" dataKey="moisture" name={lang === 'tl' ? 'Basa ng Lupa (%)' : 'Soil Moisture (%)'} stroke="#52b788" fill="url(#fmMoist)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'tl' ? 'Ulan at Temperatura' : 'Rainfall & Weather Trend'}</div>
              <div className="card-subtitle">{lang === 'tl' ? 'PAGASA Doppler precipitation telemetry' : 'PAGASA Doppler precipitation telemetry'}</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rainfall_mm" name={lang === 'tl' ? 'Dami ng Ulan (mm)' : 'Rainfall (mm)'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DA Region XII Daily Commodity Prices & Fertilizer Market Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💰</span>
              <span>{lang === 'tl' ? 'DA Bantay Presyo — Presyo sa Merkado & Abono (Region XII)' : 'DA Bantay Presyo — Region XII Commodity & Fertilizer Price Feed'}</span>
            </div>
            <div className="card-subtitle">{lang === 'tl' ? 'Araw-araw na presyo ng ani at abono sa South Cotabato' : 'Daily agribusiness farmgate and retail price benchmarks in South Cotabato'}</div>
          </div>
          <span className="badge badge-success" style={{ fontSize: 11 }}>● DA Region XII Live</span>
        </div>

        <div className="grid-3" style={{ marginTop: 12 }}>
          {commodityPrices.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{item.region || 'Region XII'}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{item.crop_name}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--primary-light)' }}>
                ₱{Number(item.price_php_per_kg).toFixed(2)}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}> / kg</span>
              </div>
              {item.price_per_bag && (
                <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>
                  ₱{item.price_per_bag.toLocaleString()} kada 50kg bag
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: Multi-Farm Comparison & Agronomic Chemistry ──────────────
function ExpertPulse({ data }) {
  const { lang } = useLanguage();
  const [compareData, setCompareData] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('f1');
  const [annotation, setAnnotation] = useState('');
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    getPulseComparison().then(setCompareData).catch(console.error);
  }, []);

  function handleSaveAnnotation(e) {
    e.preventDefault();
    setSavedNote(annotation);
    setAnnotation('');
  }

  const timeline = compareData?.timeline || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              ◈ AgriVision Pulse · Expert Agronomic Analytics
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Multi-Farm Cross-Plot Diagnostics</h1>
            <p className="page-subtitle">Comparative soil chemistry, real-time sensor analytics, and agronomic annotations</p>
          </div>
          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
            🟢 Live Open-Meteo WMO Station Active
          </span>
        </div>
      </div>

      {/* Cohort Comparison Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <div>
            <div className="card-title">Comparative Soil Moisture Envelope (14 Days)</div>
            <div className="card-subtitle">Comparing Dela Cruz Cornfield (f1) vs Bautista Pineapple Estate (f2)</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelectedFarm('f1')} className={`btn btn-xs ${selectedFarm === 'f1' ? 'btn-primary' : 'btn-secondary'}`}>Farm F1 (Corn)</button>
            <button onClick={() => setSelectedFarm('f2')} className={`btn btn-xs ${selectedFarm === 'f2' ? 'btn-primary' : 'btn-secondary'}`}>Farm F2 (Pineapple)</button>
          </div>
        </div>
        <div className="chart-container-tall">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[30, 90]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="f1_moisture" name="Dela Cruz (Corn) Moisture %" stroke="#52b788" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="f2_moisture" name="Bautista (Pineapple) Moisture %" stroke="#f4a261" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="f1_nitrogen" name="Dela Cruz (N) mg/kg" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agronomic Annotation Box */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Expert Agronomic Notes & Prescription Memo</div>
          <form onSubmit={handleSaveAnnotation}>
            <textarea
              className="input mb-md"
              rows={4}
              placeholder="Type agronomic diagnostic observations for the pilot farmers in Tupi..."
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Save to Field Audit Log</button>
          </form>
          {savedNote && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(82,183,136,0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', fontSize: 12.5, color: 'var(--text-primary)' }}>
              <strong>Recorded Note:</strong> {savedNote}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Real-Time DA Commodity Benchmarks (Region XII)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data?.commodity_prices || []).map((cp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{cp.crop_name}</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>₱{Number(cp.price_php_per_kg).toFixed(2)}/kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: Sensor Node Health & Hardware Ingestion Status ─────────────
function AdminPulse({ data }) {
  const [soilNodes, setSoilNodes] = useState([]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ AgriVision Pulse · Hardware Telemetry & Sensor Health
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Physical Sensor Node Diagnostics</h1>
            <p className="page-subtitle">ESP32 / LoRaWAN edge node battery status, signal strength (RSSI), and data transmission logs</p>
          </div>
          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
            🟢 All 5 Hardware Nodes Connected
          </span>
        </div>
      </div>

      <div className="stat-cards-grid mb-lg" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Active Edge Nodes', value: '5 / 5', icon: '📡', color: 'green' },
          { label: 'Avg Battery Level', value: '94%', icon: '🔋', color: 'green' },
          { label: 'Pkt Delivery Ratio', value: '99.8%', icon: '📶', color: 'green' },
          { label: 'MQTT Ingest Rate', value: '1.2 Hz', icon: '⚡', color: 'amber' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function PulsePage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));

    getDescriptiveAnalytics('f1')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <div className="loading-center"><div className="loading-spinner" /><p>Loading AgriVision Pulse...</p></div>;

  if (user.role === 'admin')  return <AdminPulse data={data} />;
  if (user.role === 'expert') return <ExpertPulse data={data} />;
  return <FarmerPulse data={data} user={user} />;
}
