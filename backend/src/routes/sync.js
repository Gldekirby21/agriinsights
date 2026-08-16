const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getSyncStatus, syncOfflineQueueToSupabase } = require('../db/supabase');
const { queueChange, db } = require('../db/sqlite');

const router = express.Router();

// GET /api/sync/status — Hybrid Offline/Cloud sync status
router.get('/status', (req, res) => {
  res.json(getSyncStatus());
});

// POST /api/sync/trigger — Trigger sync from SQLite to Supabase
router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const result = await syncOfflineQueueToSupabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', detail: err.message });
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
