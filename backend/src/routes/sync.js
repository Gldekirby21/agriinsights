const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getSyncStatus, twoWaySync, pushLocalToCloud, pullCloudToLocal } = require('../db/supabase');
const { queueChange, db } = require('../db/sqlite');

const router = express.Router();

// GET /api/sync/status — Hybrid Offline/Cloud sync status
router.get('/status', (req, res) => {
  res.json(getSyncStatus());
});

// POST /api/sync/two-way — Complete 2-Way Sync (Cloud ⇄ Local SQLite3)
router.post('/two-way', authMiddleware, async (req, res) => {
  try {
    const result = await twoWaySync();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '2-Way Sync failed', detail: err.message });
  }
});

// POST /api/sync/trigger — Trigger upload push from SQLite to Supabase
router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const result = await pushLocalToCloud();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Push sync failed', detail: err.message });
  }
});

// POST /api/sync/pull — Trigger download pull from Supabase to SQLite
router.post('/pull', authMiddleware, async (req, res) => {
  try {
    const result = await pullCloudToLocal();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Pull sync failed', detail: err.message });
  }
});

// POST /api/sync/queue-sample — Queue an offline reading sample for testing
router.post('/queue-sample', authMiddleware, (req, res) => {
  const sampleReading = {
    farm_id: 'f1',
    sensor_id: 's1',
    sensor_type: 'soil_moisture',
    value: parseFloat((Math.random() * 20 + 50).toFixed(1)),
    unit: '%',
    recorded_at: new Date().toISOString(),
  };

  queueChange('sensor_readings', `s1_${Date.now()}`, 'INSERT', sampleReading);

  res.json({
    success: true,
    message: 'Sample sensor reading saved to local SQLite3 and queued for Supabase cloud sync.',
    queued_item: sampleReading,
  });
});

module.exports = router;
