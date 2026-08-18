/**
 * AgriInsights API Client
 * Centralized API client with JWT auth header handling
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agri_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const getMe = () => apiFetch('/api/auth/me');

// ─── DataFusion Nexus ─────────────────────────────────────────────────────────
export const getNexusData = () => apiFetch('/api/nexus/data');
export const getNexusSources = () => apiFetch('/api/nexus/sources');
export const getNexusLogs = () => apiFetch('/api/nexus/logs');
export const triggerNexusSync = (source = 'all') =>
  apiFetch('/api/nexus/sync', { method: 'POST', body: JSON.stringify({ source }) });
export const getNexusTelemetry = () => apiFetch('/api/nexus/telemetry');

// ─── AgriVision Pulse ─────────────────────────────────────────────────────────
export const getDescriptiveAnalytics = (farmId = 'f1') =>
  apiFetch(`/api/pulse/descriptive?farm_id=${farmId}`);
export const getPulseComparison = () => apiFetch('/api/pulse/compare');

// ─── CropCast Oracle ──────────────────────────────────────────────────────────
export const getForecasts = (farmId = 'f1') =>
  apiFetch(`/api/oracle/forecast?farm_id=${farmId}`);
export const simulateScenario = (params) =>
  apiFetch('/api/oracle/simulate', { method: 'POST', body: JSON.stringify(params) });
export const retrainModel = () =>
  apiFetch('/api/oracle/retrain', { method: 'POST' });

// ─── OptiFarm Strategist ──────────────────────────────────────────────────────
export const getRecommendations = (farmId) =>
  apiFetch(`/api/strategist/recommendations${farmId ? `?farm_id=${farmId}` : ''}`);

export const updateRecommendationStatus = (id, status) =>
  apiFetch(`/api/strategist/recommendations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const createRecommendation = (recData) =>
  apiFetch('/api/strategist/create', { method: 'POST', body: JSON.stringify(recData) });

export const getStrategistAudit = () => apiFetch('/api/strategist/audit');

// ─── MultiSense Conduit ───────────────────────────────────────────────────────
export const getAlerts = (farmId) =>
  apiFetch(`/api/conduit/alerts${farmId ? `?farm_id=${farmId}` : ''}`);

export const markAlertRead = (id) =>
  apiFetch(`/api/conduit/alerts/${id}/read`, { method: 'PATCH' });

export const getSMSPreviews = () => apiFetch('/api/conduit/sms-preview');

export const sendBroadcastAlert = (alertData) =>
  apiFetch('/api/conduit/broadcast', { method: 'POST', body: JSON.stringify(alertData) });

export const getConduitGatewayStatus = () => apiFetch('/api/conduit/gateway-status');

// ─── Farmers & Farms ──────────────────────────────────────────────────────────
export const getFarmers = () => apiFetch('/api/farmers');
export const getFarms = () => apiFetch('/api/farmers/farms');
export const getFarm = (id) => apiFetch(`/api/farmers/farms/${id}`);
export const getSensors = (farmId) =>
  apiFetch(`/api/farmers/sensors${farmId ? `?farm_id=${farmId}` : ''}`);

// ─── Sync & Hybrid Database (Supabase + SQLite3) ──────────────────────────────
export const getSyncStatus = () => apiFetch('/api/sync/status');
export const triggerTwoWaySync = () =>
  apiFetch('/api/sync/two-way', { method: 'POST' });
export const queueSampleReading = () =>
  apiFetch('/api/sync/queue-sample', { method: 'POST' });

// ─── Feedback / SUS ───────────────────────────────────────────────────────────
export const getSUSQuestions = () => apiFetch('/api/feedback/questions');
export const submitFeedback = (data) =>
  apiFetch('/api/feedback/submit', { method: 'POST', body: JSON.stringify(data) });
export const getFeedbackResults = () => apiFetch('/api/feedback/results');
