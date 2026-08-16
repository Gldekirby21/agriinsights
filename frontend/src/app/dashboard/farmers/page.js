'use client';
import { useEffect, useState } from 'react';
import { getFarmers, getFarms, getSensors } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FarmersPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    const parsed = u ? JSON.parse(u) : null;
    setUser(parsed);
    // Redirect farmers away — this page is expert/admin only
    if (parsed?.role === 'farmer') { router.replace('/dashboard'); return; }
    Promise.all([getFarmers(), getFarms()])
      .then(([fa, fr]) => { setFarmers(fa); setFarms(fr); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="loading-center"><div className="loading-spinner" /><p>Loading farmers...</p></div>;

  const filtered = farmers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    f.location?.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge" style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa', background: 'rgba(59,130,246,0.1)' }}>
              👥 {isAdmin ? 'All Users & Farms' : 'All Farmers'}
            </span>
            <h1 className="page-title" style={{ marginTop: 10 }}>{isAdmin ? 'User & Farm Management' : 'Registered Farmers'}</h1>
            <p className="page-subtitle">
              {isAdmin ? 'Full administrative view of all users, farms, and their status' : 'All farmers enrolled in the AgriInsights pilot — Tupi, South Cotabato'}
            </p>
          </div>
          <div className="flex" style={{ gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-heading)', textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{farmers.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Farmers</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)', margin: '0 8px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{farms.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Farms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          id="farmer-search"
          className="form-control"
          style={{ maxWidth: 380 }}
          placeholder="🔍 Search by name, username, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Farmer + Farm Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((farmer) => {
          const farmerFarms = farms.filter((f) => farmer.farm_ids?.includes(f.farm_id));
          return (
            <div key={farmer.user_id} className="card" id={`farmer-${farmer.user_id}`} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {/* Farmer Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 260 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(82,183,136,0.15)', border: '2px solid rgba(82,183,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}>
                    {farmer.avatar_initials || farmer.name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>{farmer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>@{farmer.username}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">🌽 Farmer</span>
                      <span className="badge badge-muted">📞 {farmer.contact}</span>
                      <span className="badge badge-muted">📍 {farmer.location}</span>
                      <span className="badge badge-muted">🗣️ {farmer.preferred_language}</span>
                    </div>
                  </div>
                </div>

                {/* Farm Cards */}
                <div style={{ display: 'flex', gap: 12, flex: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {farmerFarms.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No farms registered.</div>
                  ) : farmerFarms.map((farm) => (
                    <div key={farm.farm_id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', minWidth: 220, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{farm.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        {farm.location.barangay} · {farm.size} ha · {farm.soil_type}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                        {farm.crop_types.map((c) => <span key={c} className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: 10 }}>{c}</span>)}
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>📡 {farm.sensors.length} sensors</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/dashboard/pulse?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">Pulse</Link>
                        <Link href={`/dashboard/oracle?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">Oracle</Link>
                        <Link href={`/dashboard/farm?farm=${farm.farm_id}`} className="btn btn-secondary btn-xs">Profile</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state"><p>No farmers match your search.</p></div>
        )}
      </div>

      {/* Expert info — read-only note */}
      {!isAdmin && (
        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 16px' }}>
          🔬 As an Agricultural Expert, you have read-only access to farmer profiles. Use the module links above to analyze any farm's data.
        </div>
      )}
    </div>
  );
}
