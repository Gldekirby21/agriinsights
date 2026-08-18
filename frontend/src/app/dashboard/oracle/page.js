'use client';
import { useEffect, useState } from 'react';
import { getForecasts, simulateScenario, retrainModel } from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── 1. FARMER VIEW: Multi-Modal Predictions & Actionable Checklists ──────────
function FarmerOracle({ data, user }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const forecasts = data?.forecasts || [];
  const yieldFc = forecasts.find((f) => f.type === 'yield');
  const pestFc = forecasts.find((f) => f.type === 'pest');
  const weatherFc = forecasts.find((f) => f.type === 'weather_impact');

  function handlePlayAudio() {
    if ('speechSynthesis' in window) {
      const text = `Hula sa iyong ani Juan: Inaasahang aabot sa 4.2 tons bawat hektarya ang iyong mais. Subalit may katamtamang banta ng pesteng Fall Armyworm dahil sa mainit at mahalumigmig na panahon. Mag-inspeksyon sa mga dahon at maghanda ng spray kung kinakailangan.`;
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
            <span className="module-badge">◉ CropCast Oracle · Farmer View</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Pagtantiya sa Ani at Peste</h1>
            <p className="page-subtitle">AI-powered hula sa ani ng mais at mga posibleng bantang peste sa iyong bukid</p>
          </div>
          <button onClick={handlePlayAudio} className="btn btn-secondary btn-sm">
            {isPlayingAudio ? '🔊 Nagsasalita...' : '🔈 Pakinggan ang Forecast'}
          </button>
        </div>
      </div>

      {/* Big Visual Forecast Cards */}
      <div className="grid-3 mb-lg">
        {/* Yield */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>🌽</span>
            <span className="badge badge-success">82% Mataas ang Kumpiyansa</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: 'var(--primary-light)' }}>
            4.2 <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>Tons / Hektarya</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4, marginBottom: 8 }}>Inaasahang Dami ng Ani</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Maganda ang tindig ng iyong maisan. Mas mataas ito ng humigit-kumulang 10% kumpara sa nakaraang anihan.
          </div>
        </div>

        {/* Pest Warning */}
        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>🐛</span>
            <span className="badge badge-danger">68% Katamtamang Banta</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--danger)' }}>
            Fall Armyworm
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4, marginBottom: 8 }}>Bantang Uod sa Mais</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Dahil sa init at halumigmig, paborable ang panahon sa pagdami ng uod sa susunod na 7 araw.
          </div>
        </div>

        {/* Weather impact */}
        <div className="card" style={{ borderTop: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>⛈️</span>
            <span className="badge badge-warning">74% Posibilidad</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--info)' }}>
            Malakas na Ulan
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4, marginBottom: 8 }}>Inaasahan sa loob ng 3 Araw</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Suriin ang kanal o drainage sa paligid ng taniman upang hindi magbaha.
          </div>
        </div>
      </div>

      {/* Actionable Farmer Checklist */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>✅ Ano ang Dapat Kong Gawin? (Hakbang Batay sa AI Forecast)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '1', title: 'I-inspeksyon ang gitnang dahon (whorl) ng mga batang mais.', sub: 'Maghanap ng mga butas o pinong dumi ng uod sa dahon.' },
            { step: '2', title: 'Ihanda ang Bio-spray (Bt) o Chlorpyrifos.', sub: 'Mag-spray bago lumubog ang araw kung may makitang higit 3 uod sa 10 puno.' },
            { step: '3', title: 'Linisin ang mga drainage canals bago ang ulan sa Huwebes.', sub: 'Maiiwasan ang pagkaipon ng tubig at pagkabulok ng ugat.' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: What-If Simulation Sandbox & Feature Importance ──────────
function ExpertOracle({ data }) {
  const [rainDelta, setRainDelta] = useState(0);
  const [tempDelta, setTempDelta] = useState(0);
  const [fertBoost, setFertBoost] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const modelAcc = data?.model_accuracy || {};
  const featureImp = data?.feature_importance || [];

  async function handleRunSimulation() {
    setSimulating(true);
    try {
      const res = await simulateScenario({
        rainfall_delta: Number(rainDelta),
        temp_delta: Number(tempDelta),
        fertilizer_boost: Number(fertBoost),
        farm_id: 'f1',
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              ◉ CropCast Oracle · Expert ML Simulation
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Predictive Modeling & Scenario Simulation</h1>
            <p className="page-subtitle">XGBoost-LSTM ensemble diagnostics, feature importance weights, and What-If climate stress simulation</p>
          </div>
        </div>
      </div>

      {/* Model Diagnostic Metrics */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Architecture', value: 'XGB-LSTM Ensemble', icon: '🤖', color: 'info' },
          { label: 'R² Score', value: modelAcc.r2 || 0.91, icon: '📐', color: 'green' },
          { label: 'MAE (t/ha)', value: modelAcc.mae || 0.18, icon: '📏', color: 'green' },
          { label: 'RMSE', value: modelAcc.rmse || 0.24, icon: '📉', color: 'amber' },
          { label: 'Pest F1-Score', value: modelAcc.f1_score || 0.88, icon: '🎯', color: 'green' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: s.label === 'Architecture' ? 13 : 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* What-If Simulation Sandbox */}
      <div className="card mb-lg" style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'linear-gradient(135deg, var(--bg-card), rgba(59,130,246,0.08))' }}>
        <div className="card-header">
          <div>
            <div className="card-title">🧪 Agronomic "What-If" Scenario Simulation Sandbox</div>
            <div className="card-subtitle">Simulate how weather anomalies and fertilizer adjustments impact expected yield and pest risk</div>
          </div>
          <button onClick={handleRunSimulation} className="btn btn-primary btn-sm" disabled={simulating} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            {simulating ? 'Computing ML Gradient...' : '▶ Run Simulation'}
          </button>
        </div>

        <div className="grid-3 mb-md">
          <div>
            <label className="form-label">Rainfall Variation (%): <strong style={{ color: '#60a5fa' }}>{rainDelta > 0 ? `+${rainDelta}` : rainDelta}%</strong></label>
            <input type="range" min="-40" max="40" step="5" value={rainDelta} onChange={(e) => setRainDelta(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>-40% (Drought)</span>
              <span>0% (Baseline)</span>
              <span>+40% (Excess Rain)</span>
            </div>
          </div>

          <div>
            <label className="form-label">Temperature Shift (°C): <strong style={{ color: '#60a5fa' }}>{tempDelta > 0 ? `+${tempDelta}` : tempDelta}°C</strong></label>
            <input type="range" min="-5" max="5" step="1" value={tempDelta} onChange={(e) => setTempDelta(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>-5°C (Cooler)</span>
              <span>0°C</span>
              <span>+5°C (Heatwave)</span>
            </div>
          </div>

          <div>
            <label className="form-label">NPK Fertilizer Boost (%): <strong style={{ color: '#60a5fa' }}>+{fertBoost}%</strong></label>
            <input type="range" min="0" max="50" step="5" value={fertBoost} onChange={(e) => setFertBoost(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>0% (Standard)</span>
              <span>+25%</span>
              <span>+50% (Heavy NPK)</span>
            </div>
          </div>
        </div>

        {simResult && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>Simulation Output Results:</div>
            <div className="grid-3">
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Simulated Yield</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: simResult.yield_change_pct >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {simResult.simulated_yield} t/ha ({simResult.yield_change_pct >= 0 ? `+${simResult.yield_change_pct}` : simResult.yield_change_pct}%)
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Simulated Pest Risk</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: simResult.simulated_pest_risk >= 70 ? 'var(--danger)' : 'var(--warning)' }}>
                  {simResult.simulated_pest_risk}% · {simResult.risk_assessment}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>95% Confidence Interval</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--primary-light)', marginTop: 4 }}>
                  [{simResult.confidence_interval[0]} - {simResult.confidence_interval[1]} t/ha]
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Importance */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">ML Feature Importance (Gini Impurity Index)</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top predictors for corn yield</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {featureImp.map((f) => (
            <div key={f.feature}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{f.feature}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)' }}>{f.importance}% contribution</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill green" style={{ width: `${f.importance * 2.5}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: Model Registry & Retraining ───────────────────────────────
function AdminOracle({ data }) {
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  async function handleRetrain() {
    setRetraining(true);
    try {
      const res = await retrainModel();
      setRetrainResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRetraining(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ CropCast Oracle · Model Registry & Lifecycle
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>ML Model Versioning & Drift Telemetry</h1>
            <p className="page-subtitle">Track model inference latency, retrain against accumulated pilot data, and manage algorithm versions</p>
          </div>
          <button onClick={handleRetrain} className="btn btn-primary btn-sm" disabled={retraining} style={{ background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))' }}>
            {retraining ? '🔄 Retraining on 18,420 records...' : '⚡ Trigger Model Retraining'}
          </button>
        </div>
      </div>

      {retrainResult && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>✓ Retraining Successful! New Model Version Deployed: {retrainResult.model_version}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Trained on {retrainResult.dataset_records} records across 150 epochs. New R² Score: <strong>{retrainResult.new_metrics.r2}</strong> (improved from 0.910).
          </div>
        </div>
      )}

      {/* Model Registry Table */}
      <div className="card mb-lg">
        <div className="card-title" style={{ marginBottom: 16 }}>ML Model Registry</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { version: 'CropCast-v2.1 (Active Production)', type: 'XGBoost + LSTM Time-Series Ensemble', r2: '0.910', latency: '42ms', status: 'Deployed' },
            { version: 'CropCast-v2.2-transformer (Staging)', type: 'Temporal Fusion Transformer (TFT)', r2: '0.934', latency: '68ms', status: 'Testing' },
            { version: 'CropCast-v1.0 (Archived)', type: 'Linear Ridge Regression Baseline', r2: '0.784', latency: '12ms', status: 'Archived' },
          ].map((m) => (
            <div key={m.version} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{m.version}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.type} · Latency: {m.latency}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)' }}>R²: {m.r2}</span>
                <span className={`badge ${m.status === 'Deployed' ? 'badge-success' : m.status === 'Testing' ? 'badge-warning' : 'badge-muted'}`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function OraclePage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));

    getForecasts('f1')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <div className="loading-center"><div className="loading-spinner" /><p>Loading CropCast Oracle...</p></div>;

  if (user.role === 'admin')  return <AdminOracle data={data} />;
  if (user.role === 'expert') return <ExpertOracle data={data} />;
  return <FarmerOracle data={data} user={user} />;
}
