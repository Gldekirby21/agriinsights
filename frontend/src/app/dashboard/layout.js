'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAlerts } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(2);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('agri_user');
    const token = localStorage.getItem('agri_token');
    if (!token || !raw) {
      router.replace('/login');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace('/login');
    }
    getAlerts()
      .then((arr) => {
        if (Array.isArray(arr)) {
          setUnreadAlerts(arr.filter((a) => !a.read).length);
        }
      })
      .catch(() => {});
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    router.push('/login');
  }

  const role = user?.role || 'farmer';

  // Dynamic Navigation definitions based on Language (English / Tagalog)
  const navConfigs = {
    farmer: {
      roleLabel: lang === 'tl' ? 'Magsasaka / Farmer' : 'Farmer / Kasama',
      roleTag: lang === 'tl' ? '🌽 TINGIN NG MAGSASAKA' : '🌽 FARMER VIEW',
      sectionLabels: {
        main: t('section_main'),
        modules: t('section_modules'),
        manage: t('section_manage'),
      },
      items: [
        { href: '/dashboard', label: lang === 'tl' ? 'Aking Bukid (Overview)' : 'My Farm Overview', feature: null, icon: '⊞', section: 'main' },
        { href: '/dashboard/nexus', label: lang === 'tl' ? 'Koneksyon sa Sensors' : 'Sensor Connectivity', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
        { href: '/dashboard/pulse', label: lang === 'tl' ? 'Kalagayan ng Lupa & Ulan' : 'Soil & Weather Diagnostics', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
        { href: '/dashboard/oracle', label: lang === 'tl' ? 'Pagtantiya sa Ani & Peste' : 'Crop & Pest Forecasts', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
        { href: '/dashboard/strategist', label: lang === 'tl' ? 'Mga Payo at Hakbang' : 'Prescriptive Actions', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
        { href: '/dashboard/conduit', label: lang === 'tl' ? 'Mga Alerto at Mensahe' : 'Alerts & Messages', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
        { href: '/dashboard/farm', label: lang === 'tl' ? 'Profile ng Aking Lupa' : 'Farm Plot Profile', feature: null, icon: '⌂', section: 'manage' },
        { href: '/dashboard/feedback', label: lang === 'tl' ? 'Pagsusuri / Feedback (SUS)' : 'SUS Usability Survey', feature: null, icon: '✦', section: 'manage' },
      ],
    },
    expert: {
      roleLabel: lang === 'tl' ? 'Eksperto sa Agrikultura' : 'Agri Expert (Dr. Reyes)',
      roleTag: lang === 'tl' ? '🔬 TINGIN NG EKSPERTO' : '🔬 AGRI EXPERT VIEW',
      sectionLabels: {
        main: lang === 'tl' ? 'Pagsubaybay sa Cohort' : 'Cohort Monitoring',
        modules: lang === 'tl' ? 'Agronomic Analytics' : 'Agronomic Analytics',
        manage: lang === 'tl' ? 'Payo at Pagsusuri' : 'Advisory & Usability',
      },
      items: [
        { href: '/dashboard', label: lang === 'tl' ? 'Pangkalahatang Tanaw sa Bukid' : 'Farms Cohort Overview', feature: null, icon: '⊞', section: 'main' },
        { href: '/dashboard/farmers', label: lang === 'tl' ? 'Direktoryo ng Magsasaka' : 'Farmer Directory', feature: null, icon: '👥', section: 'main' },
        { href: '/dashboard/nexus', label: lang === 'tl' ? 'Pagsusuri ng Sensor Ingestion' : 'Ingestion & Anomaly Audit', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
        { href: '/dashboard/pulse', label: lang === 'tl' ? 'Multi-Farm Diagnostics' : 'Multi-Farm Diagnostics', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
        { href: '/dashboard/oracle', label: lang === 'tl' ? 'What-If ML Simulation' : 'What-If ML Simulation', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
        { href: '/dashboard/strategist', label: lang === 'tl' ? 'Tagagawa ng Reseta / Payo' : 'Prescription Builder', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
        { href: '/dashboard/conduit', label: lang === 'tl' ? 'Tagapagpadala ng Broadcast' : 'Broadcast Dispatcher', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
        { href: '/dashboard/farm', label: lang === 'tl' ? 'Geospatial Farm Directory' : 'Geospatial Farm Directory', feature: null, icon: '⌂', section: 'manage' },
        { href: '/dashboard/feedback', label: lang === 'tl' ? 'Resulta ng SUS Usability' : 'SUS Usability Results', feature: null, icon: '📊', section: 'manage' },
      ],
    },
    admin: {
      roleLabel: lang === 'tl' ? 'Tagapangasiwa ng Sistema' : 'System Administrator',
      roleTag: lang === 'tl' ? '⚙️ KONTROL NG ADMIN' : '⚙️ ADMIN CONTROL',
      sectionLabels: {
        main: lang === 'tl' ? 'Operasyon at Akses' : 'Operations & Access',
        modules: lang === 'tl' ? 'Mga Core Pipeline Engine' : 'Core Pipeline Engines',
        manage: lang === 'tl' ? 'Impraestruktura at Audit' : 'Infrastructure & Audits',
      },
      items: [
        { href: '/dashboard', label: lang === 'tl' ? 'Kontrol ng Sistema' : 'System Operations Control', feature: null, icon: '⊞', section: 'main' },
        { href: '/dashboard/farmers', label: lang === 'tl' ? 'Pamamahala ng mga Gumagamit' : 'User Access & Farmers', feature: null, icon: '👥', section: 'main' },
        { href: '/dashboard/nexus', label: lang === 'tl' ? 'Pipeline Telemetry & Broker' : 'Pipeline Telemetry & Broker', feature: 'DataFusion Nexus', icon: '⬡', section: 'modules' },
        { href: '/dashboard/pulse', label: lang === 'tl' ? 'Kalusugan ng IoT Sensor Nodes' : 'IoT Hardware Diagnostics', feature: 'AgriVision Pulse', icon: '◈', section: 'modules' },
        { href: '/dashboard/oracle', label: lang === 'tl' ? 'Pamamahala ng ML Models' : 'Model Registry & Drift', feature: 'CropCast Oracle', icon: '◉', section: 'modules' },
        { href: '/dashboard/strategist', label: lang === 'tl' ? 'Makina ng Desisyon (Analytics)' : 'Prescription Rules Engine', feature: 'OptiFarm Strategist', icon: '◆', section: 'modules' },
        { href: '/dashboard/conduit', label: lang === 'tl' ? 'Log ng Pagpapadala ng Alerto' : 'Gateway SMS / Push Audit', feature: 'MultiSense Conduit', icon: '◎', section: 'modules', alertKey: true },
        { href: '/dashboard/farm', label: lang === 'tl' ? 'Geospatial GIS Boundaries' : 'Geospatial GIS Boundaries', feature: null, icon: '⌂', section: 'manage' },
        { href: '/dashboard/feedback', label: lang === 'tl' ? 'Buong Tala ng SUS Evaluation' : 'SUS Evaluation Logs', feature: null, icon: '📊', section: 'manage' },
      ],
    },
  };

  const roleConfig = navConfigs[role] || navConfigs.farmer;
  const navItems = roleConfig.items;
  const sectionLabels = roleConfig.sectionLabels;

  const roleColor =
    role === 'admin'
      ? '#f4a261'
      : role === 'expert'
      ? '#60a5fa'
      : '#52b788';

  const PAGE_HEADINGS = {
    '/dashboard': {
      title: lang === 'tl' ? 'Aking Bukid (Overview)' : 'My Farm Overview',
      sub: lang === 'tl' ? 'Katayuan at Buod ng Dela Cruz Cornfield' : 'Status and Summary for Dela Cruz Cornfield',
    },
    '/dashboard/nexus': {
      title: lang === 'tl' ? 'Koneksyon sa Sensors (DataFusion Nexus)' : 'Sensor Connectivity (DataFusion Nexus)',
      sub: lang === 'tl' ? 'Status ng IoT Sensors, PAGASA, at Presyo sa Merkado' : 'Real-time telemetry from IoT, PAGASA, and DA feeds',
    },
    '/dashboard/pulse': {
      title: lang === 'tl' ? 'Kalagayan ng Lupa & Ulan (AgriVision Pulse)' : 'Soil & Weather Diagnostics (AgriVision Pulse)',
      sub: lang === 'tl' ? 'Pagsusuri ng halumigmig, ulan, at sustansya sa lupa' : 'Soil moisture, rainfall patterns, and NPK nutrients',
    },
    '/dashboard/oracle': {
      title: lang === 'tl' ? 'Pagtantiya sa Ani & Peste (CropCast Oracle)' : 'Crop Yield & Pest Forecasts (CropCast Oracle)',
      sub: lang === 'tl' ? 'Pagtantiya gamit ang Machine Learning at AI' : 'Predictive models for yield projection and pest outbreak risks',
    },
    '/dashboard/strategist': {
      title: lang === 'tl' ? 'Mga Payo at Hakbang (OptiFarm Strategist)' : 'Prescriptive Action Plans (OptiFarm Strategist)',
      sub: lang === 'tl' ? 'Matalinong payo sa pagpapataba, patubig, at pananim' : 'Prescriptive optimization for fertilizer, water, and harvesting',
    },
    '/dashboard/conduit': {
      title: lang === 'tl' ? 'Mga Alerto at Mensahe (MultiSense Conduit)' : 'Alerts & Messages (MultiSense Conduit)',
      sub: lang === 'tl' ? 'Multi-modal na paghahatid ng balita sa bukid' : 'Multi-modal broadcasts across Visual, Voice Audio, and SMS',
    },
    '/dashboard/farm': {
      title: lang === 'tl' ? 'Profile ng Aking Lupa' : 'Farm Plot Profile & GIS Mapping',
      sub: lang === 'tl' ? 'Sukat, tanim, at coordinate sa Tupi, South Cotabato' : 'Land parcels, crops, and elevation in Tupi, South Cotabato',
    },
    '/dashboard/farmers': {
      title: lang === 'tl' ? 'Direktoryo ng mga Magsasaka' : 'Farmer Directory & Cohort Management',
      sub: lang === 'tl' ? 'Talaan ng mga magsasaka at sakahan sa Tupi pilot program' : 'Enrolled pilot farmers and geospatial parcels in Tupi',
    },
    '/dashboard/feedback': {
      title: lang === 'tl' ? 'Pagsusuri ng Sistema (SUS Usability)' : 'System Usability Scale (SUS) Evaluation',
      sub: lang === 'tl' ? 'Pamantayang pagsusuri ng dali ng paggamit ng AgriInsights' : 'Standardized Brooke (1996) SUS usability evaluation questionnaire',
    },
  };

  const pageInfo = PAGE_HEADINGS[pathname] || {
    title: 'AgriInsights',
    sub: 'Multi-Modal Agricultural Analytics',
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌾</div>
          <div className="sidebar-logo-text-wrap">
            <div className="sidebar-logo-text">AgriInsights</div>
            <div className="sidebar-logo-sub">SEAIT · IT ELEC 4</div>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div style={{ padding: '10px 16px 4px' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: `linear-gradient(135deg, ${roleColor}22, ${roleColor}0a)`,
              border: `1px solid ${roleColor}44`,
              fontSize: '11px',
              fontWeight: 700,
              color: roleColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              letterSpacing: '0.4px',
            }}
          >
            <span>{roleConfig.roleTag}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {/* Main section */}
          <div className="sidebar-section-label">{sectionLabels.main}</div>
          {navItems.filter((n) => n.section === 'main').map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.replace(/\//g, '-').slice(1) || 'overview'}`}
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
            <div className="user-chip" onClick={handleLogout} title={lang === 'tl' ? 'Pindutin para mag-sign out' : 'Click to sign out'} id="logout-btn">
              <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)` }}>
                {user.avatar_initials || user.name?.[0]}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{roleConfig.roleLabel} · {t('sign_out')}</div>
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
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>{t('location')}</div>
          {/* Dual Language Switcher */}
          <LanguageToggle />
          {/* Theme Mode Toggle */}
          <ThemeToggle />
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
