const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { dataSources, weatherSeries, soilSeriesFarm1, marketSeries, DAYS } = require('../data/mockData');

const router = express.Router();

// GET /api/nexus/data — fused dataset overview
router.get('/data', authMiddleware, (req, res) => {
  const latest = {
    weather: weatherSeries[weatherSeries.length - 1],
    soil: soilSeriesFarm1[soilSeriesFarm1.length - 1],
    market: marketSeries[marketSeries.length - 1],
    fused_at: new Date().toISOString(),
    total_records: weatherSeries.length + soilSeriesFarm1.length + marketSeries.length,
    data_quality_score: 94.3,
  };
  res.json({
    sources: dataSources,
    latest_fused: latest,
    pipeline_status: 'healthy',
    records_ingested_today: 1754,
    anomalies_detected: 2,
  });
});

// GET /api/nexus/sources — data source status
router.get('/sources', authMiddleware, (req, res) => {
  res.json(dataSources);
});

// GET /api/nexus/logs — recent ingestion logs
router.get('/logs', authMiddleware, (req, res) => {
  const logs = [
    { time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), source: 'IoT Sensors', event: 'Batch ingested (Farm F1 & F2)', records: 60, status: 'success' },
    { time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), source: 'PAGASA Weather API', event: 'Fetch complete (Station #TUP-04)', records: 12, status: 'success' },
    { time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), source: 'Sentinel-2 Satellite', event: 'Cloud cover 22% — optical NDVI computed', records: 1, status: 'success' },
    { time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), source: 'DA Region XII Market Feed', event: 'Daily price update received', records: 8, status: 'success' },
    { time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), source: 'IoT Sensors', event: 'Sensor S4 anomaly flagged (moisture spike)', records: 1, status: 'anomaly' },
    { time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), source: 'PhilRice Soil DB', event: 'Reference sync complete', records: 0, status: 'success' },
  ];
  res.json(logs);
});

// POST /api/nexus/sync — trigger manual pipeline sync (Expert / Admin)
router.post('/sync', authMiddleware, (req, res) => {
  const source = req.body.source || 'all';
  res.json({
    success: true,
    message: `Manual sync triggered for source: ${source}`,
    synced_at: new Date().toISOString(),
    records_added: Math.floor(Math.random() * 40 + 15),
    latency_ms: 142,
  });
});

// GET /api/nexus/telemetry — Admin pipeline diagnostics
router.get('/telemetry', authMiddleware, (req, res) => {
  res.json({
    broker: { type: 'MQTT / Mosquitto', host: 'mqtt.agriinsights.seait.edu.ph', port: 8883, status: 'connected', clients_active: 5 },
    throughput_records_per_min: 72,
    api_gateway_latency_ms: 18,
    storage: { database: 'TimescaleDB (PostgreSQL 16)', size_mb: 284.6, retention_days: 365, row_count: 89420 },
    data_quality: { completeness: 98.2, accuracy: 96.5, timeliness: 99.1, consistency: 94.8 },
  });
});

module.exports = router;
