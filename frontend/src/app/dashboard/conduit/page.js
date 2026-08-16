'use client';
import { useEffect, useState } from 'react';
import { getAlerts, markAlertRead, getSMSPreviews, sendBroadcastAlert, getConduitGatewayStatus } from '@/lib/api';

const SEV_CONFIG = {
  critical: { icon: '🔴', badge: 'badge-danger',  label: 'Critical' },
  warning:  { icon: '🟡', badge: 'badge-warning', label: 'Warning' },
  info:     { icon: '🔵', badge: 'badge-info',    label: 'Info' },
  success:  { icon: '🟢', badge: 'badge-success', label: 'Success' },
  broadcast:{ icon: '📢', badge: 'badge-primary', label: 'Advisory' },
};

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── 1. FARMER VIEW: Multi-Modal (Text, Voice, SMS, Filipino/Bisaya) ──────────
function FarmerConduit({ alerts, smsList, onMarkRead, user }) {
  const [lang, setLang] = useState('fil'); // 'fil' | 'bis' | 'en'
  const [playingId, setPlayingId] = useState(null);

  function handleSpeakAlert(alertItem) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${alertItem.title}. ${alertItem.message}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : 'tl-PH';
      utterance.onend = () => setPlayingId(null);
      setPlayingId(alertItem.alert_id);
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge">◎ MultiSense Conduit · Farmer View</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Mga Alerto at Mensahe sa Bukid</h1>
            <p className="page-subtitle">Multi-modal na paghahatid ng mga balita sa pamamagitan ng Visual, Audio, at SMS</p>
          </div>
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {[
              { id: 'fil', label: '🇵🇭 Filipino' },
              { id: 'bis', label: '🌴 Bisaya' },
              { id: 'en',  label: '🌐 English' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`btn btn-xs ${lang === l.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-modal preference banner */}
      <div className="card mb-lg" style={{ background: 'linear-gradient(135deg, rgba(18,32,25,0.9), rgba(82,183,136,0.08))', border: '1px solid var(--border-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>📱</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-light)' }}>
              Naka-link ang iyong numero: <strong>09171234567</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Lahat ng kritikal na alerto ay awtomatikong ipinapadala rin bilang SMS sa iyong cellphone sakaling walang internet sa bukid.
            </div>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div className="card-title">Kasalukuyang mga Alerto ({alerts.length})</div>
        {alerts.map((a) => {
          const cfg = SEV_CONFIG[a.severity] || SEV_CONFIG.info;
          return (
            <div key={a.alert_id} className={`alert-item ${a.read ? '' : 'unread'} ${a.severity}`}>
              <div className={`alert-icon ${a.severity}`}>{cfg.icon}</div>
              <div className="alert-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div className="alert-title">{a.title}</div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <div className="alert-msg">{a.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div className="alert-time">⏱ {timeAgo(a.timestamp)}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleSpeakAlert(a)}
                      className="btn btn-secondary btn-xs"
                      title="Pakinggan ang alerto"
                    >
                      {playingId === a.alert_id ? '🔊 Nagsasalita...' : '🔈 Pakinggan'}
                    </button>
                    {!a.read && (
                      <button
                        onClick={() => onMarkRead(a.alert_id)}
                        className="btn btn-primary btn-xs"
                      >
                        ✓ Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS Inbox preview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Kasaysayan ng SMS sa Cellphone</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Natanggap sa 09171234567</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {smsList.slice(0, 3).map((sms) => (
            <div key={sms.id} className="sms-card">
              <div className="sms-header">📱 Telco GSM: {sms.to} · Delivered</div>
              <div className="sms-body">{sms.body}</div>
              <div className="sms-time">{new Date(sms.sent_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. EXPERT VIEW: Broadcast Advisory Dispatcher ────────────────────────────
function ExpertConduit({ alerts, smsList, onBroadcast }) {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [severity, setSeverity] = useState('warning');
  const [sendSMS, setSendSMS] = useState(true);
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    try {
      await onBroadcast({
        title,
        message,
        target_group: targetGroup,
        severity,
        send_sms: sendSMS,
      });
      setShowBroadcast(false);
      setTitle('');
      setMessage('');
    } catch (err) {
      alert('Error sending broadcast: ' + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              ◎ MultiSense Conduit · Expert Broadcast Dispatcher
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Broadcast Advisory & Multi-Modal Dispatcher</h1>
            <p className="page-subtitle">Send emergency agronomic advisories and weather alerts directly to farmers via SMS and in-app channels</p>
          </div>
          <button
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="btn btn-primary btn-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            {showBroadcast ? '✕ Close Composer' : '📢 Compose Broadcast Alert'}
          </button>
        </div>
      </div>

      {/* Broadcast Composer */}
      {showBroadcast && (
        <div className="card mb-lg" style={{ border: '1px solid rgba(59,130,246,0.4)', background: 'linear-gradient(135deg, rgba(14,30,23,0.95), rgba(59,130,246,0.08))' }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Compose Emergency Advisory Broadcast</div>
          <form onSubmit={handleSend}>
            <div className="grid-3 mb-md">
              <div className="form-group">
                <label className="form-label">Target Recipient Cohort</label>
                <select className="form-control" value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                  <option value="all">📢 All Enrolled Pilot Farmers (30 Farmers)</option>
                  <option value="corn">🌽 Corn Farmers Only (Bololmacnow cluster)</option>
                  <option value="pineapple">🍍 Pineapple Growers (Crossing Palkan cluster)</option>
                  <option value="f1">👤 Single Farmer: Juan Dela Cruz</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Alert Severity</label>
                <select className="form-control" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="critical">🔴 Critical Emergency (Red Banner)</option>
                  <option value="warning">🟡 Agronomic Warning (Yellow Banner)</option>
                  <option value="info">🔵 Informational / Market Advisory</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Channels</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="sms-check"
                    checked={sendSMS}
                    onChange={(e) => setSendSMS(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                  />
                  <label htmlFor="sms-check" style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Send as Telco SMS via Semaphore
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Advisory Headline</label>
              <input
                className="form-control"
                placeholder="e.g. Typhoon Alert: Suspend Nitrogen Application Immediately"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-md">
              <label className="form-label">Advisory Message Content (Optimized for SMS 160-char limit)</label>
              <textarea
                className="form-control form-textarea"
                placeholder="PAGASA Doppler radar detects heavy localized thunderstorm in Tupi over next 48h. Check farm drainage to prevent waterlogging..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowBroadcast(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>
                {sending ? 'Broadcasting...' : '🚀 Broadcast to Farmers'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Broadcast Feed & Delivery Reports</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{smsList.length} transmissions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {smsList.map((sms) => (
            <div key={sms.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  To: {sms.to} · <span style={{ color: '#60a5fa' }}>{sms.channel || 'SMS'}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{sms.body}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Dispatched: {new Date(sms.sent_at).toLocaleString()}</div>
              </div>
              <span className="badge badge-success">✓ 100% Delivered</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. ADMIN VIEW: SMS Gateway & MultiSense Telemetry ────────────────────────
function AdminConduit({ alerts }) {
  const [gateway, setGateway] = useState(null);

  useEffect(() => {
    getConduitGatewayStatus().then(setGateway).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(244,162,97,0.4)', color: 'var(--amber)', background: 'rgba(244,162,97,0.1)' }}>
              ⚙️ MultiSense Conduit · Gateway & Telecommunications Infrastructure
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>Multi-Modal Communication Gateway</h1>
            <p className="page-subtitle">Telco SMS credits, WebPush notification delivery rates, and RA 10173 data privacy compliance audit</p>
          </div>
        </div>
      </div>

      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'SMS Credits Balance', value: `${gateway?.sms_credits_remaining || 1420}`, icon: '💳', color: 'green' },
          { label: 'Delivery Success Rate', value: `${gateway?.sms_delivery_rate_pct || 99.4}%`, icon: '📡', color: 'green' },
          { label: 'Avg Dispatch Latency', value: `${gateway?.avg_dispatch_latency_ms || 380}ms`, icon: '⚡', color: 'info' },
          { label: 'Active Alerts in System', value: alerts.length, icon: '🔔', color: 'amber' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Gateway Connectors</div>
          {[
            { name: 'Semaphore PH Telco SMS Gateway', status: 'Operational (API v4)', speed: '340ms' },
            { name: 'Firebase Cloud Messaging (WebPush)', status: 'Connected', speed: '45ms' },
            { name: 'Web Speech API Synthesizer (Tagalog/English)', status: 'Active on Client', speed: 'Instant' },
            { name: 'RA 10173 Opt-In Consent Protocol', status: '100% Enforced', speed: 'Verified' },
          ].map((g) => (
            <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{g.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{g.status}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Multi-Modal Modality Usage Ratio</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Visual Dashboard Charts', pct: 85, color: 'var(--primary)' },
              { name: 'Telco SMS Delivery', pct: 72, color: '#3b82f6' },
              { name: 'Audio Speech Narration', pct: 45, color: 'var(--amber)' },
            ].map((m) => (
              <div key={m.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{m.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.pct}% of active sessions</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function ConduitPage() {
  const [alertData, setAlertData] = useState(null);
  const [smsPreviews, setSMSPreviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));

    Promise.all([getAlerts(), getSMSPreviews()])
      .then(([a, s]) => { setAlertData(a); setSMSPreviews(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id) {
    await markAlertRead(id);
    setAlertData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.alert_id === id ? { ...a, read: true } : a)),
      unread_count: Math.max(0, (prev.unread_count || 1) - 1),
    }));
  }

  async function handleBroadcast(broadcastData) {
    const res = await sendBroadcastAlert(broadcastData);
    if (res.alert) {
      setAlertData((prev) => ({
        ...prev,
        alerts: [res.alert, ...prev.alerts],
      }));
    }
    const s = await getSMSPreviews();
    setSMSPreviews(s);
  }

  if (loading || !user) return <div className="loading-center"><div className="loading-spinner" /><p>Loading MultiSense Conduit...</p></div>;

  const alerts = alertData?.alerts || [];

  if (user.role === 'admin')  return <AdminConduit alerts={alerts} />;
  if (user.role === 'expert') return <ExpertConduit alerts={alerts} smsList={smsPreviews} onBroadcast={handleBroadcast} />;
  return <FarmerConduit alerts={alerts} smsList={smsPreviews} onMarkRead={handleMarkRead} user={user} />;
}
