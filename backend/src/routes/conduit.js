const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { alerts } = require('../data/mockData');

const router = express.Router();

const broadcastMessages = [
  { id: 'sms1', to: '09171234567 (Juan Dela Cruz)', farm: 'Dela Cruz Cornfield', body: '[AgriInsights] ALERTO: Mataas na panganib ng Fall Armyworm sa inyong mais. Mag-spray ng pesticide sa susunod na 48 oras. Para sa tulong: expert1.', sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), delivered: true, channel: 'SMS + Push' },
  { id: 'sms2', to: '09171234567 (Juan Dela Cruz)', farm: 'Dela Cruz Cornfield', body: '[AgriInsights] BABALA: Posibleng malakas na ulan (74%) sa loob ng 3 araw. Suriin ang drainage ng inyong taniman.', sent_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), delivered: true, channel: 'SMS + Push' },
  { id: 'sms3', to: '09189876543 (Maria Bautista)', farm: 'Bautista Pineapple Estate', body: '[AgriInsights] INFO: Presyo ng pinya ngayon: ₱12.50/kg. Magandang pagkakataon para mag-ani.', sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), delivered: true, channel: 'SMS' },
];

// GET /api/conduit/alerts
router.get('/alerts', authMiddleware, (req, res) => {
  const farmId = req.query.farm_id;
  const filtered = farmId ? alerts.filter((a) => a.farm_id === farmId) : alerts;
  const sorted = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({
    alerts: sorted,
    unread_count: sorted.filter((a) => !a.read).length,
  });
});

// POST /api/conduit/broadcast — Expert or Admin sends broadcast notification
router.post('/broadcast', authMiddleware, (req, res) => {
  const { title, message, severity, target_group, send_sms } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const newAlert = {
    alert_id: `a_bc_${Date.now()}`,
    farm_id: target_group === 'f2' ? 'f2' : 'f1',
    severity: severity || 'warning',
    type: 'broadcast',
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    author: req.user.name,
  };
  alerts.unshift(newAlert);

  if (send_sms) {
    broadcastMessages.unshift({
      id: `sms_${Date.now()}`,
      to: target_group === 'all' ? 'All Registered Farmers (30)' : 'Dela Cruz (09171234567)',
      farm: target_group === 'all' ? 'All Pilot Farms' : 'Selected Farm',
      body: `[AgriInsights Advisory] ${title.toUpperCase()}: ${message}`,
      sent_at: new Date().toISOString(),
      delivered: true,
      channel: 'SMS Gateway (Semaphore)',
    });
  }

  res.json({ success: true, alert: newAlert, sms_dispatched: !!send_sms });
});

// PATCH /api/conduit/alerts/:id/read
router.patch('/alerts/:id/read', authMiddleware, (req, res) => {
  const alert = alerts.find((a) => a.alert_id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.read = true;
  res.json({ success: true });
});

// GET /api/conduit/sms-preview — SMS-style alert preview
router.get('/sms-preview', authMiddleware, (req, res) => {
  res.json(broadcastMessages);
});

// GET /api/conduit/gateway-status — Admin gateway status
router.get('/gateway-status', authMiddleware, (req, res) => {
  res.json({
    provider: 'Semaphore PH SMS Gateway & Firebase Cloud Messaging',
    sms_credits_remaining: 1420,
    sms_delivery_rate_pct: 99.4,
    avg_dispatch_latency_ms: 380,
    active_channels: ['SMS (Telco GSM)', 'WebPush Notification', 'Audio Speech Synthesizer'],
    dpa_consent_verified: '100% of participants opted in under RA 10173',
  });
});

module.exports = router;
