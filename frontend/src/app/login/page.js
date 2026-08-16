'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { username: 'farmer1', password: 'demo123', role: 'Farmer', icon: '🌽', name: 'Juan Dela Cruz' },
  { username: 'expert1', password: 'demo123', role: 'Expert', icon: '🔬', name: 'Dr. Ana Reyes' },
  { username: 'admin',   password: 'admin123', role: 'Admin',  icon: '⚙️', name: 'Administrator' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('agri_token', data.token);
      localStorage.setItem('agri_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc) {
    setUsername(acc.username);
    setPassword(acc.password);
    setError('');
  }

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-card animate-fade-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🌾</div>
          <div>
            <div className="login-logo-text">AgriInsights</div>
            <div className="login-logo-sub">SEAIT — College of ICT · IT ELEC 4</div>
          </div>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to access your farm analytics dashboard</p>

        {/* Demo Account Chips */}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Demo Login
        </p>
        <div className="demo-chips">
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.username} className="demo-chip" onClick={() => fillDemo(acc)} type="button">
              <span style={{ fontSize: '18px' }}>{acc.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{acc.name}</div>
                <div className="demo-chip-role">{acc.role}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="divider" />

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-control"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--danger)', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button id="login-submit-btn" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : '→ Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          🔒 Protected under RA 10173 — Data Privacy Act of 2012
        </div>
      </div>
    </div>
  );
}
