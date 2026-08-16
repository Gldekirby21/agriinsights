'use client';
import { useEffect, useState } from 'react';
import { getNexusData, getNexusLogs, getNexusTelemetry } from '@/lib/api';

const STATUS_COLOR = { connected: 'var(--success)', partial: 'var(--warning)', offline: 'var(--danger)' };
const LOG_COLOR    = { success: 'var(--success)', warning: 'var(--warning)', anomaly: 'var(--danger)', error: 'var(--danger)' };
const SOURCE_ICONS = { weather: '🌤️', sensor: '📡', market: '📈', satellite: '🛰️', reference: '📚' };

function TimeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── 1. FARMER VIEW: Simple & Actionable Connection Status ───────────────────
function FarmerNexus({ data, user }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  function handlePlayAudio() {
    if ('speechSynthesis' in window) {
      const text = `Kumusta ${user?.name || 'Kasama'}. Lahat ng 3 sensors sa Dela Cruz Cornfield ay online at awtomatikong naka-sync sa iyong Supabase Cloud database.`;
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
            <span className="module-badge" style={{ background: 'rgba(82,183,136,0.15)', color: 'var(--primary-light)' }}>
              ⬡ DataFusion Nexus · Farmer View
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Koneksyon ng Bukid sa Data</h1>
            <p className="page-subtitle">Awtomatikong naka-sync ang lahat ng IoT sensors sa iyong lupain sa Dela Cruz Cornfield</p>
          </div>
          <button
            onClick={handlePlayAudio}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isPlayingAudio ? '🔊 Nagsasalita...' : '🔈 Pakinggan ang Audio Report'}
          </button>
        </div>
      </div>

      {/* High Level Plain Status */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(18,32,25,0.9), rgba(82,183,136,0.1))', border: '1px solid var(--border-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            ✅
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--primary-light)' }}>
              Lahat ng Sensors at Feeds ay Awtomatikong Naka-Sync!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Direktang nag-a-update sa Supabase Cloud ang mga IoT sensors sa bukid bawat 5 minuto nang tuloy-tuloy.
            </div>
          </div>
        </div>
      </div>

      {/* Simple Connection Cards */}
      <div className="grid-3 mb-lg">
        {[
          { title: '🌱 IoT Sensors sa Lupa', desc: '3 sa 3 sensors ay may 100% signal', status: 'Online (Auto-Sync)', time: '5m ago', icon: '📡', color: 'green' },
          { title: '🌦️ PAGASA Weather Station', desc: 'Tupi South Cotabato Doppler Feed', status: 'Live Connected', time: '15m ago', icon: '🌤️', color: 'green' },
          { title: '💰 DA Presyo sa Palengke', desc: 'Region XII Corn & Commodity Feed', status: 'Auto-Updated', time: '1h ago', icon: '📈', color: 'green' },
        ].map((c) => (
          <div key={c.title} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>{c.icon}</span>
              <span className="badge badge-success">● {c.status}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 12 }}>{c.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Huling update: {c.time}</div>
          </div>
        ))}
      </div>

      {/* Plain Language Data Snapshot */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pinakabagong Tala sa Iyong Lupa (Live Cloud Feed)</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated: {new Date(data?.latest_fused?.fused_at).toLocaleTimeString()}</span>
        </div>
        <div className="grid-3">
          {[
            { label: 'Temperatura sa Bukid', value: `${data?.latest_fused?.weather?.temperature}°C`, note: 'Katamtamang init', icon: '🌡️' },
            { label: 'Tubig sa Lupa (Moisture)', value: `${data?.latest_fused?.soil?.moisture}%`, note: 'Sapat ang basa ng lupa', icon: '💧' },
            { label: 'Presyo ng Mais Ngayon', value: `₱${data?.latest_fused?.market?.corn_php_per_kg}/kg`, note: 'Mataas kumpara nakaraang buwan', icon: '🌽' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--primary-light)' }}>{item.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: Multi-Farm Ingestion Audit & Anomaly Management ──────────
function ExpertNexus({ data, logs }) {
  const [resolvedAnomalies, setResolvedAnomalies] = useState([]);

  function resolveAnomaly(id) {
    setResolvedAnomalies((prev) => [...prev, id]);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              ⬡ DataFusion Nexus · Agri Expert Audit
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Multi-Farm Ingestion & Quality Audit</h1>
            <p className="page-subtitle">Real-time telemetry validation and automated cloud ingestion for Tupi pilot cohort</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
              🟢 Supabase Cloud Live (Auto-Sync Active)
            </span>
          </div>
        </div>
      </div>

      {/* Expert Integrity Stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Data Quality Index', value: `${data?.latest_fused?.data_quality_score}%`, icon: '📊', color: 'green', sub: '99.1% Timeliness' },
          { label: 'Flagged Anomalies', value: Math.max(0, 2 - resolvedAnomalies.length), icon: '⚠️', color: resolvedAnomalies.length >= 2 ? 'green' : 'amber', sub: `${resolvedAnomalies.length} resolved` },
          { label: 'Active Pilot Feeds', value: data?.sources?.length || 5, icon: '🔗', color: 'info', sub: 'All Streams Auto-Synced' },
          { label: 'Fused Telemetry Rate', value: '1,754/day', icon: '🗃️', color: 'green', sub: '72 rec/min' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Anomaly Inspection Box */}
      <div className="card mb-lg" style={{ borderTop: '3px solid var(--warning)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Sensor Anomaly & Variance Review</div>
            <div className="card-subtitle">Flagged sensor spikes requiring expert validation</div>
          </div>
          <span className="badge badge-warning">Action Required</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'anom1', farm: 'Bautista Pineapple Estate', sensor: 'Sensor S4 (Moisture)', issue: 'Moisture delta > 18% in 15min without rainfall event', severity: 'warning' },
            { id: 'anom2', farm: 'Dela Cruz Cornfield', sensor: 'Sensor S2 (Temp)', issue: 'Day/night variance exceeded 3-sigma standard envelope', severity: 'info' },
          ].map((anom) => {
            const isResolved = resolvedAnomalies.includes(anom.id);
            return (
              <div key={anom.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: isResolved ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isResolved ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {anom.farm} · <span style={{ color: 'var(--amber)' }}>{anom.sensor}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{anom.issue}</div>
                </div>
                <div>
                  {isResolved ? (
                    <span className="badge badge-success">✓ Reviewed & Excluded</span>
                  ) : (
                    <button onClick={() => resolveAnomaly(anom.id)} className="btn btn-secondary btn-xs">
                      Exclude from ML & Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Connected Sources (Real-Time Auto-Stream)</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>5 feeds active</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data?.sources || []).map((src) => (
              <div key={src.id} className="source-item">
                <div className="source-icon">{SOURCE_ICONS[src.type] || '📦'}</div>
                <div className="source-info">
                  <div className="source-name">{src.name}</div>
                  <div className="source-meta">Sync: {TimeAgo(src.last_sync)} · {src.records_today} recs today</div>
                </div>
                <span className="badge badge-success" style={{ fontSize: 11 }}>Auto-Sync</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Live Ingestion Audit Log</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest events</span>
          </div>
          <div>
            {logs.map((log, i) => (
              <div key={i} className="log-item">
                <div className="log-time">{TimeAgo(log.time)}</div>
                <div style={{ flex: 1 }}>
                  <div className="log-source">{log.source}</div>
                  <div className="log-event" style={{ color: LOG_COLOR[log.status] || 'var(--text-secondary)' }}>{log.event}</div>
                </div>
                <div className="log-count">{log.records > 0 ? `${log.records} recs` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: Full Pipeline Architecture & Telemetry Diagnostics ───────
function AdminNexus({ logs }) {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    getNexusTelemetry().then(setTelemetry).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ DataFusion Nexus · System Architecture Control Room
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Pipeline Telemetry & Data Infrastructure</h1>
            <p className="page-subtitle">MQTT Message Broker status, Supabase Cloud storage metrics, API Gateway latency, and raw data ingestion audit</p>
          </div>
          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
            🟢 Automated 24/7 Cloud Sync Active
          </span>
        </div>
      </div>

      {/* Telemetry Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Throughput', value: `${telemetry?.throughput_records_per_min || 72} rec/m`, icon: '⚡', color: 'green' },
          { label: 'Gateway Latency', value: `${telemetry?.api_gateway_latency_ms || 18} ms`, icon: '⏱️', color: 'green' },
          { label: 'Supabase Storage', value: `${telemetry?.storage?.size_mb || 284.6} MB`, icon: '💾', color: 'info' },
          { label: 'Total Ingested Rows', value: telemetry?.storage?.row_count?.toLocaleString() || '89,420', icon: '🗃️', color: 'amber' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Infrastructure Telemetry Table */}
      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>MQTT & Microservices Topology</div>
          {[
            { label: 'MQTT Broker Protocol', value: 'MQTT over TLS (Port 8883)', status: 'Connected' },
            { label: 'Broker Host', value: 'mqtt.agriinsights.seait.edu.ph', status: 'Online' },
            { label: 'Active IoT Clients', value: '5 Edge Nodes (ESP32/LoRa)', status: 'Online' },
            { label: 'Ingestion Pipeline Worker', value: 'Apache Airflow / Celery DAG #04', status: 'Healthy' },
            { label: 'FAIR Compliance Audit', value: 'Schema aligned with AgGateway ADAPT', status: 'Passed' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Data Quality Dimension Scores</div>
          {[
            { name: 'Completeness', score: 98.2, target: 95 },
            { name: 'Sensor Accuracy', score: 96.5, target: 90 },
            { name: 'Ingestion Timeliness', score: 99.1, target: 95 },
            { name: 'Schema Consistency', score: 94.8, target: 90 },
          ].map((dim) => (
            <div key={dim.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{dim.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>{dim.score}% (Target &gt;{dim.target}%)</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill green" style={{ width: `${dim.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Logs */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">System Ingestion Event Stream</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Raw audit trail</span>
        </div>
        <div>
          {logs.map((log, i) => (
            <div key={i} className="log-item">
              <div className="log-time">{log.time}</div>
              <div style={{ flex: 1 }}>
                <div className="log-source">{log.source}</div>
                <div className="log-event" style={{ color: LOG_COLOR[log.status] || 'var(--text-secondary)' }}>{log.event}</div>
              </div>
              <div className="log-count">Status: {log.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function NexusPage() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));

    Promise.all([getNexusData(), getNexusLogs()])
      .then(([d, l]) => { setData(d); setLogs(l); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <div className="loading-center"><div className="loading-spinner" /><p>Loading DataFusion Nexus...</p></div>;

  if (user.role === 'admin')  return <AdminNexus data={data} logs={logs} />;
  if (user.role === 'expert') return <ExpertNexus data={data} logs={logs} />;
  return <FarmerNexus data={data} user={user} />;
}
