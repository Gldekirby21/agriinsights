const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { users, farms, sensors } = require('../data/mockData');

const router = express.Router();

// GET /api/farmers — list all farmers (expert/admin only)
router.get('/', authMiddleware, (req, res) => {
  const farmerList = users
    .filter((u) => u.role === 'farmer')
    .map(({ password: _pw, ...u }) => u);
  res.json(farmerList);
});

// GET /api/farmers/farms — farms for current user
router.get('/farms', authMiddleware, (req, res) => {
  const userFarms = farms.filter((f) =>
    req.user.role === 'admin' || req.user.role === 'expert'
      ? true
      : req.user.farm_ids.includes(f.farm_id)
  );
  res.json(userFarms);
});

// GET /api/farmers/farms/:id — single farm
router.get('/farms/:id', authMiddleware, (req, res) => {
  const farm = farms.find((f) => f.farm_id === req.params.id);
  if (!farm) return res.status(404).json({ error: 'Farm not found' });
  const farmSensors = sensors.filter((s) => s.farm_id === farm.farm_id);
  const owner = users.find((u) => u.user_id === farm.owner_id);
  const { password: _pw, ...safeOwner } = owner || {};
  res.json({ ...farm, sensors: farmSensors, owner: safeOwner });
});

// GET /api/farmers/sensors — sensors for current farm
router.get('/sensors', authMiddleware, (req, res) => {
  const farmId = req.query.farm_id;
  const farmSensors = farmId ? sensors.filter((s) => s.farm_id === farmId) : sensors;
  const withReadings = farmSensors.map((s) => ({
    ...s,
    latest_value: s.type === 'soil_moisture' ? (Math.random() * 30 + 50).toFixed(1) :
                  s.type === 'temperature' ? (Math.random() * 5 + 27).toFixed(1) :
                  `N:${Math.round(Math.random()*20+35)}/P:${Math.round(Math.random()*15+25)}/K:${Math.round(Math.random()*25+30)}`,
    last_reading: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString(),
    battery_pct: s.sensor_id === 's4' ? 12 : Math.round(Math.random() * 40 + 60),
    status: s.sensor_id === 's4' ? 'low_battery' : 'online',
  }));
  res.json(withReadings);
});

module.exports = router;
