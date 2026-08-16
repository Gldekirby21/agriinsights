'use client';
import { useEffect, useState, useRef } from 'react';
import { getFarm, getSensors, getFarms } from '@/lib/api';

const SENSOR_ICONS = { soil_moisture: '💧', temperature: '🌡️', soil_npk: '⚗️' };
const BATTERY_COLOR = (pct) => pct <= 20 ? 'var(--danger)' : pct <= 50 ? 'var(--warning)' : 'var(--success)';

export default function FarmPage() {
  const [selectedFarmId, setSelectedFarmId] = useState('f1');
  const [allFarms, setAllFarms] = useState([]);
  const [farm, setFarm] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('agri_user');
    if (u) setUser(JSON.parse(u));
    getFarms().then(setAllFarms).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([getFarm(selectedFarmId), getSensors(selectedFarmId)])
      .then(([f, s]) => {
        setFarm(f);
        setSensors(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedFarmId]);

  // Load Leaflet & update position
  useEffect(() => {
    if (!farm) return;
    const { lat, lng } = farm.location || { lat: 6.3345, lng: 124.8967 };

    if (!mapInstanceRef.current && mapRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (mapRef.current && !mapInstanceRef.current) {
          const L = window.L;
          const map = L.map(mapRef.current).setView([lat, lng], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);
          const marker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${farm.name}</b><br>${farm.location.barangay}, ${farm.location.municipality}`)
            .openPopup();
          mapInstanceRef.current = map;
          markerRef.current = marker;
        }
      };
      document.head.appendChild(script);
    } else if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.setView([lat, lng], 14);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
          .setPopupContent(`<b>${farm.name}</b><br>${farm.location.barangay}, ${farm.location.municipality}`)
          .openPopup();
      }
    }
  }, [farm]);

  if (loading && !farm) return <div className="loading-center"><div className="loading-spinner" /><p>Loading Farm Profile...</p></div>;
  if (!farm) return <div className="empty-state"><p>Farm not found.</p></div>;

  const isMultiFarm = user?.role === 'expert' || user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <span className="module-badge">⌂ {isMultiFarm ? 'Farm Profiles Directory' : 'My Farm Profile'}</span>
            <h1 className="page-title" style={{ marginTop: 10 }}>{farm.name}</h1>
            <p className="page-subtitle">
              {farm.location.barangay}, {farm.location.municipality}, {farm.location.province} · {farm.size} {farm.size_unit}
            </p>
          </div>
          {isMultiFarm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Switch Farm:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
              >
                {allFarms.map((f) => (
                  <option key={f.farm_id} value={f.farm_id}>
                    {f.name} ({f.crop_types.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Farm Info + Map */}
      <div className="grid-2 mb-lg">
        {/* Farm Details */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Farm & Agronomic Profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Farm ID',      value: farm.farm_id.toUpperCase(), icon: '🔖' },
              { label: 'Owner Name',   value: farm.owner?.name || '—', icon: '👤' },
              { label: 'Contact',      value: farm.owner?.contact || '—', icon: '📞' },
              { label: 'Registered Size', value: `${farm.size} ${farm.size_unit}`, icon: '📐' },
              { label: 'Target Crops', value: farm.crop_types.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', '), icon: '🌿' },
              { label: 'Soil Type',    value: farm.soil_type,  icon: '🪨' },
              { label: 'Elevation',    value: `${farm.elevation_m} m AMSL`, icon: '⛰️' },
              { label: 'Status',       value: farm.status.toUpperCase(), icon: '📡' },
              { label: 'GPS Coordinates', value: `${farm.location.lat}°N, ${farm.location.lng}°E`, icon: '🗺️' },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{row.icon}</span>{row.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">Geospatial Farm Plot (Tupi, South Cotabato)</div>
            <div className="card-subtitle">OpenStreetMap PostGIS Geo-Coordinates</div>
          </div>
          <div ref={mapRef} style={{ height: 380, width: '100%', background: 'var(--bg-surface)' }} id="farm-map" />
        </div>
      </div>

      {/* Sensors */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">IoT Telemetry Sensors deployed at {farm.name} ({sensors.length})</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live LoRa/ESP32 Edge Nodes</span>
        </div>
        <div className="grid-3">
          {sensors.map((s) => (
            <div key={s.sensor_id} className="sensor-item" id={`sensor-${s.sensor_id}`} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{SENSOR_ICONS[s.type] || '📡'}</span>
                <span className={`badge ${s.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                  {s.status === 'online' ? '● Online' : '⚠ Low Battery'}
                </span>
              </div>
              <div className="sensor-label">{s.label}</div>
              <div style={{ marginTop: 6 }}>
                <span className="sensor-value">{s.latest_value}</span>
                <span className="sensor-unit"> {s.unit}</span>
              </div>
              <div style={{ width: '100%', marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔋 Battery</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BATTERY_COLOR(s.battery_pct) }}>{s.battery_pct}%</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{
                    width: `${s.battery_pct}%`,
                    background: BATTERY_COLOR(s.battery_pct),
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Node ID: {s.sensor_id.toUpperCase()} · Last packet: {new Date(s.last_reading).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
