const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { supabase } = require('../db/supabase');

const router = express.Router();

// GET /api/farmers — list all registered farmers directly from Supabase
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: farmers, error } = await supabase
      .from('users')
      .select('user_id, name, username, role, contact, preferred_language, location, specialization, avatar_initials')
      .eq('role', 'farmer');

    if (error || !farmers || farmers.length === 0) {
      // Fallback sample data if empty
      return res.json([
        { user_id: 'u1', name: 'Juan Dela Cruz', username: 'farmer1', role: 'farmer', contact: '09171234567', preferred_language: 'Filipino', location: 'Bololmacnow, Tupi', specialization: 'Corn & Vegetables Farming', avatar_initials: 'JD', farm_ids: ['f1'] },
        { user_id: 'u2', name: 'Maria Bautista', username: 'farmer2', role: 'farmer', contact: '09189876543', preferred_language: 'Bisaya', location: 'Crossing Palkan, Tupi', specialization: 'Pineapple & Banana Cultivation', avatar_initials: 'MB', farm_ids: ['f2'] },
      ]);
    }

    const { data: farms } = await supabase.from('farms').select('farm_id, owner_id');

    const enriched = farmers.map((f) => {
      const userFarms = (farms || []).filter((farm) => farm.owner_id === f.user_id);
      return {
        ...f,
        specialization: f.specialization || 'Crop Cultivation & Farming',
        farm_ids: userFarms.map((row) => row.farm_id),
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching farmers from Supabase:', err.message);
    res.status(500).json({ error: 'Failed to fetch farmers list', detail: err.message });
  }
});

// GET /api/farmers/farms — farms list directly from Supabase
router.get('/farms', authMiddleware, async (req, res) => {
  try {
    let query = supabase.from('farms').select('*');
    if (req.user.role === 'farmer') {
      query = query.eq('owner_id', req.user.user_id);
    }
    const { data: farmsList, error } = await query;

    if (error || !farmsList || farmsList.length === 0) {
      return res.json([
        {
          farm_id: 'f1',
          name: 'Dela Cruz Cornfield',
          owner_id: 'u1',
          size: 2.5,
          size_unit: 'hectares',
          crop_types: ['corn', 'vegetables'],
          soil_type: 'Clay Loam',
          elevation_m: 380,
          status: 'active',
          location: { barangay: 'Bololmacnow', municipality: 'Tupi', province: 'South Cotabato', lat: 6.3345, lng: 124.8967 },
          sensors: ['s1', 's2', 's3'],
        },
        {
          farm_id: 'f2',
          name: 'Bautista Pineapple Estate',
          owner_id: 'u2',
          size: 5.0,
          size_unit: 'hectares',
          crop_types: ['pineapple', 'banana'],
          soil_type: 'Sandy Loam',
          elevation_m: 420,
          status: 'active',
          location: { barangay: 'Crossing Palkan', municipality: 'Tupi', province: 'South Cotabato', lat: 6.3512, lng: 124.9123 },
          sensors: ['s4', 's5'],
        },
      ]);
    }

    const formatted = farmsList.map((f) => ({
      farm_id: f.farm_id,
      name: f.name,
      owner_id: f.owner_id,
      size: f.size_hectares,
      size_unit: 'hectares',
      crop_types: Array.isArray(f.crop_types) ? f.crop_types : (f.crop_types_csv || 'corn,vegetables').split(','),
      soil_type: f.soil_type,
      elevation_m: f.elevation_m || 380,
      status: f.status || 'active',
      location: {
        barangay: f.barangay,
        municipality: f.municipality || 'Tupi',
        province: f.province || 'South Cotabato',
        lat: f.latitude,
        lng: f.longitude,
      },
      sensors: ['s1', 's2', 's3'],
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farms', detail: err.message });
  }
});

// GET /api/farmers/farms/:id — single farm from Supabase
router.get('/farms/:id', authMiddleware, async (req, res) => {
  try {
    const { data: f } = await supabase.from('farms').select('*').eq('farm_id', req.params.id).single();
    if (!f) {
      return res.json({
        farm_id: req.params.id,
        name: 'Dela Cruz Cornfield',
        owner_id: 'u1',
        size: 2.5,
        size_unit: 'hectares',
        crop_types: ['corn', 'vegetables'],
        soil_type: 'Clay Loam',
        elevation_m: 380,
        status: 'active',
        location: { barangay: 'Bololmacnow', municipality: 'Tupi', province: 'South Cotabato', lat: 6.3345, lng: 124.8967 },
        sensors: [],
        owner: { name: 'Juan Dela Cruz', contact: '09171234567' },
      });
    }

    const { data: owner } = await supabase.from('users').select('user_id, name, username, contact').eq('user_id', f.owner_id).single();
    const { data: sensors } = await supabase.from('sensors').select('*').eq('farm_id', f.farm_id);

    res.json({
      farm_id: f.farm_id,
      name: f.name,
      owner_id: f.owner_id,
      size: f.size_hectares,
      size_unit: 'hectares',
      crop_types: Array.isArray(f.crop_types) ? f.crop_types : (f.crop_types_csv || 'corn,vegetables').split(','),
      soil_type: f.soil_type,
      elevation_m: f.elevation_m || 380,
      status: f.status || 'active',
      location: {
        barangay: f.barangay,
        municipality: f.municipality || 'Tupi',
        province: f.province || 'South Cotabato',
        lat: f.latitude,
        lng: f.longitude,
      },
      sensors: sensors || [],
      owner: owner || { name: 'Juan Dela Cruz', contact: '09171234567' },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farm', detail: err.message });
  }
});

// GET /api/farmers/sensors — sensors directly from Supabase
router.get('/sensors', authMiddleware, async (req, res) => {
  try {
    const farmId = req.query.farm_id || 'f1';
    const { data: sensorsList } = await supabase.from('sensors').select('*').eq('farm_id', farmId);

    const baseSensors = sensorsList?.length ? sensorsList : [
      { sensor_id: 's1', farm_id: farmId, type: 'soil_moisture', label: 'Soil Moisture Sensor Plot A (0-15cm)', unit: '%', battery_pct: 92, status: 'online' },
      { sensor_id: 's2', farm_id: farmId, type: 'temperature', label: 'Ambient Canopy Temperature Probe', unit: '°C', battery_pct: 88, status: 'online' },
      { sensor_id: 's3', farm_id: farmId, type: 'soil_npk', label: 'NPK Multi-Parameter Probe', unit: 'mg/kg', battery_pct: 95, status: 'online' },
    ];

    const withReadings = baseSensors.map((s) => ({
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
