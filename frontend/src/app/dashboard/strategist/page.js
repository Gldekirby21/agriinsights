'use client';
import { useEffect, useState } from 'react';
import { getRecommendations, updateRecommendationStatus, createRecommendation, getStrategistAudit } from '@/lib/api';

const PRIORITY_CONFIG = {
  urgent:   { label: 'Urgent',   color: 'var(--danger)',  badge: 'badge-danger' },
  moderate: { label: 'Moderate', color: 'var(--warning)', badge: 'badge-warning' },
  low:      { label: 'Low',      color: 'var(--info)',    badge: 'badge-info' },
};

const CATEGORY_ICONS = {
  pest: '🐛',
  irrigation: '💧',
  fertilizer: '⚗️',
  planting: '🌱',
  resource: '📦',
};

// ─── 1. FARMER VIEW: Actionable Farm Tasks & Accept/Done Tracking ─────────────
function FarmerStrategist({ recs, onStatusChange, user }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? recs : recs.filter((r) => r.priority === filter || r.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge">◆ OptiFarm Strategist · Farmer View</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Mga Payo at Gabay sa Pagsasaka</h1>
            <p className="page-subtitle">Mga konkretong hakbang upang makatipid sa gastos at mapataas ang ani sa Dela Cruz Cornfield</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'Lahat ng Payo' },
          { key: 'urgent',   label: '🔴 Kailangan Agad' },
          { key: 'moderate', label: '🟡 Sa Linggong Ito' },
          { key: 'accepted', label: '✅ Tinanggap / Nagawa Na' },
        ].map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recommendation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((rec) => (
          <div key={rec.rec_id} className={`rec-card ${rec.priority}`} style={{ borderLeft: `4px solid ${rec.priority === 'urgent' ? 'var(--danger)' : 'var(--primary)'}` }}>
            <div className="rec-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[rec.category] || '📌'}</span>
                <div>
                  <div className="rec-title">{rec.title}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className={`badge ${rec.priority === 'urgent' ? 'badge-danger' : 'badge-warning'}`}>
                      {rec.priority === 'urgent' ? 'Agaran (48 oras)' : 'Katamtaman'}
                    </span>
                    <span className={`badge ${rec.status === 'accepted' ? 'badge-success' : 'badge-muted'}`}>
                      {rec.status === 'accepted' ? '✓ Tinanggap Na' : '⏳ Naghihintay ng Aksyon'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rec-desc" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{rec.description}</div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>💡 Inaasahang Pakinabang: </span>
              <strong style={{ color: 'var(--primary-light)' }}>{rec.expected_benefit}</strong>
            </div>

            <div className="rec-footer">
              <div style={{ fontSize: 13 }}>
                💰 Tinatayang Gastos: <strong style={{ color: 'var(--text-primary)' }}>{rec.estimated_cost_php === 0 ? 'Libre (Walang Gastos)' : `₱${rec.estimated_cost_php.toLocaleString()}`}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {rec.status !== 'accepted' ? (
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => onStatusChange(rec.rec_id, 'accepted')}
                  >
                    ✓ Tanggapin / Isasagawa Ko
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => onStatusChange(rec.rec_id, 'pending')}
                  >
                    I-reset ang Katayuan
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: Prescription Dispatcher & AI Approval Queue ──────────────
function ExpertStrategist({ recs, onStatusChange, onNewRec }) {
  const [showForm, setShowForm] = useState(false);
  const [farmId, setFarmId] = useState('f1');
  const [category, setCategory] = useState('fertilizer');
  const [priority, setPriority] = useState('urgent');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('800');
  const [benefit, setBenefit] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onNewRec({
        farm_id: farmId,
        category,
        priority,
        title,
        description,
        estimated_cost_php: Number(cost),
        expected_benefit: benefit,
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setBenefit('');
    } catch (err) {
      alert('Error creating prescription: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              ◆ OptiFarm Strategist · Expert Prescriptions
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Prescriptive Advisory & Prescription Builder</h1>
            <p className="page-subtitle">Formulate personalized agronomist prescriptions and dispatch actionable advice to enrolled farmers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary btn-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            {showForm ? '✕ Close Builder' : '✍️ Write New Prescription'}
          </button>
        </div>
      </div>

      {/* Prescription Builder Form */}
      {showForm && (
        <div className="card mb-lg" style={{ border: '1px solid rgba(59,130,246,0.4)', background: 'linear-gradient(135deg, var(--bg-card), rgba(59,130,246,0.08))' }}>
          <div className="card-title" style={{ marginBottom: 14 }}>New Agronomic Prescription Form</div>
          <form onSubmit={handleCreate}>
            <div className="grid-3 mb-md">
              <div className="form-group">
                <label className="form-label">Target Farm</label>
                <select className="form-control" value={farmId} onChange={(e) => setFarmId(e.target.value)}>
                  <option value="f1">Dela Cruz Cornfield (Juan Dela Cruz)</option>
                  <option value="f2">Bautista Pineapple Estate (Maria Bautista)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Intervention Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="fertilizer">⚗️ Fertilizer & Nutrient Top Dressing</option>
                  <option value="pest">🐛 Pest & Disease Control</option>
                  <option value="irrigation">💧 Irrigation Schedule Adjustment</option>
                  <option value="planting">🌱 Planting & Intercropping Strategy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Urgency Priority</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="urgent">🔴 Urgent (Within 48h)</option>
                  <option value="moderate">🟡 Moderate (Within 7 Days)</option>
                  <option value="low">🔵 Low / Strategic Season Plan</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Prescription Title</label>
              <input
                className="form-control"
                placeholder="e.g. Apply Foliar Zinc + Urea Mix before Flowering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Detailed Instructions & Dosage</label>
              <textarea
                className="form-control form-textarea"
                placeholder="Specify chemical/organic product names, dosage per knapsack sprayer, timing of day, and application method..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid-2 mb-md">
              <div className="form-group">
                <label className="form-label">Estimated Cost (PHP)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="850"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Agronomic Benefit</label>
                <input
                  className="form-control"
                  placeholder="e.g. Prevent 15% ear tip unfilled grain rate"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Dispatching...' : '🚀 Dispatch Prescription to Farmer Dashboard'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescription Audit Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">All Issued Prescriptions & Farmer Acceptance Tracker</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{recs.length} prescriptions total</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recs.map((r) => (
            <div key={r.rec_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[r.category] || '📌'}</span>
                  <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{r.title}</strong>
                  <span className={`badge ${r.priority === 'urgent' ? 'badge-danger' : 'badge-warning'}`}>{r.priority}</span>
                  <span className="badge badge-muted">Farm: {r.farm_id.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Benefit: {r.expected_benefit} · Cost: ₱{r.estimated_cost_php} · Issued by: {r.created_by || 'CropCast Rule Engine'}
                </div>
              </div>
              <div>
                <span className={`badge ${r.status === 'accepted' ? 'badge-success' : 'badge-warning'}`}>
                  {r.status === 'accepted' ? '✓ Accepted by Farmer' : '⏳ Awaiting Farmer'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: Policy Engine & Economic Impact ───────────────────────────
function AdminStrategist({ recs }) {
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    getStrategistAudit().then(setAudit).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ OptiFarm Strategist · Prescriptive Rule Engine & Economics
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Prescriptive Optimization & Economic Impact</h1>
            <p className="page-subtitle">Rule-based decision tree auditing, farmer ROI metrics, and Department of Agriculture compliance</p>
          </div>
        </div>
      </div>

      {/* Economic Impact Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Issued Rules', value: audit?.total_recommendations_issued || recs.length, icon: '📋', color: 'green' },
          { label: 'Farmer Acceptance Rate', value: `${audit?.acceptance_rate_pct || 65}%`, icon: '📈', color: 'green' },
          { label: 'Est. Cohort Net Yield Gain', value: `₱${(audit?.estimated_net_yield_gain_php || 48500).toLocaleString()}`, icon: '💰', color: 'amber' },
          { label: 'Agronomic ROI Multiple', value: `${audit?.roi_multiple || 4.8}x`, icon: '🚀', color: 'green' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Decision Tree Configurator */}
      <div className="card mb-lg">
        <div className="card-title" style={{ marginBottom: 14 }}>Active Prescriptive Decision Engine Rules</div>
        {[
          { rule_id: 'R-01', condition: 'IF soil_moisture < 45% AND temp > 30°C AND rainfall_3d_prob < 30%', action: 'DISPATCH recommendation: Increase drip irrigation frequency by 25%' },
          { rule_id: 'R-02', condition: 'IF fall_armyworm_risk > 65% AND crop_stage == "vegetative_early"', action: 'DISPATCH urgent alert + recommend bio-spray Bt within 48 hours' },
          { rule_id: 'R-03', condition: 'IF soil_potassium < 35 mg/kg AND crop == "corn"', action: 'DISPATCH moderate top-dressing prescription (0-0-60 MOP at 50kg/ha)' },
        ].map((r) => (
          <div key={r.rule_id} style={{ padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: 13 }}>
            <div style={{ fontFamily: 'monospace', color: 'var(--primary-light)', fontWeight: 600 }}>{r.rule_id}: {r.condition}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>↳ {r.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function StrategistPage() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));

    getRecommendations()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await updateRecommendationStatus(id, status);
      setData((prev) => ({
        ...prev,
        recommendations: prev.recommendations.map((r) => r.rec_id === id ? { ...r, status } : r),
      }));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleNewRec(recData) {
    const res = await createRecommendation(recData);
    setData((prev) => ({
      ...prev,
      recommendations: [res.recommendation, ...prev.recommendations],
    }));
  }

  if (loading || !user) return <div className="loading-center"><div className="loading-spinner" /><p>Loading OptiFarm Strategist...</p></div>;

  const recs = data?.recommendations || [];

  if (user.role === 'admin')  return <AdminStrategist recs={recs} />;
  if (user.role === 'expert') return <ExpertStrategist recs={recs} onStatusChange={handleStatusChange} onNewRec={handleNewRec} />;
  return <FarmerStrategist recs={recs} onStatusChange={handleStatusChange} user={user} />;
}
