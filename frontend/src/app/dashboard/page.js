'use client';
import { useEffect, useState } from 'react';
import { getDescriptiveAnalytics, getAlerts, getRecommendations, getForecasts, getFarmers, getFarms } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

function AnimatedCounter({ target, suffix = '' }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(target / 40, 1);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(interval); }
      else setValue(Math.floor(start));
    }, 20);
    return () => clearInterval(interval);
  }, [target]);
  return <>{value}{suffix}</>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

// ─── FARMER VIEW ──────────────────────────────────────────────────────────────
function FarmerOverview({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recs, setRecs] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDescriptiveAnalytics('f1'), getAlerts('f1'), getRecommendations('f1'), getForecasts('f1')])
      .then(([a, al, r, f]) => { setAnalytics(a); setAlerts(al.alerts?.slice(0, 3) || []); setRecs(r); setForecasts(f); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="loading-spinner" /><p>Loading your farm data...</p></div>;

  const weatherData = analytics?.weather_series?.slice(-14) || [];
  const yieldForecast = forecasts?.yield_projection_14d || [];
  const sevIcon = { critical: '🔴', warning: '🟡', info: '🔵', success: '🟢' };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening at <strong style={{ color: 'var(--primary)' }}>Dela Cruz Cornfield</strong> today · {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="stat-cards-grid">
        {[
          { icon: '🌡️', label: 'Current Temp', value: `${Math.round(analytics?.latest_weather?.temperature || 29)}°C`, sub: '↑ +0.8° vs yesterday', color: 'green', subColor: 'var(--success)' },
          { icon: '🌧️', label: '30-Day Rainfall', value: `${Math.round(analytics?.summary?.total_rainfall_30d_mm || 0)}mm`, sub: '↑ Above average', color: 'amber', subColor: 'var(--success)' },
          { icon: '💧', label: 'Soil Moisture', value: `${Math.round(analytics?.latest_soil?.moisture || 62)}%`, sub: '↓ Slightly high', color: 'green', subColor: 'var(--warning)' },
          { icon: '🌽', label: 'Yield Forecast', value: '4.2 t/ha', sub: '82% confidence', color: 'amber', subColor: 'var(--success)' },
          { icon: '🐛', label: 'Pest Risk', value: '68%', sub: '⚠ Moderate–High', color: 'danger', subColor: 'var(--warning)' },
          { icon: '💡', label: 'Pending Actions', value: String(recs?.summary?.total || 4), sub: `${recs?.summary?.urgent || 1} urgent`, color: 'info', subColor: 'var(--danger)' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-change" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Temperature — 14 Days</div><div className="card-subtitle">°C</div></div></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData}>
                <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#52b788" stopOpacity={0.3} /><stop offset="95%" stopColor="#52b788" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[24, 35]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#52b788" fill="url(#tg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Yield Forecast — 14 Days</div><div className="card-subtitle">t/ha · Corn</div></div></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldForecast}>
                <defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f4a261" stopOpacity={0.3} /><stop offset="95%" stopColor="#f4a261" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[3, 5.5]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="predicted_yield" name="Yield (t/ha)" stroke="#f4a261" fill="url(#yg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Alerts</div><Link href="/dashboard/conduit" className="btn btn-secondary btn-xs">View All</Link></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a) => (
              <div key={a.alert_id} className={`alert-item ${a.read ? '' : 'unread'} ${a.severity}`}>
                <div className={`alert-icon ${a.severity}`}>{sevIcon[a.severity] || '📢'}</div>
                <div className="alert-content">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-msg" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 250 }}>{a.message}</div>
                  <div className="alert-time">{new Date(a.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Priority Action</div><Link href="/dashboard/strategist" className="btn btn-secondary btn-xs">All Recs</Link></div>
          <div className="rec-card urgent" style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="rec-header"><span style={{ fontSize: 20 }}>🐛</span><span className="badge badge-danger">Urgent</span></div>
            <div className="rec-title">Apply Fall Armyworm Treatment</div>
            <div className="rec-desc">High pest risk detected. Apply treatment in the next 48 hours on early-whorl corn plants.</div>
            <div className="rec-footer"><span className="rec-cost">Cost: ~₱850</span><span className="rec-benefit">Prevent ~0.8 t/ha loss</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPERT VIEW ──────────────────────────────────────────────────────────────
function ExpertOverview({ user }) {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFarms(), getFarmers(), getAlerts()])
      .then(([f, fa, al]) => { setFarms(f); setFarmers(fa); setAllAlerts(al.alerts || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="loading-spinner" /><p>Loading farms overview...</p></div>;

  const criticalAlerts = allAlerts.filter((a) => a.severity === 'critical' || a.severity === 'warning');
  const unread = allAlerts.filter((a) => !a.read).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Farms Overview 🔬</h1>
        <p className="page-subtitle">Welcome, <strong style={{ color: '#3b82f6' }}>{user?.name}</strong> — Monitoring {farms.length} active farm{farms.length !== 1 ? 's' : ''} across Tupi, South Cotabato</p>
      </div>

      {/* Expert Stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: '🏡', label: 'Farms Monitored',   value: farms.length,             color: 'green' },
          { icon: '👨‍🌾', label: 'Registered Farmers', value: farmers.length,           color: 'green' },
          { icon: '🔴', label: 'Critical Alerts',   value: criticalAlerts.length,    color: 'danger' },
          { icon: '📬', label: 'Unread Alerts',     value: unread,                   color: unread > 0 ? 'danger' : 'green' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value"><AnimatedCounter target={s.value} /></div>
          </div>
        ))}
      </div>

      {/* Farm Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Farm Status</div>
        <div className="grid-2">
          {farms.map((farm) => {
            const owner = farmers.find((f) => f.user_id === farm.owner_id);
            const farmAlerts = allAlerts.filter((a) => a.farm_id === farm.farm_id);
            const hasCritical = farmAlerts.some((a) => a.severity === 'critical');
            return (
              <div key={farm.farm_id} className="card" style={{ borderLeft: `4px solid ${hasCritical ? 'var(--danger)' : 'var(--primary)'}` }}>
                <div className="flex-between mb-md">
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{farm.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{farm.location.barangay}, {farm.location.municipality} · {farm.size} ha</div>
                  </div>
                  <span className={`badge ${hasCritical ? 'badge-danger' : 'badge-success'}`}>{hasCritical ? '⚠ Alert' : '✓ Normal'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  {farm.crop_types.map((c) => <span key={c} className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{c}</span>)}
                  <span className="badge badge-muted">{farm.soil_type}</span>
                  <span className="badge badge-muted">{farm.sensors.length} sensors</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  👤 Owner: <strong style={{ color: 'var(--text-primary)' }}>{owner?.name || '—'}</strong> · {owner?.contact}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/dashboard/pulse?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">📊 Pulse</Link>
                  <Link href={`/dashboard/oracle?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">🔮 Oracle</Link>
                  <Link href={`/dashboard/strategist?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">💡 Strategist</Link>
                  <Link href={`/dashboard/farm?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">⌂ Profile</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Critical Alerts */}
      <div className="card">
        <div className="card-header"><div className="card-title">All Farms — Recent Alerts</div><Link href="/dashboard/conduit" className="btn btn-secondary btn-xs">View All</Link></div>
        {criticalAlerts.length === 0 ? (
          <div className="empty-state"><p>No critical alerts across all farms.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {criticalAlerts.slice(0, 4).map((a) => (
              <div key={a.alert_id} className={`alert-item ${a.severity}`}>
                <div className={`alert-icon ${a.severity}`}>{a.severity === 'critical' ? '🔴' : '🟡'}</div>
                <div className="alert-content">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-msg" style={{ fontSize: 12 }}>{a.message}</div>
                  <div className="alert-time">Farm: {a.farm_id.toUpperCase()} · {new Date(a.timestamp).toLocaleString('en-PH')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminOverview({ user }) {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFarms(), getFarmers(), getAlerts()])
      .then(([f, fa, al]) => { setFarms(f); setFarmers(fa); setAllAlerts(al.alerts || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="loading-spinner" /><p>Loading system overview...</p></div>;

  const totalSensors = farms.reduce((s, f) => s + f.sensors.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">System Overview ⚙️</h1>
        <p className="page-subtitle">Welcome, <strong style={{ color: '#f4a261' }}>{user?.name}</strong> — Full administrative access to AgriInsights</p>
      </div>

      {/* Admin System Stats */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: '👨‍🌾', label: 'Registered Farmers', value: farmers.length,    color: 'green' },
          { icon: '🏡', label: 'Active Farms',         value: farms.length,      color: 'green' },
          { icon: '📡', label: 'IoT Sensors',          value: totalSensors,      color: 'amber' },
          { icon: '🔔', label: 'Total Alerts',         value: allAlerts.length,  color: allAlerts.filter(a=>!a.read).length > 0 ? 'danger' : 'green' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value"><AnimatedCounter target={s.value} /></div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="grid-2 mb-lg">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>System Health</div>
          {[
            { label: 'Backend API',         status: 'Operational',  ok: true },
            { label: 'DataFusion Pipeline', status: 'Healthy',      ok: true },
            { label: 'IoT Sensor Network',  status: '4/5 Online',   ok: true },
            { label: 'Satellite Feed',      status: 'Partial',      ok: false },
            { label: 'Market Data Feed',    status: 'Connected',    ok: true },
            { label: 'Weather API',         status: 'Connected',    ok: true },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: item.ok ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.ok ? 'var(--success)' : 'var(--warning)', display: 'inline-block' }} />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>User Accounts</div>
          {[...farmers, { user_id: 'u3', name: 'Dr. Ana Reyes', role: 'expert', contact: '09201112222', location: 'GenSan' }].map((u) => (
            <div key={u.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.role === 'expert' ? 'rgba(59,130,246,0.2)' : 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: u.role === 'expert' ? '#3b82f6' : 'var(--primary)' }}>
                  {u.name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.contact}</div>
                </div>
              </div>
              <span className={`badge ${u.role === 'expert' ? 'badge-info' : 'badge-primary'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
            </div>
          ))}
          <Link href="/dashboard/farmers" className="btn btn-secondary btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
            Manage All Users
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
        <div className="grid-4">
          {[
            { href: '/dashboard/nexus',      label: 'Pipeline Status',  icon: '⬡', desc: 'Check data ingestion' },
            { href: '/dashboard/conduit',    label: 'Manage Alerts',    icon: '🔔', desc: `${allAlerts.filter(a=>!a.read).length} unread` },
            { href: '/dashboard/feedback',   label: 'SUS Results',      icon: '📊', desc: 'View evaluation data' },
            { href: '/dashboard/farmers',    label: 'All Users',        icon: '👥', desc: `${farmers.length + 2} accounts` },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="card" style={{ textDecoration: 'none', cursor: 'pointer', padding: 18 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return <div className="loading-center"><div className="loading-spinner" /></div>;

  if (user.role === 'expert') return <ExpertOverview user={user} />;
  if (user.role === 'admin')  return <AdminOverview  user={user} />;
  return <FarmerOverview user={user} />;
}
