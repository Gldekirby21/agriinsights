'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAlerts } from '@/lib/api';

const ROLE_NAV_CONFIG = {
  farmer: {
    roleLabel: 'Magsasaka / Farmer',
    roleTag: '🌽 FARMER VIEW',
    sectionLabels: {
      main: 'Pangunahin',
      modules: 'Mga Modyul ng Bukid',
      manage: 'Pamamahala',
    },
    items: [
      { href: '/dashboard', label: 'Aking Bukid (Overview)', feature: null, icon: '⊞', section: 'main' },
      
      { href: '/dashboard/nexus', label: 'Koneksyon sa Sensors', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
      { href: '/dashboard/pulse', label: 'Kalagayan ng Lupa & Ulan', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
      { href: '/dashboard/oracle', label: 'Pagtantiya sa Ani & Peste', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
      { href: '/dashboard/strategist', label: 'Mga Payo at Hakbang', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
      { href: '/dashboard/conduit', label: 'Mga Alerto at Mensahe', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
      
      { href: '/dashboard/farm', label: 'Profile ng Aking Lupa', feature: null, icon: '⌂', section: 'manage' },
      { href: '/dashboard/feedback', label: 'Pagsusuri / Feedback (SUS)', feature: null, icon: '✦', section: 'manage' },
    ],
  },

  expert: {
    roleLabel: 'Agri Expert (Dr. Reyes)',
    roleTag: '🔬 AGRI EXPERT VIEW',
    sectionLabels: {
      main: 'Cohort Monitoring',
      modules: 'Agronomic Analytics',
      manage: 'Advisory & Usability',
    },
    items: [
      { href: '/dashboard', label: 'Farms Cohort Overview', feature: null, icon: '⊞', section: 'main' },
      { href: '/dashboard/farmers', label: 'Direktoryo ng Magsasaka', feature: null, icon: '👥', section: 'main' },
      
      { href: '/dashboard/nexus', label: 'Ingestion & Anomaly Audit', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
      { href: '/dashboard/pulse', label: 'Multi-Farm Diagnostics', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
      { href: '/dashboard/oracle', label: 'What-If ML Simulation', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
      { href: '/dashboard/strategist', label: 'Prescription Builder', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
      { href: '/dashboard/conduit', label: 'Broadcast Dispatcher', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
      
      { href: '/dashboard/farm', label: 'Geospatial Farm Directory', feature: null, icon: '⌂', section: 'manage' },
      { href: '/dashboard/feedback', label: 'SUS Usability Results', feature: null, icon: '📊', section: 'manage' },
    ],
  },

  admin: {
    roleLabel: 'System Administrator',
    roleTag: '⚙️ ADMIN CONTROL',
    sectionLabels: {
      main: 'Operations & Access',
      modules: 'Core Pipeline Engines',
      manage: 'Infrastructure & Audits',
    },
    items: [
      { href: '/dashboard', label: 'System Control Room', feature: null, icon: '⊞', section: 'main' },
      { href: '/dashboard/farmers', label: 'Users & Access Control', feature: null, icon: '👥', section: 'main' },
      
      { href: '/dashboard/nexus', label: 'Pipeline & MQTT Telemetry', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
      { href: '/dashboard/pulse', label: 'Sampling & Calibration', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
      { href: '/dashboard/oracle', label: 'Model Registry & Retrain', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
      { href: '/dashboard/strategist', label: 'Prescriptive Rule Engine', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
      { href: '/dashboard/conduit', label: 'SMS Gateway & Telco DPA', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
      
      { href: '/dashboard/farm', label: 'Node Hardware Registry', feature: null, icon: '⌂', section: 'manage' },
      { href: '/dashboard/feedback', label: 'SUS Research Exports', feature: null, icon: '📊', section: 'manage' },
    ],
  },
};

const PAGE_TITLES = {
  '/dashboard': {
    farmer: { title: 'Aking Bukid (Overview)', sub: 'Status at Buod ng Dela Cruz Cornfield' },
    expert: { title: 'Farms Cohort Overview', sub: 'Monitoring 2 Pilot Farms in Tupi, South Cotabato' },
    admin:  { title: 'System Control Room', sub: 'Full Infrastructure Health & Microservices' },
  },
  '/dashboard/nexus': {
    farmer: { title: 'Koneksyon sa Sensors (DataFusion Nexus)', sub: 'Status ng IoT Sensors, PAGASA, at Presyo sa Merkado' },
    expert: { title: 'Ingestion & Anomaly Audit (DataFusion Nexus)', sub: 'Cross-Farm Telemetry Validation & Anomaly Triage' },
    admin:  { title: 'Pipeline & MQTT Telemetry (DataFusion Nexus)', sub: 'MQTT Port 8883, TimescaleDB Storage & Ingestion DAG' },
  },
  '/dashboard/pulse': {
    farmer: { title: 'Kalagayan ng Lupa & Ulan (AgriVision Pulse)', sub: 'Halumigmig, NPK Pataba, at Ulat Panahon' },
    expert: { title: 'Multi-Farm Descriptive Diagnostics (AgriVision Pulse)', sub: 'F1 vs F2 vs Baseline Soil Chemistry & Evapotranspiration' },
    admin:  { title: 'Sampling & Sensor Calibration (AgriVision Pulse)', sub: 'Sensor Polling Intervals, Calibration Offsets & CSV Export' },
  },
  '/dashboard/oracle': {
    farmer: { title: 'Pagtantiya sa Ani & Peste (CropCast Oracle)', sub: 'AI Forecast sa Dami ng Ani at Hakbang Laban sa Uod' },
    expert: { title: 'What-If ML Simulation Sandbox (CropCast Oracle)', sub: 'Climate Stress Sliders, XGB-LSTM Metrics & Feature Weights' },
    admin:  { title: 'Model Registry & Drift Telemetry (CropCast Oracle)', sub: 'Algorithm Versioning, Latency & Automated Model Retraining' },
  },
  '/dashboard/strategist': {
    farmer: { title: 'Mga Payo at Hakbang sa Bukid (OptiFarm Strategist)', sub: 'Mga Hakbang upang Makatipid at Mapalaki ang Ani' },
    expert: { title: 'Agronomic Prescription Builder (OptiFarm Strategist)', sub: 'Formulate Chemical/Fertilizer Prescriptions & Review Queue' },
    admin:  { title: 'Prescriptive Rule Engine (OptiFarm Strategist)', sub: 'IF-THEN Decision Trees, ROI Analytics & Policy Compliance' },
  },
  '/dashboard/conduit': {
    farmer: { title: 'Mga Alerto at Mensahe (MultiSense Conduit)', sub: 'Visual, Audio Voice, at SMS Notifications sa Cellphone' },
    expert: { title: 'Emergency Broadcast Dispatcher (MultiSense Conduit)', sub: 'Dispatch SMS Blasts & In-App Advisories to 30 Enrolled Farmers' },
    admin:  { title: 'SMS Gateway & Telco Infrastructure (MultiSense Conduit)', sub: 'Semaphore Credits, Delivery Rates & RA 10173 DPA Audit' },
  },
  '/dashboard/farm': {
    farmer: { title: 'Profile ng Aking Lupa', sub: 'Dela Cruz Cornfield GPS Plot & IoT Node Readings' },
    expert: { title: 'Geospatial Farm Directory', sub: 'PostGIS GIS Plots & Live Node Telemetry per Farm' },
    admin:  { title: 'Node Hardware & Farm Registry', sub: 'Hardware ID, Battery Levels & Plot Boundary Records' },
  },
  '/dashboard/feedback': {
    farmer: { title: 'Pagsusuri / Feedback (SUS)', sub: 'Sagutan ang 10-Question Usability Scale Form' },
    expert: { title: 'SUS Usability Results & Analytics', sub: 'Usability Evaluation Scores & Pilot Feedback Records' },
    admin:  { title: 'SUS Research Evaluation & Data Exports', sub: 'Aggregated Usability Metrics for IT ELEC 4 Research Study' },
  },
  '/dashboard/farmers': {
    expert: { title: 'Direktoryo ng mga Magsasaka', sub: 'All Registered Farmers & Farm Holdings in Tupi, South Cotabato' },
    admin:  { title: 'User & Access Management', sub: 'Role-Based Access Control (RBAC) & User Accounts' },
  },
};

const ROLE_COLORS = { farmer: '#52b788', expert: '#3b82f6', admin: '#f4a261' };

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('agri_token');
    const storedUser = localStorage.getItem('agri_user');
    if (!token) { router.replace('/login'); return; }
    if (storedUser) setUser(JSON.parse(storedUser));
    getAlerts().then((d) => setUnreadAlerts(d.unread_count || 0)).catch(() => {});
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    router.replace('/login');
  }

  const role = user?.role || 'farmer';
  const roleConfig = ROLE_NAV_CONFIG[role] || ROLE_NAV_CONFIG.farmer;
  const navItems = roleConfig.items;
  const sectionLabels = roleConfig.sectionLabels;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.farmer;

  const pageInfoObj = PAGE_TITLES[pathname];
  const pageInfo = pageInfoObj
    ? (pageInfoObj[role] || pageInfoObj.farmer || { title: 'Dashboard', sub: '' })
    : { title: 'Dashboard', sub: '' };

  return (
    <div className="app-shell">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌾</div>
          <div>
            <div className="sidebar-logo-text">AgriInsights</div>
            <div className="sidebar-logo-sub">SEAIT · IT ELEC 4</div>
          </div>
        </div>

        {/* Role Badge */}
        <div style={{ padding: '10px 16px 6px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: `${roleColor}15`,
            border: `1px solid ${roleColor}40`,
            borderRadius: 'var(--radius-full)',
            fontSize: 10.5,
            fontWeight: 700,
            color: roleColor,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            width: '100%',
            justifyContent: 'center',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor, display: 'inline-block' }} />
            {roleConfig.roleTag}
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Main section */}
          <div className="sidebar-section-label">{sectionLabels.main}</div>
          {navItems.filter((n) => n.section === 'main').map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.replace(/\//g, '-').slice(1) || 'home'}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '16px', width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <div className="nav-item-content">
                  <div className="nav-item-title">{item.label}</div>
                  {item.feature && <div className="nav-item-feature">{item.feature}</div>}
                </div>
              </Link>
            );
          })}

          {/* Modules section */}
          <div className="sidebar-section-label" style={{ marginTop: 10 }}>{sectionLabels.modules}</div>
          {navItems.filter((n) => n.section === 'modules').map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '16px', width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <div className="nav-item-content">
                  <div className="nav-item-title">{item.label}</div>
                  {item.feature && <div className="nav-item-feature">{item.feature}</div>}
                </div>
                {item.alertKey && unreadAlerts > 0 && (
                  <span className="nav-badge">{unreadAlerts}</span>
                )}
              </Link>
            );
          })}

          {/* Management section */}
          <div className="sidebar-section-label" style={{ marginTop: 10 }}>{sectionLabels.manage}</div>
          {navItems.filter((n) => n.section === 'manage').map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '16px', width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <div className="nav-item-content">
                  <div className="nav-item-title">{item.label}</div>
                  {item.feature && <div className="nav-item-feature">{item.feature}</div>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Chip */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-chip" onClick={handleLogout} title="Click to logout" id="logout-btn">
              <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)` }}>
                {user.avatar_initials || user.name?.[0]}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{roleConfig.roleLabel} · Sign out</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Topbar ──────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">{pageInfo.title}</div>
          <div className="topbar-breadcrumb">{pageInfo.sub}</div>
        </div>
        <div className="topbar-right">
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tupi, South Cotabato</div>
          <Link href="/dashboard/conduit" id="alerts-topbar-btn" className="topbar-btn" title="Alerts">
            <span>🔔</span>
            {unreadAlerts > 0 && <span className="badge">{unreadAlerts}</span>}
          </Link>
          <div
            id="user-avatar-topbar"
            className="topbar-btn"
            style={{ borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, color: 'white', fontWeight: 700, fontSize: 13 }}
            title={`${user?.name} (${roleConfig.roleLabel})`}
          >
            {user?.avatar_initials || '?'}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="main-content">
        <div className="page-inner animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
