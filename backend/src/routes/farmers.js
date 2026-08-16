const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../db/sqlite');

const router = express.Router();

// GET /api/farmers — list all registered farmers from SQLite3
router.get('/', authMiddleware, (req, res) => {
  try {
    const farmers = db.prepare("SELECT * FROM users WHERE role = 'farmer'").all();
    
    // Attach farm IDs for each farmer
    const enriched = farmers.map((f) => {
      const userFarms = db.prepare('SELECT farm_id FROM farms WHERE owner_id = ?').all(f.user_id);
      const { password_hash: _pw, ...safeFarmer } = f;
      return {
        ...safeFarmer,
        specialization: f.specialization || 'Crop Cultivation & Farming',
        farm_ids: userFarms.map((row) => row.farm_id),
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching farmers:', err.message);
    res.status(500).json({ error: 'Failed to fetch farmers list', detail: err.message });
  }
});

// GET /api/farmers/farms — farms list
router.get('/farms', authMiddleware, (req, res) => {
  try {
    let farmsList;
    if (req.user.role === 'admin' || req.user.role === 'expert') {
      farmsList = db.prepare('SELECT * FROM farms').all();
    } else {
      farmsList = db.prepare('SELECT * FROM farms WHERE owner_id = ?').all(req.user.user_id);
    }

    // Format crop_types from CSV
    const formatted = farmsList.map((f) => {
      const farmSensors = db.prepare('SELECT sensor_id FROM sensors WHERE farm_id = ?').all(f.farm_id);
      return {
        farm_id: f.farm_id,
        name: f.name,
        owner_id: f.owner_id,
        size: f.size_hectares,
        size_unit: 'hectares',
        crop_types: (f.crop_types_csv || 'corn,vegetables').split(','),
        soil_type: f.soil_type,
        elevation_m: f.elevation_m || 380,
        status: f.status || 'active',
        established: '2020-01-01',
        location: {
          barangay: f.barangay,
          municipality: f.municipality || 'Tupi',
          province: f.province || 'South Cotabato',
          lat: f.latitude,
          lng: f.longitude,
        },
        sensors: farmSensors.map((s) => s.sensor_id),
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching farms:', err.message);
    res.status(500).json({ error: 'Failed to fetch farms', detail: err.message });
  }
});

// GET /api/farmers/farms/:id — single farm
router.get('/farms/:id', authMiddleware, (req, res) => {
  try {
    const f = db.prepare('SELECT * FROM farms WHERE farm_id = ?').get(req.params.id);
    if (!f) return res.status(404).json({ error: 'Farm not found' });

    const owner = db.prepare('SELECT user_id, name, username, contact FROM users WHERE user_id = ?').get(f.owner_id);
    const farmSensors = db.prepare('SELECT * FROM sensors WHERE farm_id = ?').all(f.farm_id);

    res.json({
      farm_id: f.farm_id,
      name: f.name,
      owner_id: f.owner_id,
      size: f.size_hectares,
      size_unit: 'hectares',
      crop_types: (f.crop_types_csv || 'corn,vegetables').split(','),
      soil_type: f.soil_type,
      elevation_m: f.elevation_m || 380,
      status: f.status || 'active',
      established: '2020-01-01',
      location: {
        barangay: f.barangay,
        municipality: f.municipality || 'Tupi',
        province: f.province || 'South Cotabato',
        lat: f.latitude,
        lng: f.longitude,
      },
      sensors: farmSensors,
      owner: owner || { name: 'Juan Dela Cruz', contact: '09171234567' },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farm', detail: err.message });
  }
});

// GET /api/farmers/sensors — sensors for farm
router.get('/sensors', authMiddleware, (req, res) => {
  try {
    const farmId = req.query.farm_id || 'f1';
    const sensorsList = db.prepare('SELECT * FROM sensors WHERE farm_id = ?').all(farmId);

    const withReadings = sensorsList.map((s) => ({
      ...s,
      latest_value: s.type === 'soil_moisture' ? '62.4' :
                    s.type === 'temperature' ? '28.5' :
                    'N:35/P:25/K:30',
      last_reading: s.last_reading || new Date().toISOString(),
      battery_pct: s.battery_pct || 90,
      status: s.status || 'online',
    }));

    res.json(withReadings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sensors', detail: err.message });
  }
});

module.exports = router;
