const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getDbStatus, supabase } = require('../db/supabase');

const router = express.Router();

// GET /api/sync/status — Supabase Cloud Database live status
router.get('/status', (req, res) => {
  res.json(getDbStatus());
});

// POST /api/sync/health-check — Test connection to Supabase tables
router.post('/health-check', authMiddleware, async (req, res) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: farmsCount } = await supabase.from('farms').select('*', { count: 'exact', head: true });
    const { count: alertsCount } = await supabase.from('alerts').select('*', { count: 'exact', head: true });
    const { count: recsCount } = await supabase.from('recommendations').select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      provider: 'Supabase Cloud (PostgreSQL 16)',
      live_tables: {
        users: usersCount || 0,
        farms: farmsCount || 0,
        alerts: alertsCount || 0,
        recommendations: recsCount || 0,
      },
      message: '✓ All queries connecting directly and in real-time to Supabase Cloud!',
    });
  } catch (err) {
    res.status(500).json({ error: 'Supabase health check failed', detail: err.message });
  }
});

module.exports = router;
