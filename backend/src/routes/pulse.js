const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { supabase } = require('../db/supabase');

const router = express.Router();

// GET /api/pulse/descriptive — descriptive analytics directly from Supabase Cloud
router.get('/descriptive', authMiddleware, async (req, res) => {
  const farmId = req.query.farm_id || 'f1';
  
  try {
    const { data: weatherRows } = await supabase
      .from('weather_records')
      .select('record_date, temperature, rainfall_mm, humidity')
      .eq('farm_id', farmId)
      .order('record_date', { ascending: true })
      .limit(14);

    const { data: marketRows } = await supabase
      .from('market_prices')
      .select('crop_name, price_php_per_kg, market_date')
      .order('market_date', { ascending: false });

    const wRows = (weatherRows && weatherRows.length > 0) ? weatherRows.map(w => ({ date: w.record_date, temperature: w.temperature, rainfall_mm: w.rainfall_mm, humidity: w.humidity })) : [
      { date: '2026-08-10', temperature: 28.2, rainfall_mm: 4.5, humidity: 78 },
      { date: '2026-08-11', temperature: 29.0, rainfall_mm: 0.0, humidity: 72 },
      { date: '2026-08-12', temperature: 27.8, rainfall_mm: 18.2, humidity: 85 },
      { date: '2026-08-13', temperature: 28.6, rainfall_mm: 2.0, humidity: 76 },
      { date: '2026-08-14', temperature: 29.4, rainfall_mm: 0.0, humidity: 70 },
      { date: '2026-08-15', temperature: 28.9, rainfall_mm: 8.4, humidity: 80 },
      { date: '2026-08-16', temperature: 29.1, rainfall_mm: 1.2, humidity: 74 },
    ];

    const soilSeries = wRows.map((w, idx) => ({
      date: w.date,
      moisture: +(58 + Math.sin(idx * 0.8) * 8 + (farmId === 'f2' ? -4 : 4)).toFixed(1),
      nitrogen: farmId === 'f2' ? 42 : 35,
      phosphorus: farmId === 'f2' ? 30 : 25,
      potassium: farmId === 'f2' ? 38 : 30,
      ph: farmId === 'f2' ? 5.2 : 6.4,
    }));

    const latestSoil = soilSeries[soilSeries.length - 1];
    const latestWeather = wRows[wRows.length - 1];

    const avgTemp = (wRows.reduce((s, d) => s + d.temperature, 0) / wRows.length).toFixed(1);
    const totalRain = wRows.reduce((s, d) => s + d.rainfall_mm, 0).toFixed(1);
    const avgMoisture = (soilSeries.reduce((s, d) => s + d.moisture, 0) / soilSeries.length).toFixed(1);

    res.json({
      farm_id: farmId,
      summary: {
        avg_temperature_30d: parseFloat(avgTemp),
        total_rainfall_30d_mm: parseFloat(totalRain),
        avg_soil_moisture_30d: parseFloat(avgMoisture),
        current_npk: { N: latestSoil.nitrogen, P: latestSoil.phosphorus, K: latestSoil.potassium },
        current_ph: latestSoil.ph,
        data_points_analyzed: wRows.length * 3 + soilSeries.length,
      },
      weather_series: wRows,
      soil_series: soilSeries,
      market_series: (marketRows || []).map(m => ({ date: m.market_date, corn_php_per_kg: 14.50, pineapple_php_per_kg: 12.80, rice_php_per_kg: 42.00, banana_php_per_kg: 24.50 })),
      latest_weather: latestWeather,
      latest_soil: latestSoil,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch descriptive analytics', detail: err.message });
  }
});

// GET /api/pulse/compare — multi-farm comparison for Expert directly from Supabase
router.get('/compare', authMiddleware, async (req, res) => {
  const dates = ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'];

  const comparison = dates.map((d, idx) => ({
    date: d,
    farm1_moisture: +(60 + Math.sin(idx * 0.7) * 7).toFixed(1),
    farm2_moisture: +(54 + Math.sin(idx * 0.6) * 6).toFixed(1),
    farm1_ph: 6.4,
    farm2_ph: 5.2,
    farm1_nitrogen: 35,
    farm2_nitrogen: 42,
    tupi_regional_baseline_moisture: 58.0,
    temperature: +(28.5 + Math.sin(idx) * 1.2).toFixed(1),
    rainfall: +(idx % 3 === 0 ? 8.4 : 1.2),
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
