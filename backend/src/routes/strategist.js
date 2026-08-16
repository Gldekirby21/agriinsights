const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { recommendations, farms } = require('../data/mockData');

const router = express.Router();

// GET /api/strategist/recommendations
router.get('/recommendations', authMiddleware, (req, res) => {
  const farmId = req.query.farm_id;
  const recs = farmId ? recommendations.filter((r) => r.farm_id === farmId) : recommendations;
  res.json({
    recommendations: recs,
    summary: {
      total: recs.length,
      urgent: recs.filter((r) => r.priority === 'urgent').length,
      moderate: recs.filter((r) => r.priority === 'moderate').length,
      low: recs.filter((r) => r.priority === 'low').length,
      accepted: recs.filter((r) => r.status === 'accepted').length,
    },
  });
});

// POST /api/strategist/create — Expert creates a custom recommendation
router.post('/create', authMiddleware, (req, res) => {
  const { farm_id, category, priority, title, description, estimated_cost_php, expected_benefit } = req.body;
  if (!farm_id || !title || !description) {
    return res.status(400).json({ error: 'Missing required recommendation fields' });
  }

  const newRec = {
    rec_id: `r_exp_${Date.now()}`,
    farm_id,
    category: category || 'fertilizer',
    priority: priority || 'moderate',
    title,
    description,
    estimated_cost_php: Number(estimated_cost_php) || 0,
    expected_benefit: expected_benefit || 'Custom expert prescription issued by Dr. Reyes',
    status: 'pending',
    date_generated: new Date().toISOString(),
    created_by: req.user.name || 'Agri Expert',
    icon: category === 'pest' ? 'bug' : category === 'irrigation' ? 'droplets' : category === 'planting' ? 'sprout' : 'flask',
  };

  recommendations.unshift(newRec);
  res.json({ success: true, recommendation: newRec });
});

// PATCH /api/strategist/recommendations/:id/status
router.patch('/recommendations/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rec = recommendations.find((r) => r.rec_id === id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
  rec.status = status;
  res.json({ success: true, recommendation: rec });
});

// GET /api/strategist/audit — Admin economic impact audit
router.get('/audit', authMiddleware, (req, res) => {
  const totalCost = recommendations.reduce((s, r) => s + (r.estimated_cost_php || 0), 0);
  const accepted = recommendations.filter(r => r.status === 'accepted').length;
  res.json({
    total_recommendations_issued: recommendations.length,
    acceptance_rate_pct: Math.round((accepted / recommendations.length) * 100),
    total_farmer_investments_php: totalCost,
    estimated_net_yield_gain_php: 48500,
    roi_multiple: 4.8,
    compliance_audit: '100% compliant with Bureau of Plant Industry (BPI) guidelines',
  });
});

module.exports = router;
