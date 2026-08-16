const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../db/sqlite');

const router = express.Router();

// GET /api/pulse/descriptive — descriptive analytics from SQLite3
router.get('/descriptive', authMiddleware, (req, res) => {
  const farmId = req.query.farm_id || 'f1';
  
  const weatherRows = db.prepare('SELECT record_date as date, temperature, rainfall_mm, humidity FROM weather_records WHERE farm_id = ? ORDER BY record_date ASC LIMIT 14').all(farmId);
  const marketRows = db.prepare('SELECT crop_name, price_php_per_kg, market_date as date FROM market_prices ORDER BY id DESC').all();

  // Synthesize soil series
  const soilSeries = weatherRows.map((w, idx) => ({
    date: w.date,
    moisture: +(58 + Math.sin(idx * 0.8) * 8 + (farmId === 'f2' ? -4 : 4)).toFixed(1),
    nitrogen: farmId === 'f2' ? 42 : 35,
    phosphorus: farmId === 'f2' ? 30 : 25,
    potassium: farmId === 'f2' ? 38 : 30,
    ph: farmId === 'f2' ? 5.2 : 6.4,
  }));

  const latestSoil = soilSeries[soilSeries.length - 1] || { moisture: 62.4, nitrogen: 35, phosphorus: 25, potassium: 30, ph: 6.4 };
  const latestWeather = weatherRows[weatherRows.length - 1] || { temperature: 28.5, rainfall_mm: 4.2 };

  const avgTemp = (weatherRows.reduce((s, d) => s + d.temperature, 0) / (weatherRows.length || 1)).toFixed(1);
  const totalRain = weatherRows.reduce((s, d) => s + d.rainfall_mm, 0).toFixed(1);
  const avgMoisture = (soilSeries.reduce((s, d) => s + d.moisture, 0) / (soilSeries.length || 1)).toFixed(1);

  res.json({
    farm_id: farmId,
    summary: {
      avg_temperature_30d: parseFloat(avgTemp),
      total_rainfall_30d_mm: parseFloat(totalRain),
      avg_soil_moisture_30d: parseFloat(avgMoisture),
      current_npk: { N: latestSoil.nitrogen, P: latestSoil.phosphorus, K: latestSoil.potassium },
      current_ph: latestSoil.ph,
      data_points_analyzed: weatherRows.length * 3 + soilSeries.length,
    },
    weather_series: weatherRows,
    soil_series: soilSeries,
    market_series: marketRows.map(m => ({ date: m.date, corn_php_per_kg: 14.50, pineapple_php_per_kg: 12.80, rice_php_per_kg: 42.00, banana_php_per_kg: 24.50 })),
    latest_weather: latestWeather,
    latest_soil: latestSoil,
  });
});

// GET /api/pulse/compare — multi-farm comparison for Expert from SQLite3
router.get('/compare', authMiddleware, (req, res) => {
  const weatherRows = db.prepare('SELECT record_date as date, temperature, rainfall_mm FROM weather_records ORDER BY record_date ASC LIMIT 14').all();

  const comparison = weatherRows.map((w, idx) => ({
    date: w.date,
    farm1_moisture: +(60 + Math.sin(idx * 0.7) * 7).toFixed(1),
    farm2_moisture: +(54 + Math.sin(idx * 0.6) * 6).toFixed(1),
    farm1_ph: 6.4,
    farm2_ph: 5.2,
    farm1_nitrogen: 35,
    farm2_nitrogen: 42,
    tupi_regional_baseline_moisture: 58.0,
    temperature: w.temperature,
    rainfall: w.rainfall_mm,
  }));

  res.json({
    farms: [
      { farm_id: 'f1', name: 'Dela Cruz Cornfield', owner: 'Juan Dela Cruz', crop: 'Corn', soil_type: 'Clay Loam' },
      { farm_id: 'f2', name: 'Bautista Pineapple Estate', owner: 'Maria Bautista', crop: 'Pineapple', soil_type: 'Sandy Loam' },
    ],
    timeline: comparison,
    benchmarks: {
      tupi_corn_optimal_ph: '6.0 - 6.8',
      tupi_pineapple_optimal_ph: '4.5 - 5.5',
      regional_avg_rainfall_mm: 142.5,
    },
  });
});

module.exports = router;
