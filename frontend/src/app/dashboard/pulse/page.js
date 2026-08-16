'use client';
import { useEffect, useState } from 'react';
import { getDescriptiveAnalytics, getPulseComparison } from '@/lib/api';
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

// ─── 1. FARMER VIEW: Visual Summaries, Gauges, & Multi-Modal Audio ────────────
function FarmerPulse({ data, user }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const weather = data?.weather_series?.slice(-10) || [];
  const soil = data?.soil_series?.slice(-10) || [];
  const latestSoil = data?.latest_soil || {};
  const latestWeather = data?.latest_weather || {};

  function handlePlayAudio() {
    if ('speechSynthesis' in window) {
      const text = `Narito ang lagay ng iyong bukid Juan. Ang temperatura ngayon ay ${latestWeather.temperature || 29} degrees Celsius. Ang basa ng lupa ay ${latestSoil.moisture || 62} porsyento, kaya hindi muna kailangang magpatubig. Kulang sa potassium ang lupa kaya iminumungkahing mag-abono sa loob ng limang araw.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tl-PH';
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
            <span className="module-badge">◈ AgriVision Pulse · Farmer View</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Kalagayan ng Aking Lupa at Panahon</h1>
            <p className="page-subtitle">Madaling maunawaang ulat para sa Dela Cruz Cornfield · Tupi, South Cotabato</p>
          </div>
          <button onClick={handlePlayAudio} className="btn btn-secondary btn-sm">
            {isPlayingAudio ? '🔊 Nagsasalita...' : '🔈 Pakinggan ang Ulat'}
          </button>
        </div>
      </div>

      {/* Traffic-Light Style Health Cards */}
      <div className="grid-3 mb-lg">
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>💧</span>
            <span className="badge badge-success">✓ Tama ang Basa</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--primary-light)' }}>
            {latestSoil.moisture}%
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>Tubig sa Lupa (Soil Moisture)</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Sapat ang halumigmig ng lupa para sa iyong mais. <strong>Huwag munang magpatubig</strong> upang makatipid sa tubig at maiwasan ang pagkabulok ng ugat.
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>⚗️</span>
            <span className="badge badge-warning">⚠ Kulang sa Pataba</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--warning)' }}>
            {latestSoil.potassium} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 40 mg/kg</span>
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>Potassium (K) Level</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Mababang potassium. Kailangan ng <strong>Muriate of Potash</strong> sa linggong ito upang maging matibay ang puno ng mais at malaki ang bunga.
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>🌦️</span>
            <span className="badge badge-info">ℹ️ May Ulan sa Huwebes</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--info)' }}>
            {latestWeather.temperature}°C
          </div>
          <div style={{ fontWeight: 700, marginTop: 4, marginBottom: 6 }}>Kasalukuyang Panahon</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Katamtamang init. May 74% tsansa ng malakas na pag-ulan sa darating na 3 araw ayon sa PAGASA.
          </div>
        </div>
      </div>

      {/* Simple Charts for Farmer */}
      <div className="charts-grid mb-lg">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tubig sa Lupa (Huling 10 Araw)</div>
              <div className="card-subtitle">Kasaysayan ng halumigmig sa iyong maisan</div>
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
                <Area type="monotone" dataKey="moisture" name="Basa ng Lupa (%)" stroke="#52b788" fill="url(#fmMoist)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Ulan at Temperatura</div>
              <div className="card-subtitle">PAGASA weather trend</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rainfall_mm" name="Dami ng Ulan (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: Multi-Farm Comparison & Agronomic Chemistry ──────────────
function ExpertPulse({ data }) {
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
            <h1 className="page-title" style={{ marginTop: 10 }}>Multi-Farm Descriptive Diagnostics</h1>
            <p className="page-subtitle">Cross-farm comparative soil physics, NPK stoichiometry ratios, and agronomic benchmarks</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Focus Farm:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
            >
              <option value="f1">Farm F1 (Dela Cruz - Corn)</option>
              <option value="f2">Farm F2 (Bautista - Pineapple)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparative Multi-Farm Soil Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <div>
            <div className="card-title">Comparative Soil Moisture & pH: Farm F1 vs Farm F2 vs Regional Baseline</div>
            <div className="card-subtitle">14-day synchronized time-series analysis</div>
          </div>
        </div>
        <div className="chart-container-tall">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis yAxisId="moist" orientation="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[30, 80]} label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis yAxisId="ph" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[5.0, 7.5]} label={{ value: 'Soil pH', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="moist" type="monotone" dataKey="farm1_moisture" name="Farm 1 Dela Cruz Moisture (%)" stroke="#52b788" strokeWidth={2.5} />
              <Line yAxisId="moist" type="monotone" dataKey="farm2_moisture" name="Farm 2 Bautista Moisture (%)" stroke="#f4a261" strokeWidth={2.5} />
              <Line yAxisId="moist" type="monotone" dataKey="tupi_regional_baseline_moisture" name="Tupi Regional Baseline (%)" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              <Line yAxisId="ph" type="monotone" dataKey="farm1_ph" name="Farm 1 pH" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="2 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Soil Chemistry Diagnostic Grid */}
      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Soil Stoichiometry & Nutrient Depletion Velocity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { metric: 'N:P:K Ratio', f1: '1.2 : 0.8 : 0.6 (Deficit in K)', f2: '1.5 : 1.1 : 1.0 (Balanced)' },
              { metric: 'Soil Organic Matter (SOM)', f1: '2.8% (Moderate Clay Loam)', f2: '3.4% (Good Sandy Loam)' },
              { metric: 'Estimated Evapotranspiration (ET₀)', f1: '4.2 mm/day', f2: '3.8 mm/day' },
              { metric: 'Buffer Capacity Index', f1: 'High (Resistant to sudden pH shifts)', f2: 'Medium' },
            ].map((row) => (
              <div key={row.metric} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{row.metric}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--primary-light)' }}>F1 (Corn): {row.f1}</span>
                  <span style={{ color: 'var(--amber)' }}>F2 (Pineapple): {row.f2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert Annotation Tool */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Expert Agronomic Annotation</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Write an agronomic interpretation note that will be linked to the farmer's monthly report.
          </p>
          <form onSubmit={handleSaveAnnotation}>
            <textarea
              className="form-control form-textarea"
              style={{ minHeight: 90, marginBottom: 12 }}
              placeholder="e.g. Potassium levels have decreased by 12% following the vegetative growth surge. Recommend 50kg/ha top dressing..."
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!annotation.trim()}>
              Save Note to Farm Record
            </button>
          </form>
          {savedNote && (
            <div style={{ marginTop: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}>
              <strong style={{ color: '#60a5fa' }}>Saved Annotation:</strong> "{savedNote}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: Sensor Frequency & Data Retention ─────────────────────────
function AdminPulse({ data }) {
  const [pollingFreq, setPollingFreq] = useState('5m');
  const [calOffset, setCalOffset] = useState('0.0');

  function handleExportCSV() {
    alert('Exporting 30-day raw sensor and weather telemetry as CSV for research evaluation.');
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ AgriVision Pulse · Telemetry & Sampling Controls
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Descriptive Telemetry & Sensor Calibration</h1>
            <p className="page-subtitle">Configure sensor polling frequencies, calibration offsets, and bulk export for statistical research</p>
          </div>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            📥 Export Telemetry CSV
          </button>
        </div>
      </div>

      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Sensor Sampling Configuration</div>
          <div className="form-group">
            <label className="form-label">IoT Sensor Polling Interval</label>
            <select className="form-control" value={pollingFreq} onChange={(e) => setPollingFreq(e.target.value)}>
              <option value="1m">1 Minute (High Precision / High Bandwidth)</option>
              <option value="5m">5 Minutes (Standard Pilot Setting - Recommended)</option>
              <option value="15m">15 Minutes (Low Power / Remote Solar Nodes)</option>
              <option value="1h">1 Hour (Conserve Battery)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Global Soil Moisture Calibration Offset (%)</label>
            <input className="form-control" type="number" step="0.1" value={calOffset} onChange={(e) => setCalOffset(e.target.value)} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Applied across all capacitive soil sensors to compensate for high clay composition in Bololmacnow soil.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Sensor sampling configuration saved to edge gateway.')}>
            Save Sampling Profile
          </button>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Storage & Archival Retention</div>
          {[
            { label: 'Raw IoT Stream Retention', value: '365 Days (Rolling)', status: 'Active' },
            { label: 'Aggregated Daily Averages', value: 'Permanent Archival', status: 'Active' },
            { label: 'Data Privacy Anonymization', value: 'RA 10173 Hash Encryption', status: 'Enforced' },
            { label: 'Export Formats Supported', value: 'CSV, Parquet, GeoJSON', status: 'Ready' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{row.value}</span>
            </div>
          ))}
        </div>
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
